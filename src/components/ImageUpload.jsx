import '../styles/Chat.css';
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const base_url = 'http://localhost:4000';

function ImageUpload({ user, setUser }) {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [llamaOutputImage, setLlamaOutputImage] = useState(null);
  const [llamaOutputText, setLlamaOutputText] = useState(null);
  const [colorizeOutputImage, setColorizeOutputImage] = useState(null);
  const [colorizeOutputText, setColorizeOutputText] = useState(null);
  const [input, setInput] = useState('');
  const inputRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem('cai_user');
    setUser(null);
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
      setOutput(null);
      setLlamaOutputImage(null);
      setLlamaOutputText(null);
      setColorizeOutputImage(null);
      setColorizeOutputText(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image || loading) return;
    setLoading(true);
    setOutput(null);
    const formData = new FormData();
    formData.append('image', image);
    try {
      const response = await fetch(`${base_url}/api/image`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to get response');
      setOutput(data.text || 'No output received.');
    } catch (error) {
      setOutput('Sorry, I encountered an error processing your image.');
    } finally {
      setLoading(false);
    }
  };

  const handleLlamaSubmit = async (e) => {
    e.preventDefault();
    if (!image || loading) return;
    setLoading(true);
    setLlamaOutputImage(null);
    setLlamaOutputText(null);
    const formData = new FormData();
    formData.append('image', image);
    formData.append('prompt', input || 'Can you add a llama next to me?');
    try {
      const response = await fetch(`${base_url}/api/llama-image`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to get response');
      setLlamaOutputImage(data.image);
      setLlamaOutputText(data.text);
    } catch (error) {
      setLlamaOutputText('Sorry, I encountered an error processing your image.');
    } finally {
      setLoading(false);
    }
  };

  const handleColorizeSubmit = async (e) => {
    e.preventDefault();
    if (!image || loading) return;
    setLoading(true);
    setColorizeOutputImage(null);
    setColorizeOutputText(null);
    const formData = new FormData();
    formData.append('image', image);
    formData.append('text', input || 'Colorize this image.');
    try {
      const response = await fetch(`${base_url}/colorize`, {
        method: 'POST',
        body: formData
      });
      if (response.headers.get('X-Generated-Text')) {
        setColorizeOutputText(response.headers.get('X-Generated-Text'));
      }
      const blob = await response.blob();
      if (blob.type.startsWith('image/')) {
        setColorizeOutputImage(URL.createObjectURL(blob));
      } else {
        setColorizeOutputText('No image returned.');
      }
    } catch (error) {
      setColorizeOutputText('Sorry, I encountered an error processing your image.');
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
        <div className="chat-content visible">
          {image && (
            <div className="message user">
              <div className="message-content">
                <img src={URL.createObjectURL(image)} alt="Uploaded" style={{maxWidth: '200px', borderRadius: '8px'}} />
              </div>
            </div>
          )}
          {output && (
            <div className="message assistant">
              <div className="message-content">
                {output}
              </div>
            </div>
          )}
          {llamaOutputImage && (
            <div className="message assistant">
              <div className="message-content">
                <img src={llamaOutputImage} alt="Llama Output" style={{maxWidth: '200px', borderRadius: '8px'}} />
                {llamaOutputText && <div style={{marginTop: '0.5rem'}}>{llamaOutputText}</div>}
              </div>
            </div>
          )}
          {colorizeOutputImage && (
            <div className="message assistant">
              <div className="message-content">
                <img src={colorizeOutputImage} alt="Colorized Output" style={{maxWidth: '200px', borderRadius: '8px'}} />
                {colorizeOutputText && <div style={{marginTop: '0.5rem'}}>{colorizeOutputText}</div>}
              </div>
            </div>
          )}
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
        <div className="prompt-box chat-active">
          <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
            <div className="input-row">
              <input
                type="file"
                accept="image/*"
                className="prompt-input"
                onChange={handleImageChange}
                ref={inputRef}
              />
              <div className="input-actions">
                <button className="action-btn" type="submit" disabled={loading || !image}>
                  Upload
                </button>
              </div>
            </div>
          </form>
          <form onSubmit={handleLlamaSubmit}>
            <div className="input-row">
              <input
                className="prompt-input"
                placeholder="Describe what you want (e.g. add a llama)"
                value={input}
                onChange={e => setInput(e.target.value)}
                spellCheck={false}
                style={{ marginRight: '1rem' }}
              />
              <div className="input-actions">
                <button className="action-btn" type="submit" disabled={loading || !image}>
                  Generate Llama Image
                </button>
              </div>
            </div>
          </form>
          <form onSubmit={handleColorizeSubmit} style={{ marginBottom: '1rem' }}>
            <div className="input-row">
              <input
                className="prompt-input"
                placeholder="Describe how to colorize (e.g. make it colorful)"
                value={input}
                onChange={e => setInput(e.target.value)}
                spellCheck={false}
                style={{ marginRight: '1rem' }}
              />
              <div className="input-actions">
                <button className="action-btn" type="submit" disabled={loading || !image}>
                  Colorize Image
                </button>
              </div>
            </div>
          </form>
        </div>
        {llamaOutputImage && (
          <div className="message assistant">
            <div className="message-content">
              <img src={llamaOutputImage} alt="Llama Output" style={{maxWidth: '200px', borderRadius: '8px'}} />
              {llamaOutputText && <div style={{marginTop: '0.5rem'}}>{llamaOutputText}</div>}
            </div>
          </div>
        )}
        {colorizeOutputImage && (
          <div className="message assistant">
            <div className="message-content">
              <img src={colorizeOutputImage} alt="Colorized Output" style={{maxWidth: '200px', borderRadius: '8px'}} />
              {colorizeOutputText && <div style={{marginTop: '0.5rem'}}>{colorizeOutputText}</div>}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ImageUpload;
