import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const AdminDashboard = () => {
  const { user, isAdmin, isOrganizer, loading } = useAuth();
  const navigate = useNavigate();
  const [stats] = useState({
    tournaments: 0,
    teams: 0,
    players: 0,
    users: 0
  });

  useEffect(() => {
    if (!loading && !isAdmin && !isOrganizer) {
      navigate("/unauthorized");
    }
  }, [isAdmin, isOrganizer, loading, navigate]);

  const adminCards = [
    {
      id: "tournaments",
      title: "Manage Tournaments",
      description: "Create, edit, and manage esports tournaments",
      icon: "🏆",
      route: "/tournaments",
      color: "#FFD700",
      glowColor: "rgba(255, 215, 0, 0.3)"
    },
    {
      id: "teams",
      title: "Manage Teams", 
      description: "Organize and manage team rosters",
      icon: "👥",
      route: "/teams",
      color: "#00CED1",
      glowColor: "rgba(0, 206, 209, 0.3)"
    },
    {
      id: "players",
      title: "Manage Players",
      description: "Handle player registrations and profiles",
      icon: "🎮",
      route: "/players", 
      color: "#FF69B4",
      glowColor: "rgba(255, 105, 180, 0.3)"
    },
    {
      id: "registrations",
      title: "Manage Registrations",
      description: "Review and process tournament registrations",
      icon: "📝",
      route: "/register",
      color: "#32CD32",
      glowColor: "rgba(50, 205, 50, 0.3)"
    },
    {
      id: "users",
      title: "Manage Users",
      description: "Administrate user accounts and permissions",
      icon: "👤",
      route: "/users",
      color: "#FF6347",
      glowColor: "rgba(255, 99, 71, 0.3)"
    },
    {
      id: "reports",
      title: "Reports & Analytics",
      description: "View system statistics and reports",
      icon: "📊",
      route: "/reports",
      color: "#9370DB",
      glowColor: "rgba(147, 112, 219, 0.3)"
    }
  ];

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(255, 255, 255, 0.1)',
            borderTop: '4px solid #00a8ff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ color: '#9aa0aa', marginTop: '16px' }}>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin && !isOrganizer) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '60px 40px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🚫</div>
          <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#ff6b6b', marginBottom: '16px' }}>
            Access Denied
          </h2>
          <p style={{ color: '#9aa0aa', marginBottom: '32px' }}>
            You don&apos;t have permission to access this page.
          </p>
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
              background: 'linear-gradient(135deg, #00a8ff, #0066cc)',
              color: '#fff',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            🏠 Return Home
          </Link>
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
          }}>🎮 Admin Dashboard</h1>
          <p style={{
            fontSize: '1.2rem',
            color: '#9aa0aa',
            marginBottom: 0
          }}>
            Welcome back, {user?.name || "Admin"}! Manage your esports empire.
          </p>
        </div>
      </section>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
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
            <span style={{ fontSize: '1.8rem' }}>⚡</span>
            System Control Panel
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
              color: '#000',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>👑 ADMIN</span>
            <span style={{
              color: '#fff',
              fontWeight: '600'
            }}>{user?.name || "Admin"}</span>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '24px',
          marginBottom: '60px'
        }}>
          {adminCards.map((card) => (
            <Link
              key={card.id}
              to={card.route}
              style={{
                position: 'relative',
                display: 'block',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                padding: '32px',
                textDecoration: 'none',
                color: 'inherit',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                e.currentTarget.style.borderColor = card.color;
                e.currentTarget.style.boxShadow = `0 20px 40px rgba(0, 0, 0, 0.3), 0 0 40px ${card.glowColor}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                position: 'relative',
                zIndex: 2,
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '3.5rem',
                  marginBottom: '20px',
                  display: 'block',
                  color: card.color,
                  transition: 'transform 0.3s ease'
                }}>
                  {card.icon}
                </div>
                <h3 style={{
                  fontSize: '1.4rem',
                  fontWeight: '700',
                  color: '#fff',
                  marginBottom: '12px',
                  transition: 'color 0.3s ease'
                }}>
                  {card.title}
                </h3>
                <p style={{
                  color: '#9aa0aa',
                  fontSize: '1rem',
                  lineHeight: '1.5',
                  marginBottom: '20px'
                }}>
                  {card.description}
                </p>
                <div style={{
                  fontSize: '1.5rem',
                  color: card.color,
                  opacity: 0,
                  transform: 'translateX(-10px)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.opacity = '1';
                  e.target.style.transform = 'translateX(0)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.opacity = '0';
                  e.target.style.transform = 'translateX(-10px)';
                }}
                >→</div>
              </div>
            </Link>
          ))}
        </div>

        <div className="admin-stats">
          <h2 className="stats-title">📊 System Overview</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🏆</div>
              <div className="stat-info">
                <div className="stat-value">{stats.tournaments}</div>
                <div className="stat-label">Tournaments</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <div className="stat-value">{stats.teams}</div>
                <div className="stat-label">Teams</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🎮</div>
              <div className="stat-info">
                <div className="stat-value">{stats.players}</div>
                <div className="stat-label">Players</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👤</div>
              <div className="stat-info">
                <div className="stat-value">{stats.users}</div>
                <div className="stat-label">Users</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
