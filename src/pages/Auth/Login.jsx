/**************************************************************************
 * Copyright © 2026 Bangladeshi Software Ltd. All rights reserved.
 * Distributed under the license terms specified in this repository.
 *
 * ORIGINAL AUTHOR: Muhammad Nasim (Developer)
 **************************************************************************/

import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { MdLogin } from 'react-icons/md';
import './login.css';
import { IoEye } from 'react-icons/io5';
import { IoMdEyeOff } from 'react-icons/io';
import logo from '../../assets/logo.png';
import { AiFillBank } from 'react-icons/ai';

export default function Login() {
  const navigate = useNavigate();
  const [step, setStep] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ username: '', password: '', otp: '' });
  const [hint, setHint] = useState({ email: '', dfsp: '' });
  const [isVisible, setIsVisible] = useState(false);
  const fE = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', {
        username: form.username,
        password: form.password,
      });
      if (res?.data?.error) {
        return setError(res?.data?.error || 'Login failed');
      }
      setHint({ email: res.data.email_hint, dfsp: res.data.dfsp_name });
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/verify-otp', {
        username: form.username,
        otp: form.otp,
      });
      localStorage.setItem('dfsp_token', res.data.token);
      localStorage.setItem('dfsp_user', JSON.stringify(res.data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP');
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
          <div className='card-header'>
            <span className='card-title'>
              {step === 'login' ? <>Login</> : '📱 Verify OTP'}
            </span>
          </div>
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

            {step === 'login' ? (
              <form onSubmit={handleLogin}>
                <div className='form-group'>
                  <label className='form-label'>Username or Email</label>
                  <input
                    className='form-input'
                    value={form.username}
                    onChange={fE('username')}
                    required
                    placeholder='Enter username'
                  />
                </div>
                <div className='form-group' style={{ position: 'relative' }}>
                  <label className='form-label'>Password</label>
                  <input
                    className='form-input'
                    type={isVisible ? 'text' : 'password'}
                    value={form.password}
                    onChange={fE('password')}
                    required
                    placeholder='Enter password'
                  />
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '23px',
                      right: '10px',
                    }}
                  >
                    {isVisible ? (
                      <IoMdEyeOff
                        className='eye'
                        onClick={() => setIsVisible((prev) => !prev)}
                        size={25}
                        color='#7114db'
                      />
                    ) : (
                      <IoEye
                        className='eye'
                        onClick={() => setIsVisible((prev) => !prev)}
                        size={25}
                        color='#7114db'
                      />
                    )}
                  </div>
                </div>
                <button
                  className='btn btn-primary'
                  style={{
                    width: '100%',
                    padding: '10px',
                    justifyContent: 'center',
                  }}
                  disabled={loading}
                >
                  {loading ? '⏳ Signing in...' : '→ Sign In'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerify}>
                <div
                  style={{
                    background: '#001a00',
                    border: '1px solid #003300',
                    borderRadius: 6,
                    padding: '10px 14px',
                    marginBottom: 16,
                    fontSize: 11,
                    color: '#888',
                  }}
                >
                  OTP sent to{' '}
                  <strong style={{ color: '#00ff00' }}>{hint.email}</strong>
                  <br />
                  <span style={{ fontSize: 10 }}>Expires in 10 minutes</span>
                </div>
                <div className='form-group'>
                  <label className='form-label'>Enter OTP</label>
                  <input
                    className='form-input'
                    value={form.otp}
                    onChange={fE('otp')}
                    required
                    placeholder='6-digit code'
                    maxLength={6}
                    style={{
                      fontSize: 22,
                      letterSpacing: 8,
                      textAlign: 'center',
                      fontFamily: 'Courier New',
                    }}
                    autoFocus
                  />
                </div>
                <button
                  className='btn btn-primary'
                  style={{
                    width: '100%',
                    padding: '10px',
                    justifyContent: 'center',
                  }}
                  disabled={loading}
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
                <button
                  type='button'
                  className='btn btn-secondary'
                  style={{
                    width: '100%',
                    marginTop: 8,
                    justifyContent: 'center',
                  }}
                  onClick={() => {
                    setStep('login');
                    setError('');
                  }}
                >
                  Back
                </button>
              </form>
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
          R Switch Portal - Secure DFSP Access
        </div>
      </div>
    </div>
  );
}
