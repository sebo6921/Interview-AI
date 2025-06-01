import React, { useRef, useEffect, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faSpinner, faVideo, faCog, faVolumeMute } from '@fortawesome/free-solid-svg-icons';
import { useLocation } from 'react-router-dom';  // Add this import at the top

// Define the system prompt content as a string literal here to match the backend
const INTERVIEW_AI_SYSTEM_PROMPT_STRING_LITERAL = "You are an AI designed to role-play as an experienced Google technical interviewer. Your purpose is to help a user practice for a behavioral interview in a structured and fair manner.Follow these rules strictly for each turn:- Begin with a friendly greeting and inquire about the candidate's well-being.- Immediately follow with a behavioral question. - After each candidate response: - Offer exactly ONE sentence of brief, objective feedback. - Then, ask exactly ONE follow-up question, or transition to a new behavioral question. - Ensure your entire response is under 2 sentences and does not contain multiple sub-questions or lists. - Avoid any elaboration or additional explanations. - After precisely 5 questions have been asked, conclude the interview by thanking the candidate.Your tone should be professional, concise, and strictly adhere to all structural constraints."
const InterviewPage = () => {
    const location = useLocation();
    const { name, company } = location.state || {};
    const videoRef = useRef(null);
    const transcriptContentRef = useRef(null);
    const [error, setError] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [fullDialogueHistory, setFullDialogueHistory] = useState([]);
    const [isLoadingAIResponse, setIsLoadingAIResponse] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);

    const interviewerName = "AI Interviewer";
    const userName = name;

    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    const API_BASE_URL = "http://localhost:8000";

    // Helper function to process history coming from the backend
    const processBackendHistory = (history) => {
        return history
            .filter(entry => {
                // Filter out system prompts and initial setup messages
                return !(entry.role === 'system' || 
                       (entry.role === 'user' && 
                        entry.content?.includes(INTERVIEW_AI_SYSTEM_PROMPT_STRING_LITERAL.substring(0, 50))));
            })
            .map(entry => ({
                speaker: entry.role === 'assistant' ? interviewerName : userName,
                text: entry.content,
                timestamp: Date.now()
            }));
    };

    // Helper function to play audio and manage speech recognition
    const playAudioAndManageSpeechRec = async (audioBase64) => {
        return new Promise((resolve) => {
            if (audioBase64 && !isPlaying) {
                setIsPlaying(true);
                const audio = new Audio(`data:audio/mpeg;base64,${audioBase64}`);

                SpeechRecognition.stopListening();

                audio.onended = () => {
                    SpeechRecognition.startListening({ continuous: true, interimResults: true });
                    setIsPlaying(false);
                    resolve();
                };

                audio.onerror = (e) => {
                    console.error("Audio playback error:", e);
                    SpeechRecognition.startListening({ continuous: true, interimResults: true });
                    setIsPlaying(false);
                    resolve();
                };

                audio.play().catch(error => {
                    console.error("Audio play failed:", error);
                    setIsPlaying(false);
                    resolve();
                });
            } else {
                SpeechRecognition.startListening({ continuous: true, interimResults: true });
                resolve();
            }
        });
    };

    // Duration counter
    useEffect(() => {
        const interval = setInterval(() => {
            setDuration(prev => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Auto-scroll transcript
    useEffect(() => {
        if (transcriptContentRef.current) {
            transcriptContentRef.current.scrollTop = transcriptContentRef.current.scrollHeight;
        }
    }, [fullDialogueHistory, transcript]);

    useEffect(() => {
        let isActive = true;
        
        const setupInterview = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                if (!isActive) return;
                
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    stream.getAudioTracks().forEach(track => (track.enabled = !isMuted));
                }

                setIsLoadingAIResponse(true);
                setApiError(null);
                
                const response = await fetch(`${API_BASE_URL}/api/start-interview`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({name,company}),
                });

                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.detail || `HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                console.log("Initial interview data:", data);
                
                if (data.audio_base64 && data.initial_history) {
                    await playAudioAndManageSpeechRec(data.audio_base64);
                    setFullDialogueHistory(processBackendHistory(data.initial_history));
                } else {
                    throw new Error("Invalid response format from server");
                }

            } catch (err) {
                if (!isActive) return;
                console.error("Setup error:", err);
                setApiError(`Failed to start interview: ${err.message}`);
                setError('Unable to start interview. Please check your connection and try again.');
            } finally {
                if (isActive) {
                    setIsLoadingAIResponse(false);
                }
            }
        };

        setupInterview();

        return () => {
            isActive = false;
            SpeechRecognition.stopListening();
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
            resetTranscript();
        };
    }, []);

    useEffect(() => {
        if (videoRef.current && videoRef.current.srcObject) {
            const audioTracks = videoRef.current.srcObject.getAudioTracks();
            audioTracks.forEach(track => (track.enabled = !isMuted));
        }
    }, [isMuted]);

    const toggleMute = () => {
        setIsMuted(prevIsMuted => {
            const newMuteState = !prevIsMuted;
            if (newMuteState) {
                SpeechRecognition.stopListening();
            } else {
                SpeechRecognition.startListening({ continuous: true, interimResults: true });
            }
            return newMuteState;
        });
    };
    const cameraToggle = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const videoTracks = videoRef.current.srcObject.getVideoTracks();
            videoTracks.forEach(track => {
                track.enabled = !track.enabled;
            });
            const isCameraOn = videoTracks.some(track => track.enabled);
            console.log(`Camera is now ${isCameraOn ? 'ON' : 'OFF'}`);
        }
    };
    const handleSendAnswer = async () => {
        if (transcript.trim() === "") {
            console.warn("No transcript to send. Please speak your answer.");
            return;
        }

        const currentAnswerToProcess = transcript;
        resetTranscript(); // Reset transcript immediately
        setIsLoadingAIResponse(true);
        setApiError(null);

        try {
            const historyForBackend = fullDialogueHistory.map(entry => ({
                role: entry.speaker === userName ? "user" : "assistant",
                content: entry.text
            }));
            
            // Add current answer to backend history
            historyForBackend.push({ 
                role: "user", 
                content: currentAnswerToProcess
            });

            const response = await fetch(`${API_BASE_URL}/api/generate-answer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_message: currentAnswerToProcess,
                    history: historyForBackend
                }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || `HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            
            // Update history directly from backend response
            setFullDialogueHistory(processBackendHistory(data.updated_history));
            await playAudioAndManageSpeechRec(data.audio_base64);

        } catch (err) {
            console.error("API call error:", err);
            setApiError(err.message);
            // Add error message to history
            setFullDialogueHistory(prev => [...prev, { 
                speaker: interviewerName, 
                text: `(Error: ${err.message})`,
                timestamp: Date.now()
            }]);
        } finally {
            setIsLoadingAIResponse(false);
        }
    };

    const formatDuration = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    // Update formatTimestamp to accept a specific timestamp
    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', { 
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    if (error) {
        return <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>{error}</div>;
    }

    if (!browserSupportsSpeechRecognition) {
        return <span style={{ textAlign: 'center', padding: '20px', color: 'white' }}>Your browser doesn't support speech recognition. Please try Chrome or Edge.</span>;
    }

    const styles = {
        container: {
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            background: '#1a1a1a',
            color: '#ffffff',
            minHeight: '100vh',
            lineHeight: '1.5',
            maxWidth: '1470px',
            margin: '0 auto',
        padding: '10px 20px 50px 20px', // Reduced top padding, keep other paddings
            display: 'flex',
            flexDirection: 'column'
        },
        header: {
            textAlign: 'left',
            marginBottom: '32px',
            paddingBottom: '2px',
            borderBottom: '2px solid #333',
            position: 'sticky',  // Add this
            top: 0,             // Add this
            background: '#1a1a1a', // Add this
            padding: '10px 0'    // Add this
        },
        headerText: {
            fontSize: '1.8rem',  // Reduced from 2.5rem
            fontWeight: '600',
            color: '#ffffff',
            letterSpacing: '-0.5px',
            margin: 0,
            display: 'flex',    // Add this
            alignItems: 'center' // Add this
        },
        mainContent: {
            
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 400px',
            gap: '32px',
            flex: 1,
            minHeight: 0
        },
        videoContainer: {
            background: '#2a2a2a',
            borderRadius: '8px',
            border: '1px solid #404040',
            overflow: 'hidden',
            minHeight: '400px',
            display: 'flex',
            flexDirection: 'column'
        },
        videoPlaceholder: {
            flex: 1,
            background: '#333333',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            borderBottom: '1px solid #404040'
        },
        video: {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: 'scaleX(-1)',
            position: 'relative',
            zIndex: 1
        },
        videoLabel: {
            position: 'absolute',
            top: '12px',
            left: '16px',
            background: 'rgba(0, 0, 0, 0.75)',
            padding: '4px 12px',
            borderRadius: '4px',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#ffffff',
            zIndex: 2
        },
        controls: {
            padding: '16px 20px',
            background: '#242424',
            display: 'flex',
            justifyContent: 'center',
            gap: '12px'
        },
        controlBtn: {
            background: '#404040',
            border: '1px solid #555555',
            borderRadius: '6px',
            width: '40px',
            height: '40px',
            color: '#ffffff',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.1rem'
        },
        transcriptSection: {
            background: '#2a2a2a',
            borderRadius: '8px',
            border: '1px solid #404040',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        },
        transcriptHeader: {
            padding: '20px 24px',
            background: '#242424',
            borderBottom: '1px solid #404040'
        },
        transcriptHeaderTitle: {
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#ffffff',
            marginBottom: '4px'
        },
        transcriptSubtitle: {
            fontSize: '0.875rem',
            color: '#aaaaaa'
        },
        transcriptContent: {
            flex: 1,
            padding: '20px 24px',
            overflowY: 'auto',
            maxHeight: '400px'
        },
        transcriptEntry: {
            marginBottom: '20px',
            padding: '16px',
            borderRadius: '6px',
            background: '#333333',
            borderLeft: '4px solid transparent'
        },
        transcriptEntryInterviewer: {
            borderLeftColor: '#0078d4',
            background: '#2d3748'
        },
        transcriptEntryCandidate: {
            borderLeftColor: '#28a745',
            background: '#2d4a32'
        },
        speaker: {
            fontWeight: '600',
            fontSize: '0.875rem',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
        },
        speakerInterviewer: {
            color: '#4da6ff'
        },
        speakerCandidate: {
            color: '#5cb85c'
        },
        message: {
            lineHeight: '1.6',
            color: '#e6e6e6',
            fontSize: '0.9rem'
        },
        timestamp: {
            fontSize: '0.75rem',
            color: '#888888',
            marginTop: '8px',
            fontFamily: "'Courier New', monospace"
        },
        statusBar: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 24px',
            background: '#242424',
            borderTop: '1px solid #404040',
            fontSize: '0.875rem'
        },
        statusIndicator: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        },
        statusDot: {
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: listening ? '#28a745' : '#6c757d'
        },
        duration: {
            color: '#aaaaaa',
            fontFamily: "'Courier New', monospace"
        },
        currentTranscript: {
            padding: '12px 16px',
            background: '#1e1e1e',
            borderRadius: '6px',
            marginBottom: '16px',
            borderLeft: '4px solid #ffc107'
        },
        sendButton: {
            margin: '20px auto 0',
            backgroundColor: isLoadingAIResponse ? '#6c757d' : '#007bff',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '6px',
            fontSize: '1rem',
            fontWeight: '600',
            border: 'none',
            cursor: isLoadingAIResponse ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
        },
        placeholderIcon: {
            fontSize: '4rem',
            color: '#666666'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.headerText}>🗣️  Interview AI </h1>
            </div>
            
            <div style={styles.mainContent}>
                <div style={styles.videoContainer}>
                    <div style={styles.videoPlaceholder}>
                        <div style={styles.videoLabel}>{interviewerName}</div>
                        <div style={styles.placeholderIcon}>👨‍💼</div>
                    </div>
                    <div style={styles.controls}>
                        <button style={styles.controlBtn} title="AI Settings">
                            <FontAwesomeIcon icon={faCog} />
                        </button>
                    </div>
                </div>
                
                <div style={styles.videoContainer}>
                    <div style={styles.videoPlaceholder}>
                        <div style={styles.videoLabel}>{userName}</div>
                        <video ref={videoRef} autoPlay playsInline muted style={styles.video}></video>
                    </div>
                    <div style={styles.controls}>
                        <button 
                            style={{
                                ...styles.controlBtn,
                                background: isMuted ? '#dc3545' : '#28a745'
                            }} 
                            onClick={toggleMute}
                            title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
                        >
                            <FontAwesomeIcon icon={faMicrophone} />
                        </button>
                        <button onClick={cameraToggle} style={styles.controlBtn} title="Toggle Camera">
                            <FontAwesomeIcon icon={faVideo} />
                        </button>
                        <button style={styles.controlBtn} title="Settings">
                            <FontAwesomeIcon icon={faCog} />
                        </button>
                    </div>
                </div>
                
                <div style={styles.transcriptSection}>
                    <div style={styles.transcriptHeader}>
                        <h2 style={styles.transcriptHeaderTitle}>Interview Transcript</h2>
                        <div style={styles.transcriptSubtitle}>Live conversation log</div>
                    </div>
                    
                    <div style={styles.transcriptContent} ref={transcriptContentRef}>
                        {fullDialogueHistory.length === 0 && !isLoadingAIResponse ? (
                            <div style={styles.message}>Starting interview...</div>
                        ) : (
                            <>
                                {/* Only show current transcript if we're not loading a response */}
                                
                                
                                {fullDialogueHistory.map((entry, index) => (
                                    <div 
                                        key={index} 
                                        style={{
                                            ...styles.transcriptEntry,
                                            ...(entry.speaker === interviewerName ? styles.transcriptEntryInterviewer : styles.transcriptEntryCandidate)
                                        }}
                                    >
                                        <div style={{
                                            ...styles.speaker,
                                            ...(entry.speaker === interviewerName ? styles.speakerInterviewer : styles.speakerCandidate)
                                        }}>
                                            {entry.speaker}
                                        </div>
                                        <div style={styles.message}>{entry.text}</div>
                                        <div style={styles.timestamp}>
                                            {entry.timestamp ? formatTimestamp(entry.timestamp) : 'No timestamp'}
                                        </div>
                                    </div>
                                ))}
                                {transcript && !isLoadingAIResponse && !fullDialogueHistory.find(entry => entry.text === transcript) && (
                                    <div style={styles.currentTranscript}>
                                        <div style={{...styles.speaker, color: '#ffc107'}}>You (Speaking...)</div>
                                        <div style={styles.message}>{transcript}</div>
                                    </div>
                                )}
                            </>
                            
                        )}
                        
                        {isLoadingAIResponse && (
                            <div style={{...styles.transcriptEntry, ...styles.transcriptEntryInterviewer}}>
                                <div style={{...styles.speaker, ...styles.speakerInterviewer}}>
                                    {interviewerName}
                                </div>
                                <div style={styles.message}>
                                    <FontAwesomeIcon icon={faSpinner} spin /> Thinking...
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div style={styles.statusBar}>
                        <div style={styles.statusIndicator}>
                            <div style={styles.statusDot}></div>
                            <span>{listening ? 'Listening' : 'Microphone Off'}</span>
                        </div>
                        <div style={styles.duration}>Duration: {formatDuration(duration)}</div>
                    </div>
                </div>
            </div>
            
            <button 
                style={styles.sendButton} 
                onClick={handleSendAnswer} 
                disabled={isLoadingAIResponse || !transcript.trim()}
            >
                {isLoadingAIResponse ? (
                    <>
                        <FontAwesomeIcon icon={faSpinner} spin />
                        Processing...
                    </>
                ) : (
                    "Send Answer"
                )}
            </button>
            
            {apiError && (
                <div style={{ color: '#dc3545', textAlign: 'center', marginTop: '10px' }}>
                    Error: {apiError}
                </div>
            )}
        </div>
    );
};

export default InterviewPage;