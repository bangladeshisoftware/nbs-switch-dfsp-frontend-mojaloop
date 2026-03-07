import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import api from '../../services/api';
import './dashboard.css';
import { GrInProgress } from 'react-icons/gr';
import { BsCalendar2Date } from 'react-icons/bs';
import { BiTransfer } from 'react-icons/bi';
import { MdOutlineSquare } from 'react-icons/md';

const STATUS_BADGE = {
  COMMITTED: 'badge-committed',
  FAILED: 'badge-failed',
  RESERVED: 'badge-reserved',
  RECEIVED: 'badge-prepared',
  TIMEOUT: 'badge-timeout',
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('dfsp_user') || '{}');

  useEffect(() => {
    api
      .get('/dashboard/summary')
      .then((r) => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className='loading'>
        <GrInProgress className='animate-spin' /> Loading...
      </div>
    );
  if (!data) return <div className='loading'>Failed to load</div>;

  const { today, yesterday, this_month, position, recent, merchants, hourly } =
    data;
  const available =
    parseFloat(position.net_debit_cap || 0) -
    parseFloat(position.current_position || 0);
  const usagePct =
    position.net_debit_cap > 0
      ? Math.min(
          100,
          (position.current_position / position.net_debit_cap) * 100,
        )
      : 0;
  const barColor =
    usagePct > 80 ? '#ff4444' : usagePct > 60 ? '#ffaa00' : '#00cc8f';

  return (
    <div style={{ overflow: 'scroll', height: '90vh' }}>
      {/* Stat Cards */}
      <div className='stat-grid'>
        {[
          {
            label: "Today's Transfers",
            value: today.total || 0,
            color: 'var(--accent)',
            sub: `${today.committed || 0} committed`,
          },
          {
            label: 'Sent Today',
            value: parseFloat(today.sent || 0).toLocaleString('en-US', {
              minimumFractionDigits: 2,
            }),
            color: 'var(--red)',
            sub: user.currency,
          },
          {
            label: 'Received Today',
            value: parseFloat(today.received || 0).toLocaleString('en-US', {
              minimumFractionDigits: 2,
            }),
            color: 'var(--green)',
            sub: user.currency,
          },
          {
            label: 'Failed Today',
            value: today.failed || 0,
            color: 'var(--red)',
            sub: 'failed transfers',
          },
          {
            label: 'This Month',
            value: this_month.total || 0,
            color: 'var(--blue)',
            sub: `vol: ${parseFloat(this_month.volume || 0).toLocaleString()}`,
          },
          {
            label: 'Total Merchants',
            value: merchants.total || 0,
            color: 'var(--yellow)',
            sub: `${merchants.active || 0} active`,
          },
        ].map((s) => (
          <div key={s.label} className='stat-card'>
            <div className='stat-label'>{s.label}</div>
            <div
              className='stat-value'
              style={{ color: s.color, fontSize: 20 }}
            >
              {s.value}
            </div>
            <div className='stat-sub'>{s.sub}</div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 300px',
          gap: 12,
          marginBottom: 12,
        }}
      >
        {/* Hourly Chart */}
        <div className='card'>
          <div className='card-header'>
            <span className='card-title'>
              <BsCalendar2Date /> Hourly Activity (Last 24h)
            </span>
          </div>
          <div style={{ padding: '16px 8px' }}>
            {hourly.length > 0 ? (
              <ResponsiveContainer width='100%' height={160}>
                <BarChart data={hourly}>
                  <XAxis
                    dataKey='hour'
                    tick={{ fill: '#555', fontSize: 10 }}
                    tickFormatter={(h) => `${h}h`}
                  />
                  <YAxis tick={{ fill: '#555', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      background: '#111',
                      border: '1px solid #222',
                      borderRadius: 6,
                      fontSize: 11,
                    }}
                    labelFormatter={(h) => `Hour ${h}:00`}
                  />
                  <Bar
                    dataKey='count'
                    fill='#00ff0d' // #723af3
                    radius={[3, 3, 0, 0]}
                    opacity={0.8}
                    name='Transfers'
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className='empty-state' style={{ padding: '30px 0' }}>
                <div className='empty-desc'>
                  No transfer activity in last 24 hours
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Liquidity Card */}
        <div className='card'>
          <div className='card-header'>
            <span className='card-title'>Liquidity</span>
          </div>
          <div className='card-body'>
            <div style={{ marginBottom: 14 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 4,
                }}
              >
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                  Usage
                </span>
                <span
                  style={{
                    fontSize: 10,
                    color: barColor,
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {usagePct.toFixed(1)}%
                </span>
              </div>
              <div className='pos-bar-wrap'>
                <div
                  className='pos-bar-fill'
                  style={{ width: `${usagePct}%`, background: barColor }}
                />
              </div>
            </div>
            {[
              {
                label: 'Net Debit Cap',
                value: parseFloat(position.net_debit_cap || 0).toLocaleString(
                  'en-US',
                  { minimumFractionDigits: 2 },
                ),
                color: 'var(--accent)',
              },
              {
                label: 'Current Position',
                value: parseFloat(
                  position.current_position || 0,
                ).toLocaleString('en-US', { minimumFractionDigits: 2 }),
                color: 'var(--red)',
              },
              {
                label: 'Reserved',
                value: parseFloat(position.reserved_amount || 0).toLocaleString(
                  'en-US',
                  { minimumFractionDigits: 2 },
                ),
                color: 'var(--yellow)',
              },
              {
                label: 'Available',
                value: available.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                }),
                color: 'var(--green)',
              },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '7px 0',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {item.label}
                </span>
                <span
                  style={{
                    fontSize: 11,
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
      </div>

      {/* Recent Transfers */}
      <div className='card'>
        <div className='card-header'>
          <span className='card-title'><BiTransfer /> Recent Transfers</span>
          <a href='/transfers' style={{ fontSize: 11 }}>
            View all →
          </a>
        </div>
        {recent.length === 0 ? (
          <div className='empty-state'>
            <div className='empty-desc'>No transfers yet</div>
          </div>
        ) : (
          <div className='table-wrap'>
            <table>
              <thead>
                <tr>
                  <th>Transfer ID</th>
                  <th>Direction</th>
                  <th>Counterpart</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((t) => {
                  const isSend = t.payer_fsp === user.dfsp_id;
                  const counterpart = isSend ? t.payee_fsp : t.payer_fsp;
                  return (
                    <tr key={t.transfer_id}>
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
                          {isSend ? '↑ SEND' : '↓ RECV'}
                        </span>
                      </td>
                      <td className='td-accent'>{counterpart}</td>
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
                      <td style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                        {new Date(t.created_at).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
