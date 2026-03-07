import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import logo from '../../assets/logo.png';
import { AiFillBank } from 'react-icons/ai';
import { TbLogout } from 'react-icons/tb';

const NAV = [
  { to: '/', label: 'Dashboard', icon: '⊞' },
  { to: '/transfers', label: 'Transactions', icon: '⇄' },
  { to: '/merchants', label: 'Merchants', icon: '⊙' },
  { to: '/liquidity', label: 'Liquidity', icon: '⬡' },
  { to: '/users', label: 'Users', icon: '◎' },
  { to: '/profile', label: 'Profile', icon: '⊟' },
  { to: '/activity-logs', label: 'Activity Logs', icon: '▤' },
];

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('dfsp_user') || '{}');
      setUser(u);
    } catch {}
  }, []);

  const logout = () => {
    localStorage.removeItem('dfsp_token');
    localStorage.removeItem('dfsp_user');
    navigate('/login');
  };

  const currentPage =
    NAV.find((n) => n.to === location.pathname)?.label || 'Portal';

  return (
    <div className='layout'>
      {/* Sidebar */}
      <aside className='sidebar'>
        <div className='sidebar-logo'>
          <AiFillBank size={45} color='rgb(154 221 0)' />
          <div>
            <div className='sidebar-logo-title'>DFSP PORTAL</div>
            <div className='sidebar-logo-sub'>Mojaloop Financial Switch</div>
          </div>
          {/* <Link to={'/'}>
            <img src={logo}  />
          </Link>  */}
        </div>

        <nav className='sidebar-nav'>
          {NAV.map((item) => (
            <div
              key={item.to}
              className={`nav-item ${location.pathname === item.to ? 'active' : ''}`}
              onClick={() => navigate(item.to)}
            >
              <span style={{ fontSize: 14 }}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        <div className='sidebar-footer'>
          <button
            className='btn btn-secondary'
            style={{ width: '100%', fontSize: 11 }}
            onClick={logout}
          >
            <TbLogout /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className='main'>
        <header className='topbar'>
          <span className='topbar-title'>{currentPage}</span>
          <div className='topbar-right'>
            {user && (
              <>
                <span className='topbar-user'>
                  {user.full_name || user.username}
                </span>
                <span className='topbar-role'>{user.role}</span>
              </>
            )}
          </div>
        </header>

        <div className='page-wrap'>{children}</div>
      </div>
    </div>
  );
}
