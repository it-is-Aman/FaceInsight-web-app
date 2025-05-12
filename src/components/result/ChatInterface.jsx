import React, { useState, useRef, useEffect } from 'react';

function ChatInterface({ chatHistory, onSendMessage, isLoading }) {
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Only scroll to bottom on new messages if already at bottom
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
    if (isAtBottom) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [chatHistory]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 h-full dark:bg-gray-300">
      <h3 className="text-xl font-semibold mb-4 dark:text-black">Ask About Your Results</h3>

      <div className="flex flex-col h-[calc(100%-2rem)]">
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto mb-4 p-4 bg-gray-50 rounded-lg"
        >
          {chatHistory.length === 0 ? (
            <div className="text-gray-500 text-center py-4 dark:text-black">
              Ask questions about your skin conditions and get AI-powered responses.
            </div>
          ) : (
            chatHistory.map((message, index) => (
              <div key={index} className="mb-4">
                {/* User Message */}
                <div className="flex justify-end mb-2">
                  <div className="bg-blue-100 p-3 rounded-lg max-w-[80%]">
                    <p className="text-sm text-blue-800">{message.user}</p>
                  </div>
                </div>

                {/* AI Response */}
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 p-3 rounded-lg max-w-[80%] shadow-sm">
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{message.ai}</p>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={chatEndRef} style={{ height: '1px', visibility: 'hidden' }} />
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2 mt-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question..."
            disabled={isLoading}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:text-black"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatInterface;
