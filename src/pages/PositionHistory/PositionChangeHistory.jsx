import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';

export default function PositionsChangeHistory() {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    window_id: '',
    settlement_id: '',
    date_from: '',
    date_to: '',
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
        const res = await api.get(`/liquidity/positions/history?${params}`);
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
  const fmt = (v) =>
    parseFloat(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2 });
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
            Positions History
          </h2>
          <p
            style={{
              margin: '4px 0 0',
              fontSize: 11,
              color: 'var(--text-muted)',
            }}
          >
            Position change history of each the transaction cycle
          </p>
        </div>
        <button
          className='btn btn-sm btn-secondary'
          onClick={() => fetchRecords(page)}
        >
           Refresh
        </button>
      </div>

      {/* Summary cards */}
      {summary && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 12,
            marginBottom: 20,
          }}
        >
          {[
            {
              label: 'Total Records',
              value: summary.total_windows,
              color: 'var(--primary)',
            },
            {
              label: 'Total Amount',
              value: `${summary.total_volume.toFixed(2)} BDT`,
              color: '#22c55e',
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
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
            <div style={{ flex: '1 1 150px' }}>
              <label className='label'>FROM</label>
              <br />
              <input
                className='input'
                type='date'
                value={filters.date_from}
                onChange={f('date_from')}
              />
            </div>
            <div style={{ flex: '1 1 150px' }}>
              <label className='label'>TO</label>
              <br />
              <input
                className='input'
                type='date'
                value={filters.date_to}
                onChange={f('date_to')}
              />
            </div>
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
                  window_id: '',
                  settlement_id: '',
                  date_from: '',
                  date_to: '',
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
            {loading
              ? 'Loading...'
              : `${total.toLocaleString()} settlement records`}
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
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Amount</th>
                <th>Before</th>
                <th>After</th>
                <th>Transfer ID</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {records &&
                records?.map((h) => (
                  <tr key={h.id}>
                    <td>
                      <span
                        className={`badge ${h.change_type === 'DEPOSIT' ? 'badge-active' : h.change_type === 'RESERVE' ? 'badge-reserved' : 'badge-committed'}`}
                      >
                        {h.change_type}
                      </span>
                    </td>
                    <td
                      className='td-mono'
                      style={{
                        color: h.amount > 0 ? 'var(--green)' : 'var(--red)',
                        textAlign: 'right',
                      }}
                    >
                      {h.amount > 0 ? '+' : ''}
                      {parseFloat(h.amount || 0).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td
                      className='td-mono'
                      style={{ fontSize: 11, color: 'var(--text-muted)' }}
                    >
                      {fmt(h.position_before)}
                    </td>
                    <td className='td-mono' style={{ fontSize: 11 }}>
                      {fmt(h.position_after)}
                    </td>
                    <td
                      className='td-mono'
                      style={{
                        fontSize: 10,
                        maxWidth: 160,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h.transfer_id || '—'}
                    </td>
                    <td style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                      {new Date(h.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
