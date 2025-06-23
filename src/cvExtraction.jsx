import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CVExtraction = () => {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setError(''); // Clear any previous errors
    };

    const handleSubmit = async () => {
        if (!file) {
            setError('Please upload your CV before proceeding.');
            return;
        }
    
        const formData = new FormData();
        formData.append("file", file);
    
        try {
            setIsUploading(true);
            const response = await axios.post(
                "http://localhost:8000/api/extract-text-from-pdf",
                formData,
                {
                    withCredentials: true,
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );
    
            if (response.status === 200) {
                // ✅ Successful CV extraction and backend update
                console.log("Success:", response.data);
                //navigate('/dashboard'); // or wherever you want to go next
            } else {
                setError("Something went wrong. Please try again.");
            }
        } catch (err) {
            console.error(err);
            setError("Upload failed. Make sure you're logged in and try again.");
        } finally {
            setIsUploading(false);
        }
    };
    
    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="absolute inset-x-0 top-0 z-50">
                <div className="flex items-center lg:flex-1 ml-8 mt-6">
                    <a href="/#" className="flex items-center">
                        <img
                            src="/logo.png"
                            alt="Interview AI Logo"
                            className="h-12 w-12 rounded-full"
                        />
                        <span className="text-2xl font-sans">Interview AI</span>
                    </a>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex flex-grow items-center justify-center">
                <div className="flex flex-col items-center justify-center w-full max-w-sm p-6  rounded-lg shadow-md">
                    <h2 className="text-2xl font-sans mb-4 text-center">
                        Before we begin, please upload your CV so we know a little more about you.
                    </h2>

                    <div className="w-full mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                            Upload your CV (PDF or Word document):
                        </label>
                        <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                            className="w-full p-2 border border-gray-300 rounded-md"
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                    <button
                        onClick={handleSubmit}
                        className={`w-full bg-indigo-600 text-white font-sans py-2 rounded-md hover:bg-indigo-500 ${
                            isUploading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={isUploading}
                    >
                        {isUploading ? 'Uploading...' : 'Submit and Continue'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CVExtraction;