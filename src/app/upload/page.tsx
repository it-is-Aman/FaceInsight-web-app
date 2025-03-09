"use client"

import React, { useState, useRef } from 'react';
import ImageUpload from '@/components/upload/Imageupload';
import PredictionResults from '@/components/result/PredictionResults';
import ChatInterface from '@/components/result/ChatInterface';
import LoadingIndicator from '@/components/indicators/LoadingIndicator';
import ErrorNotification from '@/components/indicators/ErrorNotification';
import axios from 'axios';

function UploadPage() {
    const [uploadedImage, setUploadedImage] = useState(null);
    const [predictions, setPredictions] = useState(null);
    const [suggestions, setSuggestions] = useState(null);
    const [chatHistory, setChatHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [error, setError] = useState(null);
    const resultsRef = useRef(null);


    const handleImageUpload = async (image) => {
        console.log('Handling image upload:', image);  // Debug logging

        if (!image) {
            setError('Please select an image first');
            return;
        }

        setIsLoading(true);
        setError(null);

        // Clear previous results and chat history when uploading new image
        setPredictions(null);
        setSuggestions(null);
        setChatHistory([]); // Clear chat history for new image

        const formData = new FormData();
        formData.append('file', image);

        try {
            console.log('Sending request to server...');  // Debug logging

            const response = await axios.post(process.env.NEXT_PUBLIC_ML_SERVICE_URL + '/predict', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('Server response:', response.data);  // Debug logging

            if (response.data.error) {
                throw new Error(response.data.error);
            }

            setPredictions(response.data.predictions || []);
            setSuggestions(response.data.suggestions || '');
            setUploadedImage(image);
        } catch (err) {
            console.error('Error during prediction:', err);
            setError(err.response?.data?.error || err.message || 'Failed to upload image. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChatMessage = async (question) => {
        if (!predictions.length) {
            setError("Please upload an image first to ask questions about the results.");
            return;
        }

        setIsChatLoading(true);
        try {
            const response = await axios.post(process.env.NEXT_PUBLIC_ML_SERVICE_URL + '/chat', {
                question,
                predictions
            });

            if (response.data.success) {
                setChatHistory(prev => [...prev, {
                    user: question,
                    ai: response.data.response
                }]);
            } else {
                setError(response.data.error || "Failed to get a response. Please try again.");
            }
        } catch (err) {
            console.error('Error during chat:', err);
            setError(err.response?.data?.error || "Failed to process your question. Please try again.");
        } finally {
            setIsChatLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Upload Section */}
            <div className="max-w-3xl mx-auto mb-8">
                <h1 className="text-3xl font-bold text-[#283E4A] mb-6">Skin Condition Analysis</h1>
                <ImageUpload onImageUpload={handleImageUpload} isLoading={isLoading} />
                {error && <ErrorNotification message={error} />}
            </div>

            {/* Results Section */}
            {(isLoading || predictions) && (
                <div ref={resultsRef} className="mt-12">
                    {isLoading ? (
                        <LoadingIndicator />
                    ) : (
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Left Column: Prediction Results */}
                            <div className="space-y-6">
                                <PredictionResults predictions={predictions} suggestions={suggestions} />
                            </div>

                            {/* Right Column: Chat Interface */}
                            <div className="sticky top-24 h-[calc(100vh-8rem)]">
                                <ChatInterface
                                    chatHistory={chatHistory}
                                    onSendMessage={handleChatMessage}
                                    isLoading={isChatLoading}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default UploadPage;
