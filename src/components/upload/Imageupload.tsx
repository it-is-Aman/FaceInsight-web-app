"use client"

import Image from 'next/image';
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface ImageUploadProps {
    onImageUpload: (file: File) => void;
    isLoading: boolean;
}

function ImageUpload({ onImageUpload, isLoading }: ImageUploadProps): React.ReactElement {
    const [preview, setPreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png']
        },
        multiple: false,
        maxSize: 5242880, // 5MB
        disabled: isLoading
    });

    const handleUpload = (): void => {
        if (selectedFile) {
            onImageUpload(selectedFile);
        }
    };

    return (
        <div className="text-center">
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 mb-4 cursor-pointer transition-colors ${isDragActive
                    ? 'border-blue-500 bg-blue-50'
                    : isLoading
                        ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                        : 'border-gray-300 hover:border-blue-400'
                    }`}
            >
                <input {...getInputProps()} />
                {preview ? (
                    <div>
                        <Image src={preview} alt="Preview" className="mx-auto max-h-64 mb-2" />
                        <p className="text-sm text-gray-500">
                            {selectedFile ? `Selected: ${selectedFile.name} (${(selectedFile.size / 1024).toFixed(1)} KB)` : ''}
                        </p>
                    </div>
                ) : (
                    <div>
                        <p className="text-gray-500">
                            {isLoading ? 'Processing...' : 'Drag and drop an image here, or click to select a file'}
                        </p>
                        <p className="text-sm text-gray-400 mt-2">Supported formats: JPG, PNG (max 5MB)</p>
                    </div>
                )}
            </div>

            <button
                onClick={handleUpload}
                disabled={!selectedFile || isLoading}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${!selectedFile || isLoading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
            >
                {isLoading ? 'Analyzing...' : 'Analyze Image'}
            </button>

            <div className="max-w-lg mx-auto mt-10 space-y-6">
                <div className="bg-secondary/50 rounded-xl p-6 shadow-sm border border-border">
                    <h3 className="font-medium text-lg mb-3">Tips for Better Results</h3>
                    <ul className="space-y-2 text-muted-foreground">
                        <li className="flex items-center">
                            <span className="bg-primary/10 rounded-full h-6 w-6 flex items-center justify-center mr-2 text-primary font-medium">1</span>
                            Use good lighting, preferably natural daylight
                        </li>
                        <li className="flex items-center">
                            <span className="bg-primary/10 rounded-full h-6 w-6 flex items-center justify-center mr-2 text-primary font-medium">2</span>
                            Capture the affected area clearly, avoiding blurry images
                        </li>
                        <li className="flex items-center">
                            <span className="bg-primary/10 rounded-full h-6 w-6 flex items-center justify-center mr-2 text-primary font-medium">3</span>
                            Include some surrounding healthy skin for reference
                        </li>
                        <li className="flex items-center">
                            <span className="bg-primary/10 rounded-full h-6 w-6 flex items-center justify-center mr-2 text-primary font-medium">4</span>
                            Avoid using filters or editing the image
                        </li>
                    </ul>
                </div>
                <p className="text-sm text-center text-muted-foreground">
                    This tool is for informational purposes only and should not replace professional medical advice.
                </p>
            </div>
        </div>
    );
}

export default ImageUpload;