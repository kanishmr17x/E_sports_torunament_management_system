import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";

const Reports = () => {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalTournaments: 12,
    totalTeams: 48,
    totalPlayers: 156,
    activeUsers: 89,
    recentRegistrations: 23
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)',
        display: 'flex',
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
            }}>📊 Reports & Analytics</h1>
            <p style={{
              fontSize: '1.2rem',
              color: '#9aa0aa',
              marginBottom: 0
            }}>View system statistics and insights.</p>
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
          <p style={{ color: '#9aa0aa', marginTop: '16px' }}>Loading analytics...</p>
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
          }}>📊 Reports & Analytics</h1>
            <p style={{
              fontSize: '1.2rem',
              color: '#9aa0aa',
              marginBottom: 0
            }}>View system statistics and insights.</p>
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
            <span style={{ fontSize: '1.8rem' }}>📊</span>
            System Overview
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          marginBottom: '60px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '32px',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{
                fontSize: '1.4rem',
                fontWeight: '700',
                color: '#fff',
                marginBottom: '8px'
              }}>🏆 Tournaments</h3>
              <p style={{
                fontSize: '1rem',
                color: '#9aa0aa'
              }}>Total Events</p>
            </div>

            <div style={{
              display: 'flex',
              gap: '16px',
              marginBottom: '16px'
            }}>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#fff'
                }}>{stats.totalTournaments}</div>
                <div style={{
                  fontSize: '0.9rem',
                  color: '#9aa0aa',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>Active</div>
              </div>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#fff'
                }}>3</div>
                <div style={{
                  fontSize: '0.9rem',
                  color: '#9aa0aa',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>This Month</div>
              </div>
            </div>

            <div style={{
              fontSize: '1rem',
              color: '#9aa0aa',
              textAlign: 'center',
              marginBottom: '16px'
            }}>
              +15% from last month
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '32px',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{
                fontSize: '1.4rem',
                fontWeight: '700',
                color: '#fff',
                marginBottom: '8px'
              }}>👥 Teams</h3>
              <p style={{
                fontSize: '1rem',
                color: '#9aa0aa'
              }}>Registered</p>
            </div>

            <div style={{
              display: 'flex',
              gap: '16px',
              marginBottom: '16px'
            }}>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#fff'
                }}>{stats.totalTeams}</div>
                <div style={{
                  fontSize: '0.9rem',
                  color: '#9aa0aa',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>Total</div>
              </div>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#fff'
                }}>12</div>
                <div style={{
                  fontSize: '0.9rem',
                  color: '#9aa0aa',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>New Today</div>
              </div>
            </div>

            <div style={{
              fontSize: '1rem',
              color: '#9aa0aa',
              textAlign: 'center',
              marginBottom: '16px'
            }}>
              +8% growth
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '32px',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{
                fontSize: '1.4rem',
                fontWeight: '700',
                color: '#fff',
                marginBottom: '8px'
              }}>🎮 Players</h3>
              <p style={{
                fontSize: '1rem',
                color: '#9aa0aa'
              }}>Active Users</p>
            </div>

            <div style={{
              display: 'flex',
              gap: '16px',
              marginBottom: '16px'
            }}>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#fff'
                }}>{stats.totalPlayers}</div>
                <div style={{
                  fontSize: '0.9rem',
                  color: '#9aa0aa',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>Registered</div>
              </div>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#fff'
                }}>{stats.activeUsers}</div>
                <div style={{
                  fontSize: '0.9rem',
                  color: '#9aa0aa',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>Active</div>
              </div>
            </div>

            <div style={{
              fontSize: '1rem',
              color: '#9aa0aa',
              textAlign: 'center',
              marginBottom: '16px'
            }}>
              57% active rate
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '32px',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{
                fontSize: '1.4rem',
                fontWeight: '700',
                color: '#fff',
                marginBottom: '8px'
              }}>📝 Registrations</h3>
              <p style={{
                fontSize: '1rem',
                color: '#9aa0aa'
              }}>Recent Activity</p>
            </div>

            <div style={{
              display: 'flex',
              gap: '16px',
              marginBottom: '16px'
            }}>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#fff'
                }}>{stats.recentRegistrations}</div>
                <div style={{
                  fontSize: '0.9rem',
                  color: '#9aa0aa',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>Today</div>
              </div>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#fff'
                }}>156</div>
                <div style={{
                  fontSize: '0.9rem',
                  color: '#9aa0aa',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>This Week</div>
              </div>
            </div>

            <div style={{
              fontSize: '1rem',
              color: '#9aa0aa',
              textAlign: 'center',
              marginBottom: '16px'
            }}>
              High activity
            </div>
          </div>
        </div>

        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <h2 style={{
            color: '#fff',
            textAlign: 'center',
            marginBottom: '32px',
            fontSize: '2rem'
          }}>
            📈 Recent Activity
          </h2>
          <div style={{
            textAlign: 'center',
            padding: '60px 40px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '32px', color: '#fff' }}>📊</div>
            <h3 style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#fff',
              marginBottom: '20px'
            }}>Analytics Dashboard</h3>
            <p style={{
              fontSize: '1.1rem',
              color: '#9aa0aa',
              lineHeight: '1.6'
            }}>
              Advanced analytics and reporting features coming soon. This will include detailed charts,
              user engagement metrics, tournament performance data, and more.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
