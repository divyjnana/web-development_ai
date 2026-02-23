import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setResponse("");
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/generate", {
        prompt,
      });

      if (res.data.success) {
        setResponse(res.data.data);
      } else {
        setError(res.data.error || "Unknown error");
      }
    } catch (err) {
      setError("Server not reachable");
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <h1>🤖 AI Assistant</h1>

      <textarea
        placeholder="Ask something..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <button onClick={generate} disabled={loading}>
        {loading ? "Generating..." : "Generate"}
      </button>

      {error && <div className="error">❌ {error}</div>}

      {response && (
        <div className="response-box">
          <h3>Response:</h3>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}

export default App;