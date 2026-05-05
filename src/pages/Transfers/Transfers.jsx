import { useState, useEffect } from 'react';
import api from '../../services/api';
import { MdSearch } from 'react-icons/md';
import { RxCross2 } from 'react-icons/rx';
import { GrInProgress } from 'react-icons/gr';

const STATUS_OPTIONS = [
  'ALL',
  'COMMITTED',
  'RESERVED',
  'RECEIVED',
  'FAILED',
  'TIMEOUT',
];
const STATUS_BADGE = {
  COMMITTED: 'badge-committed',
  FAILED: 'badge-failed',
  RESERVED: 'badge-reserved',
  RECEIVED: 'badge-prepared',
  TIMEOUT: 'badge-timeout',
};

export default function Transfers() {
  const user = JSON.parse(localStorage.getItem('dfsp_user') || '{}');
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    status: 'ALL',
    direction: '',
    from: '',
    to: '',
    search: '',
  });

  const fE = (k) => (e) => setFilters((p) => ({ ...p, [k]: e.target.value }));

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 50, ...filters });
      if (filters.status === 'ALL') params.delete('status');
      const res = await api.get(`/transfers?${params}`);
      setData(res.data.data);
      setTotal(res.data.total);
      setPage(p);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
  }, []);

  return (
    <div>
      <div className='card' style={{ marginBottom: 12 }}>
        <div
          style={{
            padding: '12px 14px',
            display: 'flex',
            gap: 10,
            flexWrap: 'wrap',
            alignItems: 'flex-end',
          }}
        >
          <div className='filter-item'>
            <div className='filter-label'>Search</div>
            <input
              className='form-input'
              style={{ width: 220 }}
              placeholder='Transfer ID...'
              value={filters.search}
              onChange={fE('search')}
            />
          </div>
          <div className='filter-item'>
            <div className='filter-label'>Status</div>
            <select
              className='form-select'
              value={filters.status}
              onChange={fE('status')}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className='filter-item'>
            <div className='filter-label'>Direction</div>
            <select
              className='form-select'
              value={filters.direction}
              onChange={fE('direction')}
            >
              <option value=''>All</option>
              <option value='SEND'>↑ Send</option>
              <option value='RECEIVE'>↓ Receive</option>
            </select>
          </div>
          <div className='filter-item'>
            <div className='filter-label'>From</div>
            <input
              className='form-input'
              type='date'
              value={filters.from}
              onChange={fE('from')}
            />
          </div>
          <div className='filter-item'>
            <div className='filter-label'>To</div>
            <input
              className='form-input'
              type='date'
              value={filters.to}
              onChange={fE('to')}
            />
          </div>
          <button
            className='btn btn-primary'
            onClick={() => load(1)}
            disabled={loading}
          >
            {loading ? (
              'Loading...'
            ) : (
              <>
                {' '}
                <MdSearch /> Search
              </>
            )}
          </button>
          <button
            className='btn btn-secondary'
            onClick={() => {
              setFilters({
                status: 'ALL',
                direction: '',
                from: '',
                to: '',
                search: '',
              });
            }}
          >
            <RxCross2 /> Clear
          </button>
        </div>
      </div>

      {/* Table */}
      <div className='card'>
        <div className='card-header'>
          <span className='card-title'>Transaction Records</span>
          <span
            style={{
              fontSize: 11,
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {data.length} of {total}
          </span>
        </div>
        {loading ? (
          <div className='loading'>
            <GrInProgress className='animate-spin' /> Loading...
          </div>
        ) : data.length === 0 ? (
          <div className='empty-state'>
            <div className='empty-icon'>⇄</div>
            <div className='empty-title'>No transfers found</div>
          </div>
        ) : (
          <>
            <div className='table-wrap'>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Transfer ID</th>
                    <th>Dir</th>
                    <th>Counterpart</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((t, i) => {
                    const isSend = t.payer_fsp === user.dfsp_id;
                    return (
                      <tr key={t.transfer_id}>
                        <td
                          style={{ color: 'var(--text-muted)', fontSize: 10 }}
                        >
                          {(page - 1) * 50 + i + 1}
                        </td>
                        <td
                          className='td-mono'
                          style={{
                            fontSize: 10,
                            maxWidth: 200,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {t.transfer_id}
                        </td>
                        <td>
                          <span
                            style={{
                              color: isSend ? 'var(--red)' : 'var(--green)',
                              fontSize: 11,
                              fontWeight: 700,
                            }}
                          >
                            {isSend ? '↑' : '↓'}
                          </span>
                        </td>
                        <td className='td-accent'>
                          {isSend ? t.payee_fsp : t.payer_fsp}
                        </td>
                        <td className='td-mono' style={{ textAlign: 'right' }}>
                          {parseFloat(t.amount).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                          })}
                          <span
                            style={{
                              fontSize: 9,
                              color: 'var(--text-muted)',
                              marginLeft: 3,
                            }}
                          >
                            {t.currency}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${STATUS_BADGE[t.status] || ''}`}
                          >
                            {t.status}
                          </span>
                        </td>
                        <td
                          style={{ fontSize: 10, color: 'var(--text-muted)' }}
                        >
                          {new Date(t.created_at).toLocaleString()}
                        </td>
                        <td
                          className='td-mono'
                          style={{ fontSize: 10, color: 'var(--text-muted)' }}
                        >
                          {t.duration_sec != null
                            ? `${parseFloat(t.duration_sec).toFixed(1)}s`
                            : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {total > 50 && (
              <div
                style={{
                  padding: '12px 14px',
                  display: 'flex',
                  gap: 8,
                  justifyContent: 'center',
                }}
              >
                <button
                  className='btn btn-secondary btn-sm'
                  disabled={page === 1}
                  onClick={() => load(page - 1)}
                >
                  ← Prev
                </button>
                <span
                  style={{
                    fontSize: 11,
                    padding: '4px 10px',
                    color: 'var(--text-muted)',
                  }}
                >
                  Page {page} of {Math.ceil(total / 50)}
                </span>
                <button
                  className='btn btn-secondary btn-sm'
                  disabled={page >= Math.ceil(total / 50)}
                  onClick={() => load(page + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
