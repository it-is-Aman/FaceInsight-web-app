"use client"

import React, { useState, useRef } from 'react';
import ImageUpload from '@/components/upload/Imageupload';
import PredictionResults from '@/components/result/PredictionResults';
import ChatInterface from '@/components/result/ChatInterface';
import LoadingIndicator from '@/components/indicators/LoadingIndicator';
import ErrorNotification from '@/components/indicators/ErrorNotification';
import axios, { AxiosError } from 'axios';

// Define types for the application
interface Prediction {
    label: string;
    confidence: number;
}

interface ChatMessage {
    user: string;
    ai: string;
}

interface ApiErrorResponse {
    error: string;
}

function UploadPage(): React.ReactElement {
    const [predictions, setPredictions] = useState<Prediction[] | null>(null);
    const [suggestions, setSuggestions] = useState<string | null>(null);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const resultsRef = useRef<HTMLDivElement | null>(null);

    const handleImageUpload = async (image: File): Promise<void> => {
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

            const response = await axios.post<{
                predictions?: Prediction[];
                suggestions?: string;
                error?: string;
            }>(process.env.ML_SERVICE_URL + '/predict', formData, {
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
        } catch (err: unknown) {
            console.error('Error during prediction:', err);
            let errorMessage = 'Failed to upload image. Please try again.';

            if (err instanceof Error) {
                errorMessage = err.message;
            } else if (axios.isAxiosError(err)) {
                const axiosError = err as AxiosError<ApiErrorResponse>;
                errorMessage = axiosError.response?.data?.error || axiosError.message;
            }

            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChatMessage = async (question: string): Promise<void> => {
        if (!predictions?.length) {
            setError("Please upload an image first to ask questions about the results.");
            return;
        }

        setIsChatLoading(true);
        try {
            const response = await axios.post<{
                success: boolean;
                response: string;
                error?: string;
            }>(process.env.ML_SERVICE_URL + '/chat', {
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
        } catch (err: unknown) {
            console.error('Error during chat:', err);
            let errorMessage = "Failed to process your question. Please try again.";

            if (err instanceof Error) {
                errorMessage = err.message;
            } else if (axios.isAxiosError(err)) {
                const axiosError = err as AxiosError<ApiErrorResponse>;
                errorMessage = axiosError.response?.data?.error || axiosError.message;
            }

            setError(errorMessage);
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
                {error && <ErrorNotification message={error} onClose={() => setError(null)} />}
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