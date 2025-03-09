import React from 'react';

function PredictionResults({ predictions, suggestions }) {
  if (!predictions || predictions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Predictions Section */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Detected Conditions</h3>
        <div className="space-y-4">
          {predictions.map((prediction, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <h4 className="text-lg font-semibold text-blue-600 mb-2">
                {prediction.disease}
              </h4>
              <div className="mb-3">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${(prediction.confidence * 100).toFixed(1)}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Confidence: {(prediction.confidence * 100).toFixed(1)}%
                </p>
              </div>
              <p className="text-gray-600 text-sm">
                {prediction.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Suggestions Section */}
      {suggestions && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Treatment Suggestions</h3>
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="prose max-w-none">
              {suggestions.split('\n').map((paragraph, index) => (
                paragraph.trim() && (
                  <p key={index} className="mb-4 text-gray-700 last:mb-0">
                    {paragraph}
                  </p>
                )
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PredictionResults;
