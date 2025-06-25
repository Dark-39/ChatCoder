import { useState } from 'react';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  async function sendMessage() {
    const userMsg = input;
    setMessages([...messages, { from: 'user', text: userMsg }]);
    setInput('');

    const res = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3',
        prompt: userMsg,
        stream: false
      })
    });

    const data = await res.json();
    setMessages(msgs => [...msgs, { from: 'llama', text: data.response }]);
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>LLaMA Chat</h1>
      <div style={{ height: 300, overflowY: 'scroll', border: '1px solid #ccc', marginBottom: 10 }}>
        {messages.map((msg, idx) => (
          <div key={idx}><b>{msg.from}:</b> {msg.text}</div>
        ))}
      </div>
      <input value={input} onChange={e => setInput(e.target.value)} style={{ width: '80%' }} />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default App;
