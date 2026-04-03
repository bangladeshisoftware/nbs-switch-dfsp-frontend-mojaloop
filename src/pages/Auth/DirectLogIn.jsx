import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { MdLogin } from 'react-icons/md';
import './login.css';
import { IoEye } from 'react-icons/io5';
import { IoMdEyeOff } from 'react-icons/io';
import logo from '../../assets/logo.png';
import { AiFillBank } from 'react-icons/ai';

export default function DirectLogin() {
  const params = useParams();
  useEffect(() => {
    if (params) {
      // call function
      const { ref } = params;
      handleLogin(ref);
    }
  }, []);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (ref) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/direct-login', {
        // username: username,
        // password: password,
        token:ref, // from params
      });
      if (res?.data?.error) {
        return setError(res?.data?.error || 'Login failed');
      }
      localStorage.setItem('dfsp_token', res.data.token);
      localStorage.setItem('dfsp_user', JSON.stringify(res.data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div style={{ width: '100%', maxWidth: 380 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center' }}>
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
        </div>

        <div className='card'>
          <div className='card-body'>
            {error && (
              <div
                style={{
                  background: '#ff444411',
                  border: '1px solid #ff444433',
                  color: '#ff6666',
                  padding: '8px 12px',
                  borderRadius: 6,
                  fontSize: 12,
                  marginBottom: 14,
                }}
              >
                {error}
              </div>
            )}

            {loading ? (
              <div style={{ padding: 14 }}>
                <h3
                  style={{
                    textAlign: 'center',
                    fontWeight: 500,
                    fontFamily: 'sans-serif',
                  }}
                >
                  Redirecting to Dashboard...
                </h3>
              </div>
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  fontWeight: 500,
                  fontFamily: 'sans-serif',
                }}
              >
                <h3
                  style={{
                    textAlign: 'center',
                    fontWeight: 500,
                    fontFamily: 'sans-serif',
                  }}
                >
                  Something went wrong!{' '}
                </h3>
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            textAlign: 'center',
            marginTop: 16,
            fontSize: 10,
            color: '#333',
          }}
        >
          R Switch Portal · Secure DFSP Access
        </div>
      </div>
    </div>
  );
}
