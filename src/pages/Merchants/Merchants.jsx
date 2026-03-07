import { useState, useEffect } from 'react';
import api from '../../services/api';
import { MdSearch } from 'react-icons/md';
import { GrInProgress } from 'react-icons/gr';

const STATUS_OPTIONS = ['ALL', 'ACTIVE', 'PENDING', 'SUSPENDED', 'REJECTED'];
const CATEGORIES = [
  'Retail',
  'Restaurant',
  'Transport',
  'Healthcare',
  'Education',
  'Utilities',
  'E-Commerce',
  'Other',
];
const ID_TYPES = ['MSISDN', 'ACCOUNT_ID', 'BUSINESS', 'ALIAS', 'IBAN'];

const BADGE = {
  ACTIVE: 'badge-active',
  PENDING: 'badge-pending',
  SUSPENDED: 'badge-suspended',
  REJECTED: 'badge-rejected',
};
const ALS_BADGE = {
  registered: { color: 'var(--green)', label: '✓ ALS' },
  failed: { color: 'var(--red)', label: '✗ ALS' },
  pending: { color: 'var(--yellow)', label: '⏳ ALS' },
};

const EMPTY_FORM = {
  business_name: '',
  business_type: '',
  owner_name: '',
  phone: '',
  email: '',
  address: '',
  nid: '',
  tin: '',
  account_number: '',
  category: '',
  daily_limit: '',
  monthly_limit: '',
  // ALS Party fields
  id_type: 'MSISDN',
  id_value: '',
  first_name: '',
  middle_name: '',
  last_name: '',
  dob: '',
};

