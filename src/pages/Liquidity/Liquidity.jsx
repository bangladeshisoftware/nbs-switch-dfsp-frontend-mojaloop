import { useState, useEffect } from 'react';
import api from '../../services/api';
import { GrInProgress } from 'react-icons/gr';
import { LuHistory } from 'react-icons/lu';

export default function Liquidity() {
  const user = JSON.parse(localStorage.getItem('dfsp_user') || '{}');
  const [pos, setPos] = useState({});
  const [accounts, setAccounts] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/liquidity/position')
      .then((r) => {
        setPos(r.data.position || {});
        setAccounts(r.data.cl_accounts || []);
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

  const available =
    parseFloat(pos.net_debit_cap || 0) - parseFloat(pos.current_position || 0);
  const usagePct =
    pos.net_debit_cap > 0
      ? Math.min(100, (pos.current_position / pos.net_debit_cap) * 100)
      : 0;
  const barColor =
    usagePct > 80 ? '#ff4444' : usagePct > 60 ? '#ffaa00' : '#00cc44';
  const fmt = (v) =>
    parseFloat(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2 });

  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          marginBottom: 12,
        }}
      >
        {/* Current Position */}
        <div className='card'>
          <div className='card-header'>
            <span className='card-title'>⬡ Current Position</span>
          </div>
          <div className='card-body'>
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Utilization
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    color: barColor,
                  }}
                >
                  {usagePct.toFixed(1)}%
                </span>
              </div>
              <div className='pos-bar-wrap' style={{ height: 8 }}>
                <div
                  className='pos-bar-fill'
                  style={{ width: `${usagePct}%`, background: barColor }}
                />
              </div>
            </div>
            {[
              {
                label: 'Net Debit Cap',
                value: fmt(pos.net_debit_cap),
                color: 'var(--accent)',
                icon: '⬡',
              },
              {
                label: 'Current Position',
                value: fmt(pos.current_position),
                color: 'var(--red)',
                icon: '↓',
              },
              {
                label: 'Reserved',
                value: fmt(pos.reserved_amount),
                color: 'var(--yellow)',
                icon: '⏳',
              },
              {
                label: 'Available',
                value: fmt(pos?.available),
                color: 'var(--green)',
                icon: '✓',
              },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: item.color, fontSize: 14 }}>
                    {item.icon}
                  </span>
                  <span
                    style={{ fontSize: 12, color: 'var(--text-secondary)' }}
                  >
                    {item.label}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 14,
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    color: item.color,
                  }}
                >
                  {item.value}{' '}
                  <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>
                    {user.currency}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CL Accounts */}
        <div className='card'>
          <div className='card-header'>
            <span className='card-title'>🏦 Ledger Accounts</span>
          </div>
          {accounts.length === 0 ? (
            <div className='empty-state'>
              <div className='empty-desc'>No accounts found</div>
            </div>
          ) : (
            <div className='table-wrap'>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Type</th>
                    <th>Currency</th>
                    <th>Balance</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((a) => (
                    <tr key={a.id}>
                      <td className='td-mono' style={{ fontSize: 10 }}>
                        {a.id}
                      </td>
                      <td
                        style={{ fontSize: 11, color: 'var(--text-secondary)' }}
                      >
                        {a.ledgerAccountType}
                      </td>
                      <td className='td-mono' style={{ fontSize: 11 }}>
                        {a.currency}
                      </td>
                      <td
                        className='td-mono'
                        style={{
                          fontSize: 11,
                          color: 'var(--green)',
                          textAlign: 'right',
                        }}
                      >
                        {parseFloat(a.value || 0).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td>
                        <span
                          className={`badge ${a.isActive ? 'badge-active' : 'badge-suspended'}`}
                        >
                          {a.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
