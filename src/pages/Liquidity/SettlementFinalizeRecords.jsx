/**************************************************************************
 * Copyright © 2026 Bangladeshi Software Ltd. All rights reserved.
 * Distributed under the license terms specified in this repository.
 *
 * ORIGINAL AUTHOR: Muhammad Nasim (Developer)
 **************************************************************************/

import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';

const STATUS_COLORS = {
  ok: { bg: '#0a2d1a', color: '#22c55e', border: '#16a34a' },
  commit: { bg: '#0a2d1a', color: '#22c55e', border: '#16a34a' },
  prepare: { bg: '#1a1a00', color: '#eab308', border: '#ca8a04' },
  abort: { bg: '#2d0a0a', color: '#ef4444', border: '#dc2626' },
  failed: { bg: '#2d0a0a', color: '#ef4444', border: '#dc2626' },
};

export default function SettlementFinalizeRecords() {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    type: '',
    window_id: '',
    settlement_id: '',
    date_from: '',
    date_to: '',
    status: '',
  });

  const LIMIT = 30;

  const fetchRecords = useCallback(
    async (p = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: p, limit: LIMIT });
        Object.entries(filters).forEach(([k, v]) => {
          if (v) params.append(k, v);
        });
        const res = await api.get(`/settlement/finalize-records?${params}`);
        setRecords(res.data.data || []);
        setSummary(res.data.summary || null);
        setTotal(res.data.pagination?.total || 0);
        setPage(p);
      } catch (_) {
      } finally {
        setLoading(false);
      }
    },
    [filters],
  );

  useEffect(() => {
    fetchRecords(1);
  }, []);

  const totalPages = Math.ceil(total / LIMIT);
  const f = (k) => (e) => setFilters((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div>
      {/* Header */}
      <div
        style={{
          marginBottom: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontWeight: 700, fontSize: 18 }}>
            Settlement Finalize Records
          </h2>
          <p
            style={{
              margin: '4px 0 0',
              fontSize: 11,
              color: 'var(--text-muted)',
            }}
          >
            Liquidity management — debit / credit history per settlement window
          </p>
        </div>
        <button
          className='btn btn-sm btn-secondary'
          onClick={() => fetchRecords(page)}
        >
          ↺ Refresh
        </button>
      </div>

      {/* Summary cards */}
      {summary && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
            marginBottom: 20,
          }}
        >
          {[
            {
              label: 'Total Credit',
              value: `+${summary.total_credit.toFixed(2)} BDT`,
              color: '#22c55e',
            },
            {
              label: 'Total Debit',
              value: `-${summary.total_debit.toFixed(2)} BDT`,
              color: '#ef4444',
            },
            {
              label: 'Total Windows',
              value: summary.total_windows,
              color: 'var(--primary)',
            },
          ].map((s) => (
            <div
              key={s.label}
              className='card'
              style={{ padding: '12px 16px', textAlign: 'center' }}
            >
              <div
                style={{
                  fontSize: 20,
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
          <div style={{ flex: '1 1 120px' }}>
            <label className='label'>TYPE</label>
            <select className='input' value={filters.type} onChange={f('type')}>
              <option value=''>All</option>
              <option value='credit'>Credit</option>
              <option value='debit'>Debit</option>
            </select>
          </div>
          <div style={{ flex: '1 1 120px' }}>
            <label className='label'>WINDOW ID</label>
            <input
              className='input'
              value={filters.window_id}
              onChange={f('window_id')}
              placeholder='e.g. 17'
            />
          </div>
          <div style={{ flex: '1 1 120px' }}>
            <label className='label'>SETTLEMENT ID</label>
            <input
              className='input'
              value={filters.settlement_id}
              onChange={f('settlement_id')}
              placeholder='e.g. 6'
            />
          </div>
          <div style={{ flex: '1 1 120px' }}>
            <label className='label'>STATUS</label>
            <select
              className='input'
              value={filters.status}
              onChange={f('status')}
            >
              <option value=''>All</option>
              <option value='ok'>OK</option>
              <option value='prepare'>Prepare</option>
              <option value='commit'>Commit</option>
              <option value='abort'>Abort</option>
              <option value='failed'>Failed</option>
            </select>
          </div>
          <div style={{ flex: '1 1 140px' }}>
            <label className='label'>FROM</label>
            <input
              className='input'
              type='date'
              value={filters.date_from}
              onChange={f('date_from')}
            />
          </div>
          <div style={{ flex: '1 1 140px' }}>
            <label className='label'>TO</label>
            <input
              className='input'
              type='date'
              value={filters.date_to}
              onChange={f('date_to')}
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className='btn btn-primary btn-sm'
              onClick={() => fetchRecords(1)}
            >
              Search
            </button>
            <button
              className='btn btn-secondary btn-sm'
              onClick={() => {
                setFilters({
                  type: '',
                  window_id: '',
                  settlement_id: '',
                  date_from: '',
                  date_to: '',
                  status: '',
                });
                setTimeout(() => fetchRecords(1), 50);
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
            {loading ? 'Loading...' : `${total.toLocaleString()} records`}
          </span>
          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button
                className='btn btn-secondary btn-sm'
                onClick={() => fetchRecords(page - 1)}
                disabled={page <= 1 || loading}
              >
                ←
              </button>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {page} / {totalPages}
              </span>
              <button
                className='btn btn-secondary btn-sm'
                onClick={() => fetchRecords(page + 1)}
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
                  'Date',
                  'Window',
                  'Settlement',
                  'Type',
                  'Action',
                  'Amount',
                  'Before',
                  'After',
                  'Status',
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
                      whiteSpace: 'nowrap',
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
                    colSpan={10}
                    style={{
                      textAlign: 'center',
                      padding: 40,
                      color: 'var(--text-muted)',
                    }}
                  >
                    Loading...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    style={{
                      textAlign: 'center',
                      padding: 40,
                      color: 'var(--text-muted)',
                    }}
                  >
                    No records found
                  </td>
                </tr>
              ) : (
                records.map((r, i) => {
                  const sc = STATUS_COLORS[r.status] || STATUS_COLORS.prepare;
                  return (
                    <tr
                      key={r.id || i}
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
                          color: 'var(--text-muted)',
                          fontSize: 11,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {new Date(r.created_at).toLocaleString()}
                      </td>
                      <td
                        style={{
                          padding: '8px 14px',
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          color: 'var(--primary)',
                        }}
                      >
                        {r.window_id}
                      </td>
                      <td
                        style={{
                          padding: '8px 14px',
                          fontFamily: 'monospace',
                          fontSize: 11,
                          color: 'var(--text-muted)',
                        }}
                      >
                        {r.settlement_id || '—'}
                      </td>
                      <td style={{ padding: '8px 14px' }}>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: 4,
                            fontSize: 10,
                            fontWeight: 700,
                            background:
                              r.type === 'credit' ? '#0a2d1a' : '#2d0a0a',
                            color: r.type === 'credit' ? '#22c55e' : '#ef4444',
                          }}
                        >
                          {r.type === 'credit' ? '↑ Credit' : '↓ Debit'}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: '8px 14px',
                          fontFamily: 'monospace',
                          fontSize: 10,
                          color: 'var(--text-muted)',
                        }}
                      >
                        {r.action}
                      </td>
                      <td
                        style={{
                          padding: '8px 14px',
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          color: r.type === 'credit' ? '#22c55e' : '#ef4444',
                        }}
                      >
                        {r.type === 'credit' ? '+' : '-'}
                        {parseFloat(r.amount || 0).toFixed(2)} {r.currency}
                      </td>
                      <td
                        style={{
                          padding: '8px 14px',
                          fontFamily: 'monospace',
                          fontSize: 11,
                          color: 'var(--text-muted)',
                        }}
                      >
                        {r.before_amount != null
                          ? parseFloat(r.before_amount).toFixed(2)
                          : '—'}
                      </td>
                      <td
                        style={{
                          padding: '8px 14px',
                          fontFamily: 'monospace',
                          fontSize: 11,
                          color: 'var(--text-muted)',
                        }}
                      >
                        {r.after_amount != null
                          ? parseFloat(r.after_amount).toFixed(2)
                          : '—'}
                      </td>
                      <td style={{ padding: '8px 14px' }}>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: 4,
                            fontSize: 10,
                            fontWeight: 700,
                            background: sc.bg,
                            color: sc.color,
                          }}
                        >
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
