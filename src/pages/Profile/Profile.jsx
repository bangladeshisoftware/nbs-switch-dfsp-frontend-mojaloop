/**************************************************************************
 * Copyright © 2026 Bangladeshi Software Ltd. All rights reserved.
 * Distributed under the license terms specified in this repository.
 *
 * ORIGINAL AUTHOR: Muhammad Nasim (Developer)
 **************************************************************************/

import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function Profile() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/auth/me')
      .then((r) => setData(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className='loading'>Loading...</div>;
  if (!data) return <div className='loading'>Failed to load</div>;

  const Row = ({ label, value, mono }) => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '9px 0',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</span>
      <span
        style={{
          fontSize: 12,
          fontFamily: mono ? 'var(--font-mono)' : 'inherit',
          color: 'var(--text)',
        }}
      >
        {value || '—'}
      </span>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* DFSP Info */}
        <div className='card'>
          <div className='card-header'>
            <span className='card-title'>⬡ DFSP Information</span>
          </div>
          <div className='card-body'>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                marginBottom: 16,
                paddingBottom: 14,
                borderBottom: '1px solid var(--border)',
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  background: 'var(--accent)',
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  fontWeight: 900,
                  color: '#000',
                }}
              >
                {data.dfsp_id?.[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>
                  {data.dfsp_name}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: 'var(--accent)',
                  }}
                >
                  {data.dfsp_id}
                </div>
              </div>
            </div>
            <Row label='Short Name' value={data.short_name} />
            <Row label='Currency' value={data.currency} mono />
            <Row label='Status' value={data.dfsp_status} />
            <Row label='Callback URL' value={data.callback_url} mono />
          </div>
        </div>

        {/* User Info */}
        <div className='card'>
          <div className='card-header'>
            <span className='card-title'>◎ My Account</span>
          </div>
          <div className='card-body'>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                marginBottom: 16,
                paddingBottom: 14,
                borderBottom: '1px solid var(--border)',
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  background: '#1a1a1a',
                  border: '1px solid var(--border-light)',
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  color: 'var(--text-secondary)',
                }}
              ></div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>
                  {data.full_name || data.username}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: 'var(--text-muted)',
                  }}
                >
                  {data.username}
                </div>
              </div>
            </div>
            <Row label='Email' value={data.email} />
            <Row label='Role' value={data.role} mono />
            <Row
              label='Last Login'
              value={
                data.last_login
                  ? new Date(data.last_login).toLocaleString()
                  : 'N/A'
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
