import './App.css';
import { HashRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import Login from './components/Login';
import Signup from './components/Signup';

import ImageGeneration from './components/ImageGeneration';
import ReactMarkdown from 'react-markdown';

const base_url = 'https://aadil.pythonanywhere.com';

function Home({ user, setUser }) {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [isChatActive, setIsChatActive] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [shouldReset, setShouldReset] = useState(true); // Track if we need to reset context
  const chatContentRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setShouldReset(true); // On mount/page refresh, set reset flag
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('cai_user');
    setUser(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setIsChatActive(true);
    setLoading(true);

    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const response = await fetch(`${base_url}/api/gemini`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: userMessage, reset: shouldReset }),
        credentials: 'include',
      });

      setShouldReset(false); // Only reset on first message after refresh

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error processing your request.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-bg">
      <header className="header">
        <div className="logo-title" onClick={() => navigate('/')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 10h18M3 14h18M3 18h18M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          CAI          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>        <div style={{ marginLeft: '2rem', display: 'flex', gap: '1rem' }}>
          <button
            className="action-btn"
            style={{ 
              padding: '0.5rem 1rem',
              fontSize: '0.9rem',
              fontWeight: 500
            }}
            onClick={() => navigate('/image-generation')}
          >
            Image Tools
          </button>
          <button
            className="action-btn"
            style={{ 
              padding: '0.5rem 1rem',
              fontSize: '0.9rem',
              fontWeight: 500
            }}
            onClick={() => navigate('/image-generation')}
          >
            Image Generation
          </button>
        </div>
        <div className="auth-buttons">
          {user ? (
            <>
              <span style={{marginRight: '1rem', color: '#fff', fontWeight: 500}}>{user.name}</span>
              <button className="login-btn" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <button className="login-btn" onClick={() => navigate('/login')}>Log in</button>
              <button className="signup-btn" onClick={() => navigate('/signup')}>Sign up</button>
            </>
          )}
        </div>
      </header>
      <main className="center-content">
        {isChatActive && (
          <div className={`chat-content visible`} ref={chatContentRef}>
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.role}`}>
                <div className="message-content">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              </div>
            ))}
            {loading && (
              <div className="message assistant">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div className="bottom-spacer"></div>
          </div>
        )}
        <div className={`prompt-box ${isChatActive ? 'chat-active' : ''}`}>
          <div className={`prompt-title ${isChatActive ? 'hidden' : ''}`}>
            What can I help with?
          </div>
          <form onSubmit={handleSubmit}>
            <div className="input-row">
              <input
                className="prompt-input"
                placeholder="Ask anything"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                spellCheck={false}
                ref={inputRef}
              />
              <div className="input-actions">
                <button className="action-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Attach
                </button>
                <button className="action-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                    <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Search
                </button>
                <button className="action-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2v20M2 12h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Reason
                </button>
                <button className="voice-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Voice
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('cai_user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  return (
    <Router>      <Routes>
        <Route path="/" element={<Home user={user} setUser={setUser} />} />
        <Route path="/image-generation" element={<ImageGeneration user={user} />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
}

export default App;