export default function Merchants() {
  const user = JSON.parse(localStorage.getItem('dfsp_user') || '{}');
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ status: 'ALL', search: '' });
  const [modal, setModal] = useState(null); // null | 'create' | {merchant}
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const fE = (k) => (e) => setFilters((p) => ({ ...p, [k]: e.target.value }));
  const fF = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const loadStats = () =>
    api
      .get('/merchants/stats')
      .then((r) => setStats(r.data.stats || {}))
      .catch(() => {});

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 20, ...filters });
      if (filters.status === 'ALL') params.delete('status');
      const res = await api.get(`/merchants?${params}`);
      setData(res.data.data);
      setTotal(res.data.total);
      setPage(p);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
    loadStats();
  }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setErr('');
    setModal('create');
  };
  const openEdit = (m) => {
    setForm({ ...m });
    setErr('');
    setModal(m);
  };

  const handleSave = async () => {
    setSaving(true);
    setErr('');
    try {
      if (modal === 'create') {
        await api.post('/merchants', form);
      } else {
        await api.put(`/merchants/${modal.id}`, form);
      }
      setModal(null);
      load(page);
      loadStats();
    } catch (e) {
      setErr(e.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (m) => {
    if (!confirm(`"${m.business_name}" delete করবেন? ALS থেকেও remove হবে।`))
      return;
    try {
      await api.delete(`/merchants/${m.id}`);
      load(page);
      loadStats();
    } catch (e) {
      alert(e.response?.data?.error || 'Delete failed');
    }
  };

  const handleStatus = async (id, status) => {
    if (!confirm(`Set merchant to ${status}?`)) return;
    try {
      await api.put(`/merchants/${id}/status`, { status });
      load(page);
      loadStats();
    } catch (e) {
      alert(e.response?.data?.error || 'Failed');
    }
  };

  return (
    <div>
      {/* Stats */}
      <div
        className='stat-grid'
        style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: 14 }}
      >
        {[
          { label: 'Total', value: stats.total || 0, color: 'var(--accent)' },
          { label: 'Active', value: stats.active || 0, color: 'var(--green)' },
          {
            label: 'Pending',
            value: stats.pending || 0,
            color: 'var(--yellow)',
          },
          {
            label: 'Suspended',
            value: stats.suspended || 0,
            color: 'var(--red)',
          },
          { label: 'Rejected', value: stats.rejected || 0, color: '#888' },
        ].map((s) => (
          <div key={s.label} className='stat-card'>
            <div className='stat-label'>{s.label}</div>
            <div
              className='stat-value'
              style={{ color: s.color, fontSize: 20 }}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className='card' style={{ marginBottom: 12 }}>
        <div
          style={{
            padding: '10px 14px',
            display: 'flex',
            gap: 10,
            alignItems: 'flex-end',
            flexWrap: 'wrap',
          }}
        >
          <div className='filter-item'>
            <div className='filter-label'>Search</div>
            <input
              className='form-input'
              style={{ width: 220 }}
              placeholder='Name, ID, phone...'
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
          <button
            className='btn btn-primary'
            onClick={() => load(1)}
            disabled={loading}
          >
            <MdSearch /> Search
          </button>
        </div>
      </div>

      {/* Table */}
      <div className='card'>
        <div className='card-header'>
          <span className='card-title'>Merchant List</span>
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
            <div className='empty-icon'>⊙</div>
            <div className='empty-title'>No merchants found</div>
            <div className='empty-desc'>Register your first merchant</div>
          </div>
        ) : (
          <div className='table-wrap'>
            <table>
              <thead>
                <tr>
                  <th>Merchant ID</th>
                  <th>Business Name</th>
                  <th>Owner</th>
                  <th>Phone</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Registered</th>
                </tr>
              </thead>
              <tbody>
                {data.map((m) => (
                  <tr key={m.id}>
                    <td className='td-mono td-accent' style={{ fontSize: 10 }}>
                      {m.merchant_id}
                    </td>
                    <td style={{ fontWeight: 600 }}>{m.business_name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {m.owner_name || '—'}
                    </td>
                    <td className='td-mono' style={{ fontSize: 11 }}>
                      {m.phone}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                      {m.category || '—'}
                    </td>
                    <td>
                      <span className={`badge ${BADGE[m.status] || ''}`}>
                        {m.status}
                      </span>
                    </td>
                    <td style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                      {new Date(m.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Merchant Modal */}
      {modal && (
        <div className='modal-overlay' onClick={() => setModal(null)}>
          <div className='modal' onClick={(e) => e.stopPropagation()}>
            <div className='modal-header'>
              <span className='modal-title'>
                {modal === 'create'
                  ? '+ Register Merchant'
                  : `Edit — ${modal.business_name}`}
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

              <div className='form-grid-2'>
                <div className='form-group'>
                  <label className='form-label'>Business Name *</label>
                  <input
                    className='form-input'
                    value={form.business_name}
                    onChange={fF('business_name')}
                    placeholder='Business name'
                  />
                </div>
                <div className='form-group'>
                  <label className='form-label'>Business Type</label>
                  <input
                    className='form-input'
                    value={form.business_type}
                    onChange={fF('business_type')}
                    placeholder='e.g. Sole Proprietorship'
                  />
                </div>
                <div className='form-group'>
                  <label className='form-label'>Owner Name</label>
                  <input
                    className='form-input'
                    value={form.owner_name}
                    onChange={fF('owner_name')}
                    placeholder='Owner full name'
                  />
                </div>
                <div className='form-group'>
                  <label className='form-label'>Phone *</label>
                  <input
                    className='form-input'
                    value={form.phone}
                    onChange={fF('phone')}
                    placeholder='01XXXXXXXXX'
                  />
                </div>
                <div className='form-group'>
                  <label className='form-label'>Email</label>
                  <input
                    className='form-input'
                    type='email'
                    value={form.email}
                    onChange={fF('email')}
                    placeholder='merchant@email.com'
                  />
                </div>
                <div className='form-group'>
                  <label className='form-label'>Category</label>
                  <select
                    className='form-select'
                    value={form.category}
                    onChange={fF('category')}
                  >
                    <option value=''>Select category</option>
                    {CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className='form-group'>
                  <label className='form-label'>NID</label>
                  <input
                    className='form-input'
                    value={form.nid}
                    onChange={fF('nid')}
                    placeholder='National ID'
                  />
                </div>
                <div className='form-group'>
                  <label className='form-label'>TIN</label>
                  <input
                    className='form-input'
                    value={form.tin}
                    onChange={fF('tin')}
                    placeholder='Tax ID'
                  />
                </div>
                <div className='form-group'>
                  <label className='form-label'>Account Number</label>
                  <input
                    className='form-input'
                    value={form.account_number}
                    onChange={fF('account_number')}
                    placeholder='Bank account'
                  />
                </div>
                <div className='form-group'>
                  <label className='form-label'>Daily Limit (BDT)</label>
                  <input
                    className='form-input'
                    type='number'
                    value={form.daily_limit}
                    onChange={fF('daily_limit')}
                    placeholder='0'
                  />
                </div>
              </div>
              <div className='form-group'>
                <label className='form-label'>Address</label>
                <textarea
                  className='form-input'
                  value={form.address}
                  onChange={fF('address')}
                  placeholder='Business address'
                  rows={2}
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* ALS Party Registration */}
              {modal === 'create' && (
                <div
                  style={{
                    padding: '12px 14px',
                    background: '#001a00',
                    border: '1px solid #003300',
                    borderRadius: 8,
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      color: '#00ff00',
                      letterSpacing: 1,
                      marginBottom: 10,
                    }}
                  >
                    ⬡ ALS PARTY REGISTRATION
                  </div>

                  <div className='form-grid-2'>
                    <div className='form-group'>
                      <label className='form-label'>ID Type *</label>
                      <select
                        className='form-select'
                        value={form.id_type}
                        onChange={fF('id_type')}
                      >
                        {ID_TYPES.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div className='form-group'>
                      <label className='form-label'>ID Value</label>
                      <input
                        className='form-input'
                        value={form.id_value}
                        onChange={fF('id_value')}
                        placeholder={
                          form.id_type === 'MSISDN'
                            ? 'Phone (auto-fill)'
                            : 'Enter ID value'
                        }
                      />
                      <div style={{ fontSize: 9, color: '#555', marginTop: 3 }}>
                        Empty হলে Phone নম্বর ব্যবহার হবে
                      </div>
                    </div>
                    <div className='form-group'>
                      <label className='form-label'>First Name</label>
                      <input
                        className='form-input'
                        value={form.first_name}
                        onChange={fF('first_name')}
                        placeholder='First name'
                      />
                    </div>
                    <div className='form-group'>
                      <label className='form-label'>Last Name</label>
                      <input
                        className='form-input'
                        value={form.last_name}
                        onChange={fF('last_name')}
                        placeholder='Last name'
                      />
                    </div>
                    <div className='form-group'>
                      <label className='form-label'>Date of Birth</label>
                      <input
                        className='form-input'
                        type='date'
                        value={form.dob}
                        onChange={fF('dob')}
                      />
                    </div>
                  </div>
                </div>
              )}
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
                {saving
                  ? '⏳ Saving...'
                  : modal === 'create'
                    ? '+ Register'
                    : '✓ Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
