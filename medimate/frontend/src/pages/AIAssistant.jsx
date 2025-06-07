import React, { useState } from 'react';
import { chatWithAI, uploadDoc } from '../services/api';
import { FaRobot, FaPaperPlane, FaFile } from 'react-icons/fa';

function AIAssistant() {
  const [input, setInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState(null);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
  
    const userMsg = { type: 'user', message: input };
    setChatHistory(h => [...h, userMsg]);
    setInput('');
    setIsLoading(true);
  
    try {
      const reply = await chatWithAI(input, chatHistory.map(c => ({
        role: c.type === 'user' ? 'user' : 'assistant',
        content: c.message
      })));
      setChatHistory(h => [...h, { type: 'ai', message: reply }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsLoading(true);
  
    try {
      const { analysis, fileName } = await uploadDoc(file);
      setChatHistory(h => [
        ...h,
        { type: 'user', message: `Uploaded: ${fileName}` },
        { type: 'ai', message: analysis }
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ai-advice-container">
      {/* <h1>AI Health Advice</h1> */}
      <h2>Ask questions about your health or upload medical documents for analysis</h2>
      
      <div className="chat-container">
        <div className="chat-messages">
          {chatHistory.map((chat, index) => (
            <div key={index} className={`message ${chat.type}`}>
              {chat.type === 'ai' && <FaRobot className="message-icon" />}
              <div className="message-content">{chat.message}</div>
            </div>
          ))}
        </div>
        
        <form className="chat-input-form" onSubmit={handleSendMessage}>
          <button 
            type="button" 
            className="upload-button"
            onClick={handleFileUpload}
          >
            <FaFile />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your health question here..."
          />
          <button type="submit" className="send-button">
            <FaPaperPlane />
          </button>
        </form>
      </div>
    </div>
  );
}

export default AIAssistant;