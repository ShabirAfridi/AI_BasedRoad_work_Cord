import { useState, useEffect } from 'react'
import { getAllDepartments, createDepartment } from '../../api/departmentApi'

function DepartmentsTab() {
    const [departments, setDepartments] = useState([])
    const [loading, setLoading] = useState(true)
    const [form, setForm] = useState({ name: '', contactEmail: '', phoneNumber: '' })
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const load = () =>
        getAllDepartments()
            .then(res => setDepartments(res.data.data || []))
            .finally(() => setLoading(false))

    useEffect(() => { load() }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        if (!form.name || !form.contactEmail) {
            setError('Name and contact email are required')
            return
        }
        setSubmitting(true)
        try {
            await createDepartment(form)
            setSuccess('Department added')
            setForm({ name: '', contactEmail: '', phoneNumber: '' })
            await load()
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add department')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div>
            <form onSubmit={handleSubmit} style={s.formCard}>
                <h4 style={s.formTitle}>Add Department</h4>
                {error && <div style={s.error}>{error}</div>}
                {success && <div style={s.success}>{success}</div>}
                <div style={s.row}>
                    <input style={s.input} placeholder="Department name" value={form.name}
                           onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    <input style={s.input} placeholder="Contact email" value={form.contactEmail}
                           onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
                    <input style={s.input} placeholder="Phone (optional)" value={form.phoneNumber}
                           onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
                    <button type="submit" style={s.btn} disabled={submitting}>
                        {submitting ? 'Adding...' : 'Add'}
                    </button>
                </div>
            </form>

            {loading ? (
                <div style={s.empty}>Loading...</div>
            ) : departments.length === 0 ? (
                <div style={s.empty}>No departments yet</div>
            ) : (
                <div style={s.tableWrapper}>
                    <table style={s.table}>
                        <thead>
                        <tr>
                            <th style={s.th}>ID</th>
                            <th style={s.th}>Name</th>
                            <th style={s.th}>Contact Email</th>
                            <th style={s.th}>Phone</th>
                            <th style={s.th}>Status</th>
                        </tr>
                        </thead>
                        <tbody>
                        {departments.map(d => (
                            <tr key={d.id} style={s.tr}>
                                <td style={s.td}>{d.id}</td>
                                <td style={s.td}>{d.name}</td>
                                <td style={s.td}>{d.contactEmail}</td>
                                <td style={s.td}>{d.phoneNumber || '—'}</td>
                                <td style={s.td}>{d.isActive ? 'Active' : 'Inactive'}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

const s = {
    formCard: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '1.25rem', marginBottom: '1.5rem' },
    formTitle: { fontSize: '0.95rem', fontWeight: '600', color: '#374151', margin: 0 },
    row: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.75rem' },
    input: { flex: 1, minWidth: '160px', padding: '0.6rem 0.8rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' },
    btn: { padding: '0.6rem 1.3rem', background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
    error: { background: '#fee2e2', color: '#991b1b', padding: '0.6rem 1rem', borderRadius: '8px', marginTop: '0.75rem', fontSize: '0.85rem' },
    success: { background: '#d1fae5', color: '#065f46', padding: '0.6rem 1rem', borderRadius: '8px', marginTop: '0.75rem', fontSize: '0.85rem' },
    empty: { textAlign: 'center', padding: '3rem', color: '#6b7280' },
    tableWrapper: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '0.85rem 1.25rem', fontSize: '0.8rem', color: '#6b7280', borderBottom: '1px solid #e5e7eb' },
    tr: { borderBottom: '1px solid #f3f4f6' },
    td: { padding: '0.9rem 1.25rem', fontSize: '0.875rem', color: '#1f2937' },
}

export default DepartmentsTab