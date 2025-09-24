import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const HiddenLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [botDetected, setBotDetected] = useState(false);
  const [accessAttempts, setAccessAttempts] = useState(0);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Bot detection and protection
  useEffect(() => {
    const detectBot = () => {
      // Check for common bot indicators
      const userAgent = navigator.userAgent.toLowerCase();
      const botPatterns = [
        'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget', 'python', 'java',
        'php', 'go-http', 'node', 'axios', 'requests', 'urllib', 'mechanize',
        'selenium', 'phantom', 'headless', 'automated', 'test'
      ];
      
      const isBot = botPatterns.some(pattern => userAgent.includes(pattern));
      
      // Check for missing browser features
      const hasBrowserFeatures = 
        typeof window !== 'undefined' &&
        typeof document !== 'undefined' &&
        typeof navigator !== 'undefined' &&
        navigator.cookieEnabled &&
        navigator.languages &&
        navigator.platform;
      
      // Check for automated behavior indicators
      const hasHumanBehavior = 
        window.screen && 
        window.screen.width > 0 && 
        window.screen.height > 0 &&
        window.innerWidth > 0 &&
        window.innerHeight > 0;
      
      if (isBot || !hasBrowserFeatures || !hasHumanBehavior) {
        setBotDetected(true);
        return true;
      }
      
      return false;
    };

    // Immediate bot detection
    if (detectBot()) {
      return;
    }

    // Additional bot detection on interaction
    const handleInteraction = () => {
      const timeSinceLoad = Date.now() - window.performance.timing.loadEventEnd;
      if (timeSinceLoad < 1000) { // Too fast interaction
        setBotDetected(true);
      }
    };

    document.addEventListener('click', handleInteraction, { once: true });
    document.addEventListener('keydown', handleInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  // Block access if bot detected
  useEffect(() => {
    if (botDetected) {
      // Log the bot attempt
      console.warn('Bot access attempt detected and blocked');
      
      // Redirect to a fake page or show error
      setTimeout(() => {
        window.location.href = '/404';
      }, 1000);
    }
  }, [botDetected]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (botDetected) {
      setError('Access denied');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
      setAccessAttempts(prev => prev + 1);
      
      // Block after multiple failed attempts
      if (accessAttempts >= 3) {
        setBotDetected(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // Don't render anything if bot detected
  if (botDetected) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#000',
        color: '#fff',
        fontFamily: 'monospace'
      }}>
        <div>Access Denied</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0a0a0a',
      backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(120, 219, 255, 0.3) 0%, transparent 50%)',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '20px',
        padding: '40px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{
            color: '#fff',
            fontSize: '28px',
            fontWeight: '700',
            marginBottom: '8px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Zanwik Dashboard
          </h1>
          <p style={{ color: '#a1a1aa', fontSize: '14px' }}>
            Secure Access Portal
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              color: '#e4e4e7',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '8px'
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = 'rgba(102, 126, 234, 0.5)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              color: '#e4e4e7',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '8px'
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = 'rgba(102, 126, 234, 0.5)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
            />
          </div>

          {error && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '20px',
              color: '#fca5a5',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: loading ? 'rgba(102, 126, 234, 0.5)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              opacity: loading ? 0.7 : 1
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 10px 25px -5px rgba(102, 126, 234, 0.4)';
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }
            }}
          >
            {loading ? 'Authenticating...' : 'Access Dashboard'}
          </button>
        </form>

        <div style={{
          marginTop: '30px',
          paddingTop: '20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'center'
        }}>
          <p style={{ color: '#71717a', fontSize: '12px' }}>
            Secure access only • No public links
          </p>
        </div>
      </div>
    </div>
  );
};

export default HiddenLogin;
