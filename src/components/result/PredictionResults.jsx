import React, { useMemo } from 'react';

function PredictionResults({ predictions, suggestions }) {
  if (!predictions || predictions.length === 0) {
    return null;
  }

  const formattedSuggestions = useMemo(() => {
    if (!suggestions) return null;

    const boldKeys = [
      "Condition:",
      "What it is:",
      "Causes:",
      "What to do now:",
      "See a dermatologist if:"
    ];

    let formatted = suggestions;

    formatted = formatted.replace(
      /Condition:\s*(.+)/g,
      `<strong>Condition:</strong> <span class="font-semibold text-blue-600">$1</span>`
    );
    boldKeys.forEach(key => {
      const regex = new RegExp(`(${key})`, "g");
      formatted = formatted.replace(regex, `<strong>${key}</strong>`);
    });

    return formatted.replace(/\n/g, "<br />");
  }, [suggestions]);

  return (
    <div className="space-y-8">
      {/* Predictions Section */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Detected Conditions</h3>
        <div className="space-y-4">
          {predictions.map((prediction, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow dark:bg-gray-300"
            >
              <h4 className="text-lg font-semibold text-blue-600 mb-2">
                {prediction.disease}
              </h4>

              <div className="mb-3">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${(prediction.confidence * 100).toFixed(1)}%` }}
                  />
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
      {formattedSuggestions && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Treatment Suggestions</h3>
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 dark:bg-gray-300">
            <div
              className="prose prose-sm prose-neutral max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{
                __html: formattedSuggestions
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default PredictionResults;
