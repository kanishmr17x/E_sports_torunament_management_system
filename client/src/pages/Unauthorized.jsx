import { Link } from "react-router-dom";

const Unauthorized = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '80px 20px'
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '600px',
        width: '100%'
      }}>
        <div style={{
          fontSize: '5rem',
          marginBottom: '32px',
          display: 'block'
        }}>
          🔒
        </div>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: '700',
          color: '#fff',
          marginBottom: '20px'
        }}>
          Admin Access Required
        </h2>
        <p style={{
          fontSize: '1.1rem',
          color: '#9aa0aa',
          lineHeight: '1.6',
          marginBottom: '40px'
        }}>
          This page is restricted to administrators only. If you believe this is an error, 
          please contact the system administrator or log in with an admin account.
        </p>
        
        <div style={{ 
          display: 'flex', 
          gap: '16px', 
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <Link 
            to="/" 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '700',
              fontSize: '14px',
              background: 'linear-gradient(135deg, #00a8ff, #0066cc)',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            🏠 Return Home
          </Link>
          <Link 
            to="/login" 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '700',
              fontSize: '14px',
              background: 'transparent',
              color: '#fff',
              border: '2px solid #00a8ff',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            🔐 Login Again
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
