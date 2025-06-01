import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ImageGeneration.css';

const base_url = 'http://localhost:4000';



function ImageGeneration({ user }) {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [description, setDescription] = useState('');
  const [generatedResults, setGeneratedResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedImage || !description.trim()) {
      setError('Please select an image and provide a description');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('image', selectedImage);
    formData.append('text', description.trim());

    try {
      const response = await fetch(`${base_url}/colorize`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Failed to process image');

      const generatedText = response.headers.get('X-Generated-Text');
      
      // Convert the response to a blob and create an object URL
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
        const newResult = {
        url: imageUrl,
        text: generatedText || 'Image generated successfully',
        originalImage: imagePreview,
        description: description,
        timestamp: new Date().toISOString()
      };
      setGeneratedResults(prev => [newResult, ...prev]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setDescription('');
    setGeneratedImage(null);
    setError('');    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteResult = (timestamp) => {
    setGeneratedResults(prev => prev.filter(result => result.timestamp !== timestamp));
  };

  // Helper to convert a URL to a File object
  const urlToFile = async (url, filename, mimeType) => {
    const res = await fetch(url);
    const blob = await res.blob();
    return new File([blob], filename, { type: mimeType || blob.type });
  };

  // Handle click on result image (original or generated)
  const handleResultImageClick = async (imgType, result) => {
    if (imgType === 'original') {
      // Use the original preview (base64)
      setImagePreview(result.originalImage);
      setDescription(result.description);
      // Convert base64 to File so form can submit
      if (result.originalImage.startsWith('data:')) {
        const arr = result.originalImage.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const file = new File([u8arr], 'original.png', { type: mime });
        setSelectedImage(file);
      } else {
        setSelectedImage(null);
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    } else if (imgType === 'generated') {
      setLoading(true);
      try {
        const file = await urlToFile(result.url, 'generated.png');
        setSelectedImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
        setDescription(result.description);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="image-generation-container">
      <header className="header">
        <div className="logo-title" onClick={() => navigate('/')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 10h18M3 14h18M3 18h18M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          CAI
        </div>
        <div className="auth-buttons">
          {user ? (
            <span style={{color: '#fff', fontWeight: 500}}>{user.name}</span>
          ) : (
            <button className="login-btn" onClick={() => navigate('/login')}>Log in</button>
          )}
        </div>
      </header>
      <main className="image-generation-content">
        <h1 className="page-title">Image Generation</h1>
        <div className="image-generation-row-layout">
          <form className="image-form-side" onSubmit={handleSubmit}>
            <div className="image-upload-section">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                ref={fileInputRef}
                className="file-input"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="file-input-label">
                {imagePreview ? (
                  <img src={imagePreview} alt="Selected" className="image-preview" />
                ) : (
                  <>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 19V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2zM21 19H3m18 0l-5.5-5.5-3 3-4-4L3 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Click to upload image</span>
                  </>
                )}
              </label>
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe how you want to transform the image..."
                rows="4"
                required
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            <div className="button-group">
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Processing...' : 'Generate'}
              </button>
              {(selectedImage || description) && (
                <button type="button" className="reset-btn" onClick={handleReset}>
                  Reset
                </button>
              )}
            </div>
          </form>
          <div className="results-container-side">
            {generatedResults.length > 0 && (
              <div className="results-history">
                <h2>Generated Results</h2>
                <div className="results-list">
                  {generatedResults.map((result) => (
                    <div key={result.timestamp} className="result-card">
                      <div className="result-header">
                        <p className="result-timestamp">
                          {new Date(result.timestamp).toLocaleString()}
                        </p>
                        <button 
                          className="delete-btn" 
                          onClick={() => handleDeleteResult(result.timestamp)}
                        >
                          Delete
                        </button>
                      </div>
                      <div className="result-content">
                        <div className="result-info">
                          <p className="result-description">{result.description}</p>
                          <p className="result-text">{result.text}</p>
                        </div>
                        <div className="result-images">
                          <div className="image-container">
                            <h3>Original Image</h3>
                            <img src={result.originalImage} alt="Original" className="result-image original" style={{cursor:'pointer'}} onClick={() => handleResultImageClick('original', result)} />
                          </div>
                          <div className="image-container">
                            <h3>Generated Image</h3>
                            <img src={result.url} alt="Generated" className="result-image generated" style={{cursor:'pointer'}} onClick={() => handleResultImageClick('generated', result)} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default ImageGeneration;
