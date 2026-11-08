// Dashboard for INSPECTOR role: assigned requests + submitted reports
import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import StatusBadge from '../../components/StatusBadge'
import InspectionReportModal from './InspectionReportModal'
import { getMyAssignments, getMyReports } from '../../api/inspectionApi'

const BASE = 'http://localhost:9090'

function Thumb({ url }) {
    if (!url) return '—'
    return (
        <a href={`${BASE}${url}`} target="_blank" rel="noreferrer">
            <img src={`${BASE}${url}`} alt="" style={s.thumb} />
        </a>
    )
}

function InspectorDashboard() {
    const [assignments, setAssignments] = useState([])
    const [reports, setReports] = useState([])
    const [loading, setLoading] = useState(true)
    const [target, setTarget] = useState(null)

    const load = () =>
        Promise.all([getMyAssignments(), getMyReports()])
            .then(([a, r]) => {
                setAssignments(a.data.data || [])
                setReports(r.data.data || [])
            })
            .finally(() => setLoading(false))

    useEffect(() => { load() }, [])

    return (
        <div style={s.page}>
            <Navbar title="Inspector Dashboard" />

            <div style={s.container}>
                <h3 style={s.heading}>Assigned to me</h3>
                {loading ? (
                    <div style={s.empty}>Loading...</div>
                ) : assignments.length === 0 ? (
                    <div style={s.empty}>No requests assigned to you yet</div>
                ) : (
                    <div style={s.tableWrapper}>
                        <table style={s.table}>
                            <thead>
                            <tr>
                                <th style={s.th}>Road Segment</th>
                                <th style={s.th}>Department</th>
                                <th style={s.th}>Dates</th>
                                <th style={s.th}>Status</th>
                                <th style={s.th}>Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            {assignments.map(a => (
                                <tr key={a.id} style={s.tr}>
                                    <td style={s.td}>{a.roadSegmentName}</td>
                                    <td style={s.td}>{a.departmentName}</td>
                                    <td style={s.td}>{a.startDate} → {a.endDate}</td>
                                    <td style={s.td}><StatusBadge status={a.status} /></td>
                                    <td style={s.td}>
                                        <button style={s.btn} onClick={() => setTarget(a)}>Submit Report</button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <h3 style={{ ...s.heading, marginTop: '2rem' }}>My reports</h3>
                {reports.length === 0 ? (
                    <div style={s.empty}>No reports submitted yet</div>
                ) : (
                    <div style={s.tableWrapper}>
                        <table style={s.table}>
                            <thead>
                            <tr>
                                <th style={s.th}>Date</th>
                                <th style={s.th}>Road Segment</th>
                                <th style={s.th}>Before</th>
                                <th style={s.th}>After</th>
                                <th style={s.th}>Verdict</th>
                            </tr>
                            </thead>
                            <tbody>
                            {reports.map(r => (
                                <tr key={r.id} style={s.tr}>
                                    <td style={s.td}>{new Date(r.createdAt).toLocaleString()}</td>
                                    <td style={s.td}>{r.roadSegmentName}</td>
                                    <td style={s.td}><Thumb url={r.beforePhotoUrl} /></td>
                                    <td style={s.td}><Thumb url={r.afterPhotoUrl} /></td>
                                    <td style={s.td}>{r.restorationStatus.replace(/_/g, ' ')}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {target && (
                <InspectionReportModal
                    request={target}
                    onClose={() => setTarget(null)}
                    onSuccess={() => { setTarget(null); load() }}
                />
            )}
        </div>
    )
}

const s = {
    page: { minHeight: '100vh', background: '#f9fafb' },
    container: { maxWidth: '1100px', margin: '0 auto', padding: '2rem' },
    heading: { fontSize: '1rem', fontWeight: '700', color: '#1a1a2e', marginBottom: '0.75rem' },
    empty: { background: '#fff', borderRadius: '12px', padding: '2.5rem', textAlign: 'center', color: '#9ca3af', border: '1px dashed #e5e7eb' },
    tableWrapper: { background: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' },
    tr: { borderBottom: '1px solid #f3f4f6' },
    td: { padding: '1rem 1.25rem', fontSize: '0.875rem', color: '#1f2937' },
    btn: { padding: '0.45rem 0.9rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' },
    thumb: { width: 48, height: 48, objectFit: 'cover', borderRadius: 6 },
}

export default InspectorDashboard