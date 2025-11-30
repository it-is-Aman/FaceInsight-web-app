"use client";

import React from 'react';
import { X, Check } from 'lucide-react';
import axios from 'axios';

interface PricingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function PricingModal({ isOpen, onClose }: PricingModalProps) {
    if (!isOpen) return null;

    const handleSubscribe = async (plan: '2days' | '7days') => {
        try {
            const response = await axios.post('/api/payment/create-checkout', { plan });
            if (response.data.url) {
                window.location.href = response.data.url;
            }
        } catch (error) {
            console.error('Failed to create checkout session:', error);
            alert('Failed to start payment. Please try again.');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6 relative animate-in fade-in zoom-in duration-300">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X className="w-5 h-5 text-gray-500" />
                </button>

                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-[#283E4A] mb-2">Unlock Unlimited Analysis</h2>
                    <p className="text-gray-600">Choose a plan that works for you</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* 2 Days Plan */}
                    <div className="border-2 border-gray-100 hover:border-blue-500 rounded-xl p-6 transition-all hover:shadow-lg cursor-pointer group"
                        onClick={() => handleSubscribe('2days')}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">2 Days Pass</h3>
                                <p className="text-sm text-gray-500">Perfect for quick checks</p>
                            </div>
                            <div className="text-2xl font-bold text-blue-600">$4</div>
                        </div>
                        <ul className="space-y-3 mb-6">
                            <li className="flex items-center text-gray-600">
                                <Check className="w-4 h-4 text-green-500 mr-2" />
                                Unlimited Analysis
                            </li>
                            <li className="flex items-center text-gray-600">
                                <Check className="w-4 h-4 text-green-500 mr-2" />
                                2 Days Access
                            </li>
                            <li className="flex items-center text-gray-600">
                                <Check className="w-4 h-4 text-green-500 mr-2" />
                                Priority Support
                            </li>
                        </ul>
                        <button className="w-full py-3 bg-gray-50 text-gray-900 font-medium rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            Get Started
                        </button>
                    </div>

                    {/* 7 Days Plan */}
                    <div className="border-2 border-blue-500 bg-blue-50/30 rounded-xl p-6 transition-all shadow-md relative overflow-hidden cursor-pointer"
                        onClick={() => handleSubscribe('7days')}
                    >
                        <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                            POPULAR
                        </div>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">7 Days Pass</h3>
                                <p className="text-sm text-gray-500">Best value for monitoring</p>
                            </div>
                            <div className="text-2xl font-bold text-blue-600">$7</div>
                        </div>
                        <ul className="space-y-3 mb-6">
                            <li className="flex items-center text-gray-600">
                                <Check className="w-4 h-4 text-green-500 mr-2" />
                                Unlimited Analysis
                            </li>
                            <li className="flex items-center text-gray-600">
                                <Check className="w-4 h-4 text-green-500 mr-2" />
                                7 Days Access
                            </li>
                            <li className="flex items-center text-gray-600">
                                <Check className="w-4 h-4 text-green-500 mr-2" />
                                Priority Support
                            </li>
                        </ul>
                        <button className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                            Get Started
                        </button>
                    </div>
                </div>

                <p className="text-center text-xs text-gray-400 mt-6">
                    Secure payment powered by Dodo Payments
                </p>
            </div>
        </div>
    );
}
