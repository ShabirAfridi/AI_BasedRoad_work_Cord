import { useState, useEffect } from 'react'
import { getAllRoadSegments, createRoadSegment } from '../../api/roadSegmentApi'

const EMPTY = { name: '', area: '', city: 'Islamabad', latitude: '', longitude: '' }

function RoadSegmentsTab() {
    const [segments, setSegments] = useState([])
    const [loading, setLoading] = useState(true)
    const [form, setForm] = useState(EMPTY)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const load = () =>
        getAllRoadSegments()
            .then(res => setSegments(res.data.data || []))
            .finally(() => setLoading(false))

    useEffect(() => { load() }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        if (!form.name) {
            setError('Road segment name is required')
            return
        }
        setSubmitting(true)
        try {
            await createRoadSegment({
                ...form,
                latitude: form.latitude ? parseFloat(form.latitude) : null,
                longitude: form.longitude ? parseFloat(form.longitude) : null,
            })
            setSuccess('Road segment added')
            setForm(EMPTY)
            await load()
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add road segment')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div>
            <form onSubmit={handleSubmit} style={s.formCard}>
                <h4 style={s.formTitle}>Add Road Segment</h4>
                {error && <div style={s.error}>{error}</div>}
                {success && <div style={s.success}>{success}</div>}
                <div style={s.row}>
                    <input style={s.input} placeholder="Name (e.g. Murree Road G-9)" value={form.name}
                           onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    <input style={s.input} placeholder="Area" value={form.area}
                           onChange={(e) => setForm({ ...form, area: e.target.value })} />
                    <input style={s.input} placeholder="City" value={form.city}
                           onChange={(e) => setForm({ ...form, city: e.target.value })} />
                    <input style={s.input} placeholder="Latitude (optional)" value={form.latitude}
                           onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
                    <input style={s.input} placeholder="Longitude (optional)" value={form.longitude}
                           onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
                    <button type="submit" style={s.btn} disabled={submitting}>
                        {submitting ? 'Adding...' : 'Add'}
                    </button>
                </div>
            </form>

            {loading ? (
                <div style={s.empty}>Loading...</div>
            ) : segments.length === 0 ? (
                <div style={s.empty}>No road segments yet</div>
            ) : (
                <div style={s.tableWrapper}>
                    <table style={s.table}>
                        <thead>
                        <tr>
                            <th style={s.th}>Name</th>
                            <th style={s.th}>Area</th>
                            <th style={s.th}>City</th>
                            <th style={s.th}>Status</th>
                        </tr>
                        </thead>
                        <tbody>
                        {segments.map(seg => (
                            <tr key={seg.id} style={s.tr}>
                                <td style={s.td}>{seg.name}</td>
                                <td style={s.td}>{seg.area || '—'}</td>
                                <td style={s.td}>{seg.city}</td>
                                <td style={s.td}>{seg.isActive ? 'Active' : 'Inactive'}</td>
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
    input: { flex: 1, minWidth: '140px', padding: '0.6rem 0.8rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' },
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

export default RoadSegmentsTab