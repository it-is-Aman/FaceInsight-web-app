"use client";

import React from "react";

export default function GeminiThinking() {
  return (
    <div className="flex items-start gap-4 rounded-lg border border-blue-100 bg-blue-50 p-4">
      {/* Spinner */}
      <div className="relative mt-1">
        <span className="absolute inline-flex h-3 w-3 animate-ping rounded-full bg-blue-400 opacity-75" />
        <span className="relative inline-flex h-3 w-3 rounded-full bg-blue-500" />
      </div>

      {/* Text */}
      <div className="flex-1">
        <p className="text-sm font-medium text-blue-900">
          Preparing personalized skincare guidance
        </p>
        <p className="mt-1 text-xs text-blue-700">
          Our AI is analyzing your skin conditions and generating tailored
          treatment recommendations. This usually takes a few seconds.
        </p>
      </div>
    </div>
  );
}
