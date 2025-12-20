"use client"

import React, { useState, useRef } from 'react';
import ImageUpload from '@/components/upload/Imageupload';
import PredictionResults from '@/components/result/PredictionResults';
import ChatInterface from '@/components/result/ChatInterface';
import LoadingIndicator from '@/components/indicators/LoadingIndicator';
import ErrorNotification from '@/components/indicators/ErrorNotification';
import axios, { AxiosError } from 'axios';
import { useUser, useClerk } from '@clerk/nextjs';
import PricingModal from '@/components/payment/PricingModal';
import { useRouter } from 'next/navigation';
import { checkSubscriptionStatus } from '@/app/actions/subscription';

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
    const [showPricingModal, setShowPricingModal] = useState(false);
    const resultsRef = useRef<HTMLDivElement | null>(null);
    const { user, isLoaded } = useUser();
    const { openSignIn } = useClerk();


    const handleImageUpload = async (image: File): Promise<void> => {
        console.log('Handling image upload:', image);  // Debug logging

        if (!image) {
            setError('Please select an image first');
            return;
        }

        setIsLoading(true);
        setError(null);

        // Check limits
        if (isLoaded) {
            if (!user) {
                // Guest User
                const guestToken = localStorage.getItem('guest_token');
                if (guestToken) {
                    setIsLoading(false);
                    openSignIn();
                    return;
                }
            } else {
                // Logged in User
                // Check Subscription via Server Action
                try {
                    const status = await checkSubscriptionStatus();

                    if (!status.canPredict) {
                        console.log("No active subscription or limit reached");
                        setIsLoading(false);
                        setShowPricingModal(true);
                        return;
                    }
                } catch (err) {
                    console.error("Failed to check subscription:", err);
                    setIsLoading(false);
                    setError("Failed to verify subscription status. Please try again.");
                    return;
                }
            }
        }

        // Clear previous results and chat history when uploading new image
        setPredictions(null);
        setSuggestions(null);
        setChatHistory([]); // Clear chat history for new image

        const formData = new FormData();
        formData.append('file', image);

        try {
            console.log('Sending request to server...');  // Debug logging

            const guestToken = localStorage.getItem('guest_token');

            const response = await axios.post<{
                predictions?: Prediction[];
                suggestions?: string;
                error?: string;
                guestToken?: string;
            }>('/api/predict', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'x-guest-token': guestToken || '',
                },
            });

            console.log('Server response:', response.data);  // Debug logging

            if (response.data.error) {
                throw new Error(response.data.error);
            }

            setPredictions(response.data.predictions || []);
            setSuggestions(response.data.suggestions || '');

            // Save new guest token if provided
            if (response.data.guestToken) {
                localStorage.setItem('guest_token', response.data.guestToken);
            }
        } catch (err: unknown) {
            console.error('Error during prediction:', err);
            let errorMessage = 'Failed to upload image. Please try again.';

            if (err instanceof Error) {
                errorMessage = err.message;
            } else if (axios.isAxiosError(err)) {
                // If 403 Forbidden
                if (err.response?.status === 403) {
                    // If user is logged in, it means they need a subscription
                    if (user) {
                        console.log("User is logged in but 403 returned - showing pricing modal");
                        setShowPricingModal(true);
                        return;
                    }
                    // If guest, they need to login
                    else {
                        openSignIn();
                        return;
                    }
                }
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
            }>(process.env.NEXT_PUBLIC_ML_SERVICE_URL + '/chat', {
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
                <PricingModal isOpen={showPricingModal} onClose={() => setShowPricingModal(false)} />
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