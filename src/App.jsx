import './App.css';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import Login from './components/Login';
import Signup from './components/Signup';

function Home({ user, setUser }) {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [isChatActive, setIsChatActive] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorTimeout, setErrorTimeout] = useState(null);
  const inputRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem('cai_user');
    setUser(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setIsChatActive(true);
    setLoading(true);
    setShowResponse(false);
    setResponse("");
    if (errorTimeout) clearTimeout(errorTimeout);
    // Set a timeout to show error only after 20 seconds
    const timeout = setTimeout(() => {
      setLoading(false);
      setResponse('Sorry, there was an error connecting to Gemini.');
      setShowResponse(true);
    }, 20000);
    setErrorTimeout(timeout);
    try {
      // Call Gemini API
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemini-2.5-flash-preview-05-20',
          prompt: input
        })
      });
      const data = await res.json();
      clearTimeout(timeout);
      setTimeout(() => {
        setResponse(data.text || 'Sorry, I could not generate a response.');
        setShowResponse(true);
        setLoading(false);
      }, 300);
    } catch (err) {
      clearTimeout(timeout);
      setTimeout(() => {
        setResponse('Sorry, there was an error connecting to Gemini.');
        setShowResponse(true);
        setLoading(false);
      }, 300);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="main-bg">
      <header className="header">
        <div className="logo-title" onClick={() => navigate('/')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 10h18M3 14h18M3 18h18M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          CAI
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
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
        {showResponse && (
          <div className={`chat-content visible`}>
            <div className="chat-message">
              {response}
            </div>
          </div>
        )}
        {loading && (
          <div className={`chat-content visible`}>
            <div className="chat-message">
              <span>Thinking...</span>
            </div>
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
                onKeyPress={handleKeyPress}
                spellCheck={false}
                ref={inputRef}
                disabled={loading}
              />
              <div className="input-actions">
                <button type="submit" className="action-btn" disabled={loading}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2v20M2 12h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Send
                </button>
                <button type="button" className="action-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Attach
                </button>
                <button type="button" className="action-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                    <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Search
                </button>
                <button type="button" className="action-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2v20M2 12h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Reason
                </button>
                <button type="button" className="voice-btn">
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
    <Router>
      <Routes>
        <Route path="/" element={<Home user={user} setUser={setUser} />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
}

export default App;
