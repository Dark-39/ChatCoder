const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  streamPrompt: async (promptText) => {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'codellama',
        prompt: promptText,
        stream: true
      }),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullText = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      // Each line is a JSON object
      const lines = chunk.split('\n').filter(Boolean);
      for (const line of lines) {
        const json = JSON.parse(line);
        fullText += json.response || '';
        window.dispatchEvent(
          new CustomEvent('ai-stream-chunk', { detail: fullText })
        );
      }
    }
    return fullText;
  }
});
