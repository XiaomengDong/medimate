import React, { useState } from 'react';
import { FaRobot, FaPaperPlane, FaFile } from 'react-icons/fa';

function AIAssistant() {
  const [input, setInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      type: 'system',
      message: 'Hello! I\'m your AI health assistant. How can I help you today?'
    }
  ]);

  // Mock function to handle sending a message
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message to chat
    setChatHistory([
      ...chatHistory,
      { type: 'user', message: input }
    ]);
    
    // Mock AI response (in a real app this would call an API)
    setTimeout(() => {
      let aiResponse = "I'm analyzing your question...";
      
      // Some mock responses based on keywords
      if (input.toLowerCase().includes('headache')) {
        aiResponse = "Headaches can be caused by various factors including stress, dehydration, or lack of sleep. Make sure you're drinking enough water and getting adequate rest. If the headache persists or is severe, please consult a healthcare professional.";
      } else if (input.toLowerCase().includes('sleep')) {
        aiResponse = "Getting quality sleep is crucial for your health. Try to maintain a regular sleep schedule and create a relaxing bedtime routine. Your sleep quality score has been averaging 85% this week, which is good!";
      } else if (input.toLowerCase().includes('heart')) {
        aiResponse = "Your heart rate readings have been within normal range. Regular cardiovascular exercise can help maintain heart health. Would you like me to suggest some appropriate exercises based on your health profile?";
      } else {
        aiResponse = "I understand your concern. Based on your health data, I don't see any immediate issues related to this. Would you like me to provide some general health tips or connect you with a healthcare provider?";
      }
      
      setChatHistory(prevChat => [
        ...prevChat,
        { type: 'ai', message: aiResponse }
      ]);
    }, 1000);
    
    // Clear input field
    setInput('');
  };

  // Function to handle file upload (mock)
  const handleFileUpload = () => {
    alert('File upload functionality would be implemented here.');
    
    // Simulate receiving a file and AI response
    setTimeout(() => {
      setChatHistory(prevChat => [
        ...prevChat,
        { type: 'user', message: 'Uploaded: medical_report.pdf' },
        { type: 'ai', message: 'I\'ve analyzed your medical report. Your cholesterol levels are slightly elevated. I recommend reducing saturated fat intake and increasing physical activity. Would you like specific dietary suggestions?' }
      ]);
    }, 1500);
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