/**************************************************************************
 * Copyright © 2026 Bangladeshi Software Ltd. All rights reserved.
 * Distributed under the license terms specified in this repository.
 *
 * ORIGINAL AUTHOR: Muhammad Nasim (Developer)
 **************************************************************************/

import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { IoRefreshOutline } from 'react-icons/io5';

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [daily, setDaily] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filterUsername, setFilterUsername] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');

  const LIMIT = 30;

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/activity-logs/stats');
      setStats(res.data.stats);
      setDaily(res.data.daily || []);
    } catch (_) {}
  }, []);

  const fetchLogs = useCallback(
    async (p = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: p, limit: LIMIT });
        if (filterUsername) params.append('username', filterUsername);
        if (filterFrom) params.append('from', filterFrom);
        if (filterTo) params.append('to', filterTo);
        const res = await api.get(`/activity-logs?${params}`);
        setLogs(res.data.data || []);
        setTotal(res.data.total || 0);
        setPage(p);
      } catch (_) {
      } finally {
        setLoading(false);
      }
    },
    [filterUsername, filterFrom, filterTo],
  );

  useEffect(() => {
    fetchStats();
    fetchLogs(1);
  }, []);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div>
      {/* Header */}
      <div
        style={{
          marginBottom: 20,
          display: 'flex',
          justifyContent: 'right',
          alignItems: 'center',
        }}
      >
        <button
          className='btn btn-sm btn-secondary'
          onClick={() => {
            fetchStats();
            fetchLogs(page);
          }}
        >
          <IoRefreshOutline /> Refresh
        </button>
      </div>

      {/* Stats row */}
      {stats && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 12,
            marginBottom: 20,
          }}
        >
          {[
            {
              label: 'Total Logins',
              value: Number(stats.total).toLocaleString(),
              color: 'var(--primary)',
            },
            {
              label: 'Today',
              value: Number(stats.today).toLocaleString(),
              color: '#f59e0b',
            },
            {
              label: 'Unique Users',
              value: Number(stats.unique_users).toLocaleString(),
              color: '#8b5cf6',
            },
            {
              label: 'Unique IPs',
              value: Number(stats.unique_ips).toLocaleString(),
              color: '#06b6d4',
            },
          ].map((s) => (
            <div
              key={s.label}
              className='card'
              style={{ padding: '12px 16px', textAlign: 'center' }}
            >
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: s.color,
                  fontFamily: 'var(--mono)',
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: 'var(--text-muted)',
                  marginTop: 2,
                  letterSpacing: 1,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Daily mini chart */}
      {daily.length > 0 && (
        <div
          className='card'
          style={{ marginBottom: 16, padding: '12px 16px' }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 1,
              color: 'var(--text-muted)',
              marginBottom: 10,
            }}
          >
            LAST 7 DAYS
          </div>
          <div
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'flex-end',
              height: 60,
            }}
          >
            {[...daily].reverse().map((d, i) => {
              const max = Math.max(...daily.map((x) => x.total));
              const h =
                max > 0 ? Math.max(4, Math.round((d.total / max) * 50)) : 4;
              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>
                    {d.total}
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: h,
                      background: 'var(--primary)',
                      opacity: 0.6,
                      borderRadius: 2,
                    }}
                  />
                  <div
                    style={{
                      fontSize: 8,
                      color: 'var(--text-muted)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {new Date(d.date).toLocaleDateString('en', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className='card' style={{ marginBottom: 16, padding: '12px 16px' }}>
        <div
          style={{
            display: 'flex',
            gap: 10,
            flexWrap: 'wrap',
            alignItems: 'flex-end',
          }}
        >
          <div style={{ flex: '1 1 160px' }}>
            <label className='label'>USERNAME</label> &nbsp;&nbsp;
            <input
              className='input'
              value={filterUsername}
              onChange={(e) => setFilterUsername(e.target.value)}
              placeholder='Search username...'
              onKeyDown={(e) => e.key === 'Enter' && fetchLogs(1)}
            />
          </div>
          <div style={{ flex: '1 1 150px' }}>
            <label className='label'>FROM</label> &nbsp;&nbsp;
            <input
              className='input'
              type='datetime-local'
              value={filterFrom}
              onChange={(e) => setFilterFrom(e.target.value)}
            />
          </div>
          <div style={{ flex: '1 1 150px' }}>
            <label className='label'>TO</label> &nbsp;&nbsp;
            <input
              className='input'
              type='datetime-local'
              value={filterTo}
              onChange={(e) => setFilterTo(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className='btn btn-primary btn-sm'
              onClick={() => fetchLogs(1)}
            >
              Search
            </button>
            <button
              className='btn btn-secondary btn-sm'
              onClick={() => {
                setFilterUsername('');
                setFilterFrom('');
                setFilterTo('');
                setTimeout(() => fetchLogs(1), 50);
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className='card' style={{ padding: 0, overflow: 'hidden' }}>
        <div
          style={{
            padding: '10px 16px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--text-muted)',
            }}
          >
            {loading ? 'Loading...' : `${total.toLocaleString()} login records`}
          </span>
          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button
                className='btn btn-secondary btn-sm'
                onClick={() => fetchLogs(page - 1)}
                disabled={page <= 1 || loading}
              >
                ←
              </button>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {page} / {totalPages}
              </span>
              <button
                className='btn btn-secondary btn-sm'
                onClick={() => fetchLogs(page + 1)}
                disabled={page >= totalPages || loading}
              >
                →
              </button>
            </div>
          )}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table
            style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}
          >
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {[
                  '#',
                  'Username',
                  'Email',
                  'IP Address',
                  'Location',
                  'Login Time',
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '8px 14px',
                      textAlign: 'left',
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: 1,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: 'center',
                      padding: 40,
                      color: 'var(--text-muted)',
                    }}
                  >
                    Loading...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: 'center',
                      padding: 40,
                      color: 'var(--text-muted)',
                    }}
                  >
                    No activity logs found
                  </td>
                </tr>
              ) : (
                logs.map((log, i) => (
                  <tr
                    key={log.id || i}
                    style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = 'var(--hover)')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = '')
                    }
                  >
                    <td
                      style={{
                        padding: '8px 14px',
                        color: 'var(--text-muted)',
                        fontSize: 10,
                      }}
                    >
                      {(page - 1) * LIMIT + i + 1}
                    </td>
                    <td
                      style={{
                        padding: '8px 14px',
                        fontWeight: 700,
                        fontFamily: 'monospace',
                      }}
                    >
                      {log.username}
                    </td>
                    <td
                      style={{
                        padding: '8px 14px',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {log.email}
                    </td>
                    <td
                      style={{
                        padding: '8px 14px',
                        fontFamily: 'monospace',
                        fontSize: 11,
                      }}
                    >
                      {log.ip_address}
                    </td>
                    <td
                      style={{
                        padding: '8px 14px',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {log.location || '—'}
                    </td>
                    <td
                      style={{
                        padding: '8px 14px',
                        color: 'var(--text-muted)',
                        whiteSpace: 'nowrap',
                        fontSize: 11,
                      }}
                    >
                      {new Date(log.login_time).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
