import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";

const UserList = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const mockUsers = [
      {
        _id: "1",
        name: "Admin User",
        email: "admin@esports.com",
        role: "admin",
        createdAt: new Date().toISOString(),
        status: "active"
      },
      {
        _id: "2", 
        name: "Player One",
        email: "player1@esports.com",
        role: "user",
        createdAt: new Date().toISOString(),
        status: "active"
      },
      {
        _id: "3",
        name: "Player Two", 
        email: "player2@esports.com",
        role: "user",
        createdAt: new Date().toISOString(),
        status: "active"
      }
    ];
    
    setUsers(mockUsers);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <section style={{
          position: 'relative',
          padding: '80px 20px 40px',
          textAlign: 'center',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(255, 0, 150, 0.1) 0%, rgba(0, 150, 255, 0.1) 100%)',
            zIndex: 1
          }} />
          <div style={{
            position: 'relative',
            zIndex: 2,
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <h1 style={{
              fontSize: '3.5rem',
              fontWeight: '800',
              color: '#fff',
              marginBottom: '16px',
              textShadow: '0 0 20px rgba(255, 0, 150, 0.5)'
            }}>👥 Users</h1>
            <p style={{
              fontSize: '1.2rem',
              color: '#9aa0aa',
              marginBottom: 0
            }}>Manage user accounts and permissions.</p>
          </div>
        </section>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '200px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(255, 255, 255, 0.1)',
            borderTop: '4px solid #00a8ff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ color: '#9aa0aa', marginTop: '16px' }}>Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <section style={{
          position: 'relative',
          padding: '80px 20px 40px',
          textAlign: 'center',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(255, 0, 150, 0.1) 0%, rgba(0, 150, 255, 0.1) 100%)',
            zIndex: 1
          }} />
          <div style={{
            position: 'relative',
            zIndex: 2,
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <h1 style={{
              fontSize: '3.5rem',
              fontWeight: '800',
              color: '#fff',
              marginBottom: '16px',
              textShadow: '0 0 20px rgba(255, 0, 150, 0.5)'
            }}>👥 Users</h1>
            <p style={{
              fontSize: '1.2rem',
              color: '#9aa0aa',
              marginBottom: 0
            }}>Manage user accounts and permissions.</p>
          </div>
        </section>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '200px'
        }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '32px',
            color: '#ff6b6b'
          }}>⚠️</div>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#ff6b6b',
            marginBottom: '16px'
          }}>Error Loading Users</h2>
          <p style={{
            fontSize: '1.1rem',
            color: '#9aa0aa',
            marginBottom: '32px',
            maxWidth: '400px'
          }}>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #00a8ff, #0066cc)',
              color: '#fff',
              border: 'none',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)'
    }}>
      <section style={{
        position: 'relative',
        padding: '80px 20px 40px',
        textAlign: 'center',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(255, 0, 150, 0.1) 0%, rgba(0, 150, 255, 0.1) 100%)',
          zIndex: 1
        }} />
        <div style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: '800',
            color: '#fff',
            marginBottom: '16px',
            textShadow: '0 0 20px rgba(255, 0, 150, 0.5)'
          }}>👥 Users</h1>
            <p style={{
              fontSize: '1.2rem',
              color: '#9aa0aa',
              marginBottom: 0
            }}>Manage user accounts and permissions.</p>
          </div>
        </section>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '40px',
          padding: '20px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '16px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#fff'
          }}>
            <span style={{ fontSize: '1.8rem' }}>👥</span>
            Users Management
          </div>
        </div>
        
        {users.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 40px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{
              fontSize: '4rem',
              marginBottom: '32px',
              color: '#fff'
            }}>👤</div>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#fff',
              marginBottom: '20px'
            }}>No Users Found</h2>
            <p style={{
              fontSize: '1.1rem',
              color: '#9aa0aa',
              lineHeight: '1.6'
            }}>
              No user accounts found in the system.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {users.map((user) => (
              <div key={user._id} style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                padding: '32px',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  marginBottom: '16px'
                }}>
                  <h3 style={{
                    fontSize: '1.4rem',
                    fontWeight: '700',
                    color: '#fff',
                    marginBottom: '8px'
                  }}>{user.name}</h3>
                  <p style={{
                    fontSize: '1rem',
                    color: '#9aa0aa',
                    marginBottom: '16px'
                  }}>{user.email}</p>
                </div>
                
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    textAlign: 'center',
                    flex: 1
                  }}>
                    <div style={{
                      fontSize: '2rem',
                      fontWeight: '700',
                      color: '#fff'
                    }}>{user.role}</div>
                    <div style={{
                      fontSize: '0.9rem',
                      color: '#9aa0aa',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>Role</div>
                  </div>
                  <div style={{
                    textAlign: 'center',
                    flex: 1
                  }}>
                    <div style={{
                      fontSize: '2rem',
                      fontWeight: '700',
                      color: '#fff'
                    }}>{user.status}</div>
                    <div style={{
                      fontSize: '0.9rem',
                      color: '#9aa0aa',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>Status</div>
                  </div>
                </div>

                <div style={{
                  fontSize: '1rem',
                  color: '#9aa0aa',
                  textAlign: 'center',
                  marginBottom: '16px'
                }}>
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </div>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <button 
                    style={{
                      padding: '12px 24px',
                      borderRadius: '8px',
                      background: 'transparent',
                      color: '#fff',
                      border: '2px solid #00a8ff',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                  >
                    👁️ View Details
                  </button>
                  {isAdmin && (
                    <button
                      style={{
                        padding: '12px 24px',
                        borderRadius: '8px',
                        background: '#dc3545',
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        fontSize: '14px',
                        fontWeight: '600',
                        marginTop: '8px'
                      }}
                    >
                      🗑️ Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList;
