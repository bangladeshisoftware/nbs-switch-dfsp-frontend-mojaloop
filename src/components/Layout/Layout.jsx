import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AiFillBank } from 'react-icons/ai';
import { TbLogout } from 'react-icons/tb';
import {
  MdDashboard,
  MdSwapHoriz,
  MdAccountBalanceWallet,
  MdHistory,
  MdVerified,
  MdReceiptLong,
  MdSavings,
  MdPeople,
  MdPerson,
} from 'react-icons/md';

import { HiOutlineClipboardDocumentList } from 'react-icons/hi2';

const NAV_GROUPS = [
  {
    title: 'Dashboard',
    items: [
      {
        to: '/',
        label: 'Dashboard',
        icon: <MdDashboard />,
      },
    ],
  },

  {
    title: 'Transactions',
    items: [
      {
        to: '/transfers',
        label: 'Transactions',
        icon: <MdSwapHoriz />,
      },
    ],
  },

  {
    title: 'Finance Management',
    items: [
      {
        to: '/liquidity',
        label: 'Liquidity',
        icon: <MdAccountBalanceWallet />,
      },

      {
        to: '/position-change-history',
        label: 'Positions History',
        icon: <MdHistory />,
      },

      {
        to: '/finalize-records',
        label: 'Finalize Records',
        icon: <MdVerified />,
      },

      {
        to: '/settlement-records',
        label: 'Settlement History',
        icon: <MdReceiptLong />,
      },

      {
        to: '/deposits-history',
        label: 'Deposits History',
        icon: <MdSavings />,
      },
    ],
  },

  {
    title: 'Admin / Auth',
    items: [
      {
        to: '/users',
        label: 'Users',
        icon: <MdPeople />,
      },

      {
        to: '/profile',
        label: 'Profile',
        icon: <MdPerson />,
      },

      {
        to: '/activity-logs',
        label: 'Activity Logs',
        icon: <HiOutlineClipboardDocumentList />,
      },
    ],
  },
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
    NAV_GROUPS.flatMap((group) => group.items).find(
      (n) => n.to === location.pathname,
    )?.label || 'Portal';

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
        </div>

        {/* Navigation */}
        <nav className='sidebar-nav'>
          {NAV_GROUPS.map((group) => (
            <div key={group.title} className='nav-group'>
              {/* Group Title */}
              <div className='nav-group-title'>{group.title}</div>

              {/* Group Items */}
              {group.items.map((item) => (
                <div
                  key={item.to}
                  className={`nav-item ${
                    location.pathname === item.to ? 'active' : ''
                  }`}
                  onClick={() => navigate(item.to)}
                >
                  <span style={{ fontSize: 14 }}>{item.icon}</span>

                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
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

      {/* Main Content */}
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
