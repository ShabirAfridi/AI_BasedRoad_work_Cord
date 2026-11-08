import { useState, useEffect } from 'react'
import { getInspectionReports } from '../../api/inspectionApi'

const BASE = 'http://localhost:9090'

function Thumb({ url }) {
    if (!url) return '—'
    return (
        <a href={`${BASE}${url}`} target="_blank" rel="noreferrer">
            <img src={`${BASE}${url}`} alt="" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }} />
        </a>
    )
}

function InspectionReportsTab() {
    const [reports, setReports] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getInspectionReports()
            .then(res => setReports(res.data.data || []))
            .finally(() => setLoading(false))
    }, [])

    if (loading) return <div style={s.empty}>Loading...</div>
    if (reports.length === 0) return <div style={s.empty}>No inspection reports yet</div>

    return (
        <div style={s.tableWrapper}>
            <table style={s.table}>
                <thead>
                <tr>
                    <th style={s.th}>Date</th>
                    <th style={s.th}>Request</th>
                    <th style={s.th}>Inspector</th>
                    <th style={s.th}>Before</th>
                    <th style={s.th}>After</th>
                    <th style={s.th}>Verdict</th>
                    <th style={s.th}>Location</th>
                    <th style={s.th}>Remarks</th>
                </tr>
                </thead>
                <tbody>
                {reports.map(r => (
                    <tr key={r.id} style={s.tr}>
                        <td style={s.td}>{new Date(r.createdAt).toLocaleString()}</td>
                        <td style={s.td}>#{r.workRequestId} · {r.roadSegmentName}<br />
                            <span style={{ color: '#6b7280', fontSize: '0.78rem' }}>{r.departmentName}</span>
                        </td>
                        <td style={s.td}>{r.inspectorName}</td>
                        <td style={s.td}><Thumb url={r.beforePhotoUrl} /></td>
                        <td style={s.td}><Thumb url={r.afterPhotoUrl} /></td>
                        <td style={s.td}>{r.restorationStatus.replace(/_/g, ' ')}</td>
                        <td style={s.td}>
                            {r.latitude != null ? (
                                <a href={`https://www.google.com/maps?q=${r.latitude},${r.longitude}`} target="_blank" rel="noreferrer">
                                    View map
                                </a>
                            ) : '—'}
                        </td>
                        <td style={s.td}>{r.remarks || '—'}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    )
}

const s = {
    empty: { background: '#fff', borderRadius: '12px', padding: '3rem', textAlign: 'center', color: '#9ca3af', border: '1px dashed #e5e7eb' },
    tableWrapper: { background: '#fff', borderRadius: '12px', overflowX: 'auto', border: '1px solid #e5e7eb' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' },
    tr: { borderBottom: '1px solid #f3f4f6' },
    td: { padding: '0.9rem 1rem', fontSize: '0.85rem', color: '#1f2937', verticalAlign: 'top' },
}

export default InspectionReportsTab