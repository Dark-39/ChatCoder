import React, { useState } from 'react';
import styles from './Chat.module.css';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (!input.trim()) return;
  
    const userMessage = { role: 'user', text: input };
    const aiMessage = { role: 'ai', text: '' };
  
    setMessages(prev => [...prev, userMessage, aiMessage]);
    setInput('');
  
    let currentAIText = '';
  
    const updateStream = (e) => {
      currentAIText = e.detail;
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { ...updated[updated.length - 1], text: currentAIText };
        return updated;
      });
    };
  
    window.addEventListener('ai-stream-chunk', updateStream);
  
    await window.electronAPI.streamPrompt(input);
  
    window.removeEventListener('ai-stream-chunk', updateStream);
  };
  
  
  

  return (
    <div className={styles.chatContainer}>
      <div className={styles.messages}>
        {messages.map((msg, idx) => (
          <div key={idx} className={styles[msg.role]}>
            <strong>{msg.role === 'user' ? 'You' : 'Code LLaMA'}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <div className={styles.inputArea}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask Code LLaMA anything..."
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}
