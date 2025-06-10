import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { FaRobot, FaPaperPlane, FaFile } from 'react-icons/fa';
import { aiAPI } from '../services/api';

function AIAssistant() {
  const [input, setInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      type: 'system',
      message: 'Hello! I\'m your AI health assistant. How can I help you today?'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    setChatHistory(prev => [...prev, { type: 'user', message: input }]);
    setInput('');
    setIsLoading(true);

    try {
      // Get health context from your backend if needed
      const healthContext = {}; // You can fetch this from your API

      // Call AI API
      const aiResponse = await aiAPI.chat(input, healthContext);
      setChatHistory(prev => [
        ...prev,
        { type: 'ai', message: aiResponse }
      ]);
    } catch (error) {
      setChatHistory(prev => [
        ...prev,
        { type: 'ai', message: `Error: ${error.message}` }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Add upload notification
    setChatHistory(prev => [
      ...prev,
      { type: 'user', message: `Uploaded: ${file.name}` }
    ]);
    setIsLoading(true);

    try {
      const analysis = await aiAPI.analyzeDocument(file);
      setChatHistory(prev => [
        ...prev,
        { type: 'ai', message: analysis.summary }
      ]);
    } catch (error) {
      setChatHistory(prev => [
        ...prev,
        { type: 'ai', message: `Error analyzing document: ${error.message}` }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ai-advice-container">
      <h2>Ask questions about your health or upload medical documents for analysis</h2>
      
      <div className="chat-container">
        <div className="chat-messages">
          {chatHistory.map((chat, index) => (
            <div key={index} className={`message ${chat.type}`}>
              {chat.type === 'ai' && <FaRobot className="message-icon" />}
              {/* Use ReactMarkdown to render aiResponse */}
              <div className="message-content">
                {chat.type === 'ai' ? (
                  <ReactMarkdown>{chat.message}</ReactMarkdown>
                ) : (
                  chat.message
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message ai">
              <FaRobot className="message-icon" />
              <div className="message-content">Thinking...</div>
            </div>
          )}
        </div>
        
        <form className="chat-input-form" onSubmit={handleSendMessage}>
          <label className="upload-button">
            <FaFile />
            <input 
              type="file" 
              style={{ display: 'none' }} 
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.txt,.image/*"
            />
          </label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your health question here..."
            disabled={isLoading}
          />
          <button type="submit" className="send-button" disabled={isLoading}>
            <FaPaperPlane />
          </button>
        </form>
      </div>
    </div>
  );
}

export default AIAssistant;