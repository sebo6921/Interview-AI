import React, { useRef, useEffect, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faSpinner, faVideo, faCog, faVolumeMute } from '@fortawesome/free-solid-svg-icons';
import { useLocation } from 'react-router-dom';  // Add this import at the top
import { InterviewStyle } from './interviewStyle'; // Import the CSS file for InterviewStyle
// Define the system prompt content as a string literal here to match the backend
const INTERVIEW_AI_SYSTEM_PROMPT_STRING_LITERAL = "You are an AI designed to role-play as an experienced"
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
                // filter out system prompts and initial setup messages
                return !(entry.role === 'system' || 
                       (entry.role === 'user' && 
                        entry.content?.includes(INTERVIEW_AI_SYSTEM_PROMPT_STRING_LITERAL.substring(0, 10))));
            })
            .map(entry => ({
                speaker: entry.role === 'assistant' ? interviewerName : userName,
                text: entry.content,
                timestamp: Date.now()
            }));
    };

// audio base64 is the audi we get from backend - this method plays the audio and mutes the speech recognition while playing and then resumes it after the audio ends
// mutes your mic to no pick up ai voice while playing the audio
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
        // gets executed soon as we load into page. asks permission for video and camera and starts the interview
        //hit the start interview endpoint to get the initial question and audio
        // then it will update the transcript with the initial question and  play the audio
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
    // works the same way as the send answer button in the setup interview page
    // this actually gets hit evertume we send a answer apart from that it also updates the ai memory with the current answer and maintains the 
    // AI json format for the backend
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
            // historyForBackend.push({ 
            //     role: "user", 
            //     content: currentAnswerToProcess
            // });

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
            console.log(fullDialogueHistory);

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

    return (
        <div style={InterviewStyle.container}>
            <div style={InterviewStyle.header}>
                <h1 style={InterviewStyle.headerText}>🗣️  Interview AI </h1>
            </div>
            
            <div style={InterviewStyle.mainContent}>
                <div style={InterviewStyle.videoContainer}>
                    <div style={InterviewStyle.videoPlaceholder}>
                        <div style={InterviewStyle.videoLabel}>{interviewerName}</div>
                        <div style={InterviewStyle.placeholderIcon}>👨‍💼</div>
                    </div>
                    <div style={InterviewStyle.controls}>
                        <button style={InterviewStyle.controlBtn} title="AI Settings">
                            <FontAwesomeIcon icon={faCog} />
                        </button>
                    </div>
                </div>
                
                <div style={InterviewStyle.videoContainer}>
                    <div style={InterviewStyle.videoPlaceholder}>
                        <div style={InterviewStyle.videoLabel}>{userName}</div>
                        <video ref={videoRef} autoPlay playsInline muted style={InterviewStyle.video}></video>
                    </div>
                    <div style={InterviewStyle.controls}>
                        <button 
                            style={{
                                ...InterviewStyle.controlBtn,
                                background: isMuted ? '#dc3545' : '#28a745'
                            }} 
                            onClick={toggleMute}
                            title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
                        >
                            <FontAwesomeIcon icon={faMicrophone} />
                        </button>
                        <button onClick={cameraToggle} style={InterviewStyle.controlBtn} title="Toggle Camera">
                            <FontAwesomeIcon icon={faVideo} />
                        </button>
                        <button style={InterviewStyle.controlBtn} title="Settings">
                            <FontAwesomeIcon icon={faCog} />
                        </button>
                    </div>
                </div>
                
                <div style={InterviewStyle.transcriptSection}>
                    <div style={InterviewStyle.transcriptHeader}>
                        <h2 style={InterviewStyle.transcriptHeaderTitle}>Interview Transcript</h2>
                        <div style={InterviewStyle.transcriptSubtitle}>Live conversation log</div>
                    </div>
                    
                    <div style={InterviewStyle.transcriptContent} ref={transcriptContentRef}>
                        {fullDialogueHistory.length === 0 && !isLoadingAIResponse ? (
                            <div style={InterviewStyle.message}>Starting interview...</div>
                        ) : (
                            <>
                                {/* Only show current transcript if we're not loading a response */}
                                
                                
                                {fullDialogueHistory.map((entry, index) => (
                                    <div 
                                        key={index} 
                                        style={{
                                            ...InterviewStyle.transcriptEntry,
                                            ...(entry.speaker === interviewerName ? InterviewStyle.transcriptEntryInterviewer : InterviewStyle.transcriptEntryCandidate)
                                        }}
                                    >
                                        <div style={{
                                            ...InterviewStyle.speaker,
                                            ...(entry.speaker === interviewerName ? InterviewStyle.speakerInterviewer : InterviewStyle.speakerCandidate)
                                        }}>
                                            {entry.speaker}
                                        </div>
                                        <div style={InterviewStyle.message}>{entry.text}</div>
                                        <div style={InterviewStyle.timestamp}>
                                            {entry.timestamp ? formatTimestamp(entry.timestamp) : 'No timestamp'}
                                        </div>
                                    </div>
                                ))}
                                {transcript && !isLoadingAIResponse && !fullDialogueHistory.find(entry => entry.text === transcript) && (
                                    <div style={InterviewStyle.currentTranscript}>
                                        <div style={{...InterviewStyle.speaker, color: '#ffc107'}}>{userName} (Speaking...)</div>
                                        <div style={InterviewStyle.message}>{transcript}</div>
                                    </div>
                                )}
                            </>
                            
                        )}
                        
                        {isLoadingAIResponse && (
                            <div style={{...InterviewStyle.transcriptEntry, ...InterviewStyle.transcriptEntryInterviewer}}>
                                <div style={{...InterviewStyle.speaker, ...InterviewStyle.speakerInterviewer}}>
                                    {interviewerName}
                                </div>
                                <div style={InterviewStyle.message}>
                                    <FontAwesomeIcon icon={faSpinner} spin /> Thinking...
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div style={InterviewStyle.statusBar}>
                        <div style={InterviewStyle.statusIndicator}>
                            <div style={{
                                ...InterviewStyle.statusDot,
                                backgroundColor: listening ? '#28a745' : '#6c757d'
                            }}></div>
                            <span>{listening ? 'Listening' : 'Microphone Off'}</span>
                        </div>
                        <div style={InterviewStyle.duration}>Duration: {formatDuration(duration)}</div>
                    </div>
                </div>
            </div>
            
            <button 
                style={{
                    ...InterviewStyle.sendButton,
                    backgroundColor: isLoadingAIResponse ? '#6c757d' : '#007bff',
                    cursor: isLoadingAIResponse ? 'not-allowed' : 'pointer'
                }}
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