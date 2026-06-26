/**************************************************************************
 * Copyright © 2026 Bangladeshi Software Ltd. All rights reserved.
 * Distributed under the license terms specified in this repository.
 *
 * ORIGINAL AUTHOR: Muhammad Nasim (Developer)
 **************************************************************************/

import { useState, useEffect } from 'react';
import api from '../../services/api';

const ROLES = ['ADMIN', 'OPERATOR', 'VIEWER'];

export default function Users() {
  const me = JSON.parse(localStorage.getItem('dfsp_user') || '{}');
  const [data, setData] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    role: 'VIEWER',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const fF = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const load = () =>
    api
      .get('/auth/users')
      .then((r) => setData(r.data.data || []))
      .catch(() => {});
  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setForm({
      username: '',
      email: '',
      password: '',
      full_name: '',
      role: 'VIEWER',
    });
    setErr('');
    setModal('create');
  };
  const openEdit = (u) => {
    setForm({ ...u, password: '' });
    setErr('');
    setModal(u);
  };

  const handleSave = async () => {
    setSaving(true);
    setErr('');
    try {
      if (modal === 'create') {
        await api.post('/auth/users', form);
      } else {
        await api.put(`/auth/users/${modal.id}`, form);
      }
      setModal(null);
      load();
    } catch (e) {
      setErr(e.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const canManage = me.role === 'ADMIN';

  return (
    <div>
      <div className='page-header'>
        <div></div>
        {canManage && (
          <button className='btn btn-primary' onClick={openCreate}>
            Add User
          </button>
        )}
      </div>

      <div className='card'>
        <div className='card-header'>
          <span className='card-title'>User List</span>
          <span
            style={{
              fontSize: 11,
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {data.length} users
          </span>
        </div>
        {data.length === 0 ? (
          <div className='empty-state'>
            <div className='empty-icon'></div>
            <div className='empty-title'>No users found</div>
          </div>
        ) : (
          <div className='table-wrap'>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  {canManage && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {data.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600 }}>{u.full_name || '—'}</td>
                    <td className='td-mono' style={{ fontSize: 11 }}>
                      {u.username}
                    </td>
                    <td
                      style={{ fontSize: 11, color: 'var(--text-secondary)' }}
                    >
                      {u.email}
                    </td>
                    <td>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: 10,
                          fontWeight: 700,
                          background:
                            u.role === 'ADMIN'
                              ? '#00ff0022'
                              : u.role === 'OPERATOR'
                                ? '#0099ff22'
                                : '#88888822',
                          color:
                            u.role === 'ADMIN'
                              ? '#00ff00'
                              : u.role === 'OPERATOR'
                                ? '#0099ff'
                                : '#888888',
                          border: `1px solid ${u.role === 'ADMIN' ? '#00ff0044' : u.role === 'OPERATOR' ? '#0099ff44' : '#88888844'}`,
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${u.is_active ? 'badge-active' : 'badge-suspended'}`}
                      >
                        {u.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                      {u.last_login
                        ? new Date(u.last_login).toLocaleString()
                        : 'Never'}
                    </td>
                    {canManage && (
                      <td>
                        <button
                          className='btn btn-secondary btn-sm'
                          onClick={() => openEdit(u)}
                        >
                          Edit
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && canManage && (
        <div className='modal-overlay' onClick={() => setModal(null)}>
          <div
            className='modal'
            style={{ maxWidth: 420 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className='modal-header'>
              <span className='modal-title'>
                {modal === 'create' ? '+ Add User' : `Edit — ${modal.username}`}
              </span>
              <button className='modal-close' onClick={() => setModal(null)}>
                ×
              </button>
            </div>
            <div className='modal-body'>
              {err && (
                <div
                  style={{
                    background: '#ff444411',
                    border: '1px solid #ff444433',
                    color: '#ff6666',
                    padding: '8px 12px',
                    borderRadius: 6,
                    fontSize: 12,
                    marginBottom: 12,
                  }}
                >
                  {err}
                </div>
              )}
              <div className='form-group'>
                <label className='form-label'>Full Name</label>
                <input
                  className='form-input'
                  value={form.full_name}
                  onChange={fF('full_name')}
                />
              </div>
              <div className='form-group'>
                <label className='form-label'>Username</label>
                <input
                  className='form-input'
                  value={form.username}
                  onChange={fF('username')}
                />
              </div>
              <div className='form-group'>
                <label className='form-label'>Email</label>
                <input
                  className='form-input'
                  type='email'
                  value={form.email}
                  onChange={fF('email')}
                />
              </div>
              {modal === 'create' && (
                <div className='form-group'>
                  <label className='form-label'>Password</label>
                  <input
                    className='form-input'
                    type='password'
                    value={form.password}
                    onChange={fF('password')}
                  />
                </div>
              )}
              <div className='form-grid-2'>
                <div className='form-group'>
                  <label className='form-label'>Role</label>
                  <select
                    className='form-select'
                    value={form.role}
                    onChange={fF('role')}
                  >
                    {ROLES.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div className='form-group'>
                  <label className='form-label'>Status</label>
                  <select
                    className='form-select'
                    value={form.is_active}
                    onChange={fF('is_active')}
                  >
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            <div className='modal-footer'>
              <button
                className='btn btn-secondary'
                onClick={() => setModal(null)}
              >
                Cancel
              </button>
              <button
                className='btn btn-primary'
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
