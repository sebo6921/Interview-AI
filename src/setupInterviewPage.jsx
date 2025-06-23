import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';  // Add this import
import setupInterviewStyles from './setupInterviewStyle'; // Adjust the import path as needed
const SetupInterview = () => {
    const navigate = useNavigate();  // Add this hook

    const [name, setName] = useState('');
    const [company, setCompany] = useState('');
    const [error, setError] = useState(''); // Add error state

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

    //  get available devices
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
        
        //  event listener for device changes
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
            // console.log("Interview started successfully:", data);
            
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
            setError('Failed to start interview. Please try again.');
        }
    };
       
     

    return (
        <div style={setupInterviewStyles.container}>
            <div style={setupInterviewStyles.header}>
            <a href="#/" onClick={() => navigate('/')}>
            <span style={setupInterviewStyles.headerTitle}>Interview AI</span>
                </a>
                <div style={setupInterviewStyles.divider}></div>
                <span style={setupInterviewStyles.headerSubtext}>setup</span>
                </div>

                <div style={setupInterviewStyles.videoContainer}>
                <div style={setupInterviewStyles.contentWrapper}>
                    <div style={setupInterviewStyles.videoPlaceholder}>
                        <video 
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            style={setupInterviewStyles.video}
                        />
                        
                    </div>
                    <div style={setupInterviewStyles.configSection}>
                        <h2 style={setupInterviewStyles.welcomeTitle}>Welcome to the Interview</h2>
                        
                        <div style={setupInterviewStyles.inputGroup}>
                            <label style={setupInterviewStyles.label}>What's your name?</label>
                            <input 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                type="text"
                                placeholder="Enter your name"
                                style={setupInterviewStyles.input}
                            />
                        </div>

                        <div style={setupInterviewStyles.inputGroup}>
                            <label style={setupInterviewStyles.label}>Which company are you interviewing for?</label>
                            <input 
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                                type="text"
                                placeholder="Enter company name"
                                style={setupInterviewStyles.input}
                            />
                        </div>

                        <h3 style={setupInterviewStyles.sectionTitle}>Media Settings</h3>
                        <div style={setupInterviewStyles.deviceGroup}>
                            <label style={setupInterviewStyles.label}>Camera</label>
                            <select 
                                style={setupInterviewStyles.select}
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

                            <label style={setupInterviewStyles.label}>Microphone</label>
                            <select 
                                style={setupInterviewStyles.select}
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

                            <label style={setupInterviewStyles.label}>Speakers</label>
                            <select 
                                style={setupInterviewStyles.select}
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
                        <button onClick={handleSubmit} style={setupInterviewStyles.continueButton}>Start</button>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default SetupInterview;