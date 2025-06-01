import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';  // Add this import

const SetupInterview = () => {
    const navigate = useNavigate();  // Add this hook

    const [name, setName] = useState('');
    const [company, setCompany] = useState('');
    const [error, setError] = useState('');

    const videoRef = useRef(null);
    const [devices, setDevices] = useState({
        audioInputs: [],
        audioOutputs: [],
        videoInputs: []
    });
    const [selectedDevices, setSelectedDevices] = useState({
        audioInput: '',
        audioOutput: '',
        videoInput: ''
    });

    // Add this new function to get available devices
    const getConnectedDevices = async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            setDevices({
                audioInputs: devices.filter(device => device.kind === 'audioinput'),
                audioOutputs: devices.filter(device => device.kind === 'audiooutput'),
                videoInputs: devices.filter(device => device.kind === 'videoinput')
            });
        } catch (err) {
            console.error("Error getting devices:", err);
        }
    };

    // Modify your existing useEffect
    useEffect(() => {
        const startCamera = async () => {
            try {
                await getConnectedDevices();
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: true,
                    audio: true 
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Error accessing webcam:", err);
            }
        };

        startCamera();
        
        // Add event listener for device changes
        navigator.mediaDevices.addEventListener('devicechange', getConnectedDevices);

        return () => {
            if (videoRef.current?.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
            navigator.mediaDevices.removeEventListener('devicechange', getConnectedDevices);
        };
    }, []);
    const validateInputs = () => {
        if (!name.trim() || !company.trim()) {
            setError('Please fill in both name and company.');
            return false;
        }

        if (name.length < 2 || company.length < 2) {
            setError('Name and company should be at least 2 characters long.');
            return false;
        }

        // Optional: only letters/spaces
        const nameRegex = /^[A-Za-z\s]+$/;
        if (!nameRegex.test(name)) {
            setError('Name must only contain letters and spaces.');
            return false;
        }

        setError(''); // clear errors
        return true;
    };
    const handleSubmit = async () => {
        if (!validateInputs()) {
            return;
        }

        try {
            

            
            const response = await fetch('http://localhost:8000/api/start-interview', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({name, company})
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                console.error("Server error:", errorData);
                throw new Error(errorData?.message || 'Failed to start interview');
            }

            const data = await response.json();
            console.log("Interview started successfully:", data);
            
            navigate('/InterviewPage', { 
                state: { 
                    name, 
                    company,
                    initialQuestion: data.initial_question,
                    audioBase64: data.audio_base64,
                    initialHistory: data.initial_history
                }
            });
        } catch (error) {
            console.error("Error starting interview:", error);
            setError('Failed to start interview. Please try again.');
        }
    };
        // Add these styles to your existing styles object
        const styles = {
        container: {
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            padding: '15px',
            background: '#1a1a1a',
            color: '#ffffff',
            minHeight: '100vh',
            width: '100%',  // Changed from Width to width
            display: 'flex',
            flexDirection: 'column'
        },
        header: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 0'
        },
        headerTitle: {
            fontSize: '1.8rem',
            fontWeight: '600',
            color: '#ffffff',
            margin: 0
        },
        divider: {
            width: '2px',
            height: '30px',
            background: '#333',
            margin: '0 10px'
        },
        headerSubtext: {
            fontSize: '1.8rem',
            fontWeight: '600',
            color: '#ffffff',
            margin: 0
        },
        videoContainer: {
            marginTop: '2%',
            marginLeft:' 8%',
            background: '#2a2a2a',
            borderRadius: '10px',
            border: '1px solid #404040',
            overflow: 'hidden',
            minHeight: '400px',
            display: 'flex',
            maxWidth: '1200px',  // Increased max width
            width: '100%',       // Take full width
        },
        contentWrapper: {
            display: 'flex',
            width: '100%',
            gap: '0px'         // Space between video and config
        },
        videoPlaceholder: {
            flex: '0 0 60%',    // Takes exactly 60% of space
            background: '#333333',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            minHeight: '500px',
        },
        configSection: {
            flex: '0 0 40%',    // Takes exactly 40% of space
            background: '#2d2d2d',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',  // Center horizontally
        },
        video: {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: 'scaleX(-1)',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 0  // Ensure video is behind information
        },
        continueButton: {
            background: 'rgb(252, 252, 252)',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#404040',
            marginTop: '20px',
            alignSelf: 'center'    // Center button
        },
        welcomeTitle: {
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#ffffff',
            marginBottom: '10px',
            textAlign: 'center'    // Center text
        },
        inputGroup: {
            marginBottom: '10px',
            width: '80%',          // Control width of input groups
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'   // Center inputs
        },
        label: {
            alignItems: 'center',
            display: 'block',
            fontSize: '1rem',
            fontWeight: '500',
            color: '#ffffff',
            marginBottom: '5px'
        },
        input: {
            width: '80%',          // Make inputs wider
            padding: '10px',
            fontSize: '1rem',
            borderRadius: '5px',
            border: '1px solid #404040',
            background: '#333333',
            color: '#ffffff',
            textAlign: 'center'    // Center input text
        },
        sectionTitle: {
            fontSize: '1.2rem',
            fontWeight: '600',
            color: '#ffffff',
            marginBottom: '2px'
        },
        select: {
            width: '80%',          // Make selects wider
            padding: '10px',
            fontSize: '1rem',
            borderRadius: '5px',
            border: '1px solid #404040',
            background: '#333333',
            color: '#ffffff',
            marginBottom: '5px',
            textAlign: 'center'    // Center select text
        },
        deviceGroup: {
            width: '80%',          // Control width of device group
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'   // Center device controls
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <span style={styles.headerTitle}>Interview AI</span>
                <div style={styles.divider}></div>
                <span style={styles.headerSubtext}>setup</span>
                </div>

                <div style={styles.videoContainer}>
                <div style={styles.contentWrapper}>
                    <div style={styles.videoPlaceholder}>
                        <video 
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            style={styles.video}
                        />
                        
                    </div>
                    <div style={styles.configSection}>
                        <h2 style={styles.welcomeTitle}>Welcome to the Interview</h2>
                        
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>What's your name?</label>
                            <input 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                type="text"
                                placeholder="Enter your name"
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Which company are you interviewing for?</label>
                            <input 
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                                type="text"
                                placeholder="Enter company name"
                                style={styles.input}
                            />
                        </div>

                        <h3 style={styles.sectionTitle}>Media Settings</h3>
                        <div style={styles.deviceGroup}>
                            <label style={styles.label}>Camera</label>
                            <select 
                                style={styles.select}
                                value={selectedDevices.videoInput}
                                onChange={(e) => setSelectedDevices(prev => ({
                                    ...prev,
                                    videoInput: e.target.value
                                }))}
                            >
                                {devices.videoInputs.map(device => (
                                    <option key={device.deviceId} value={device.deviceId}>
                                        {device.label || `Camera ${device.deviceId.slice(0, 5)}...`}
                                    </option>
                                ))}
                            </select>

                            <label style={styles.label}>Microphone</label>
                            <select 
                                style={styles.select}
                                value={selectedDevices.audioInput}
                                onChange={(e) => setSelectedDevices(prev => ({
                                    ...prev,
                                    audioInput: e.target.value
                                }))}
                            >
                                {devices.audioInputs.map(device => (
                                    <option key={device.deviceId} value={device.deviceId}>
                                        {device.label || `Microphone ${device.deviceId.slice(0, 5)}...`}
                                    </option>
                                ))}
                            </select>

                            <label style={styles.label}>Speakers</label>
                            <select 
                                style={styles.select}
                                value={selectedDevices.audioOutput}
                                onChange={(e) => setSelectedDevices(prev => ({
                                    ...prev,
                                    audioOutput: e.target.value
                                }))}
                            >
                                {devices.audioOutputs.map(device => (
                                    <option key={device.deviceId} value={device.deviceId}>
                                        {device.label || `Speaker ${device.deviceId.slice(0, 5)}...`}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button onClick={handleSubmit} style={styles.continueButton}>Start</button>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default SetupInterview;