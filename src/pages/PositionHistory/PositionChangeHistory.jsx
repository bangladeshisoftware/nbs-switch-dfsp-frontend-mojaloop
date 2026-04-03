import { useState, useEffect } from 'react';
import api from '../../services/api';
import { GrInProgress } from 'react-icons/gr';
import { LuHistory } from 'react-icons/lu';

export default function PositionChangeHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/liquidity/position')
      .then((r) => {
        setHistory(r.data.history || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className='loading'>
        <GrInProgress className='animate-spin' /> Loading...
      </div>
    );


  const fmt = (v) =>
    parseFloat(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2 });

  return (
    <div>

      {/* Position History */}
      <div className='card'>
        <div className='card-header'>
          <span className='card-title'>
            <LuHistory /> Position Change History
          </span>
        </div>
        {history.length === 0 ? (
          <div className='empty-state'>
            <div className='empty-desc'>No position changes yet</div>
          </div>
        ) : (
          <div className='table-wrap'>
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
                {history.map((h) => (
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
        )}
      </div>
    </div>
  );
}
