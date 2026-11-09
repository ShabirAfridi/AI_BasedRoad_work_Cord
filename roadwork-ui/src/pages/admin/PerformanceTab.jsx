import { useState, useEffect } from 'react'
import { getDepartmentPerformance, getMonthlyTrend } from '../../api/performanceApi'

const fmt = (v, suffix = '') => (v == null ? '—' : `${v}${suffix}`)

function RateBar({ value, color }) {
    if (value == null) return <span style={{ color: '#9ca3af' }}>—</span>
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '120px' }}>
            <div style={s.barTrack}>
                <div style={{ ...s.barFill, width: `${value}%`, background: color }} />
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>{value}%</span>
        </div>
    )
}

function PerformanceTab() {
    const [rows, setRows] = useState([])
    const [trend, setTrend] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([getDepartmentPerformance(), getMonthlyTrend()])
            .then(([d, t]) => {
                setRows(d.data.data || [])
                setTrend(t.data.data || [])
            })
            .finally(() => setLoading(false))
    }, [])

    if (loading) return <div style={s.empty}>Loading...</div>

    const totalRequests = rows.reduce((sum, r) => sum + r.totalRequests, 0)
    const totalCompleted = rows.reduce((sum, r) => sum + r.completed, 0)
    const overallRate = totalRequests === 0 ? null : Math.round((totalCompleted * 1000) / totalRequests) / 10
    const maxTrend = Math.max(1, ...trend.flatMap(t => [t.submitted, t.completed]))

    return (
        <div>
            <div style={s.cards}>
                <div style={s.card}>
                    <div style={s.cardValue}>{rows.length}</div>
                    <div style={s.cardLabel}>Departments</div>
                </div>
                <div style={s.card}>
                    <div style={s.cardValue}>{totalRequests}</div>
                    <div style={s.cardLabel}>Total Requests</div>
                </div>
                <div style={s.card}>
                    <div style={s.cardValue}>{totalCompleted}</div>
                    <div style={s.cardLabel}>Completed</div>
                </div>
                <div style={s.card}>
                    <div style={s.cardValue}>{fmt(overallRate, '%')}</div>
                    <div style={s.cardLabel}>Overall Completion Rate</div>
                </div>
            </div>

            <h3 style={s.heading}>Department performance</h3>
            {rows.length === 0 ? (
                <div style={s.empty}>No departments yet</div>
            ) : (
                <div style={s.tableWrapper}>
                    <table style={s.table}>
                        <thead>
                        <tr>
                            <th style={s.th}>Department</th>
                            <th style={s.th}>Total</th>
                            <th style={s.th}>Pending</th>
                            <th style={s.th}>Active</th>
                            <th style={s.th}>Completed</th>
                            <th style={s.th}>Rejected</th>
                            <th style={s.th}>Completion</th>
                            <th style={s.th}>Approval</th>
                            <th style={s.th}>Avg Days</th>
                            <th style={s.th}>Inspections</th>
                            <th style={s.th}>Restored</th>
                        </tr>
                        </thead>
                        <tbody>
                        {rows.map(r => (
                            <tr key={r.departmentId} style={s.tr}>
                                <td style={{ ...s.td, fontWeight: '600' }}>{r.departmentName}</td>
                                <td style={s.td}>{r.totalRequests}</td>
                                <td style={s.td}>{r.pending}</td>
                                <td style={s.td}>{r.active}</td>
                                <td style={s.td}>{r.completed}</td>
                                <td style={s.td}>{r.rejected}</td>
                                <td style={s.td}><RateBar value={r.completionRate} color="#16a34a" /></td>
                                <td style={s.td}><RateBar value={r.approvalRate} color="#2563eb" /></td>
                                <td style={s.td}>{fmt(r.avgPlannedDays)}</td>
                                <td style={s.td}>{r.inspections}</td>
                                <td style={s.td}><RateBar value={r.restorationRate} color="#d97706" /></td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            <h3 style={{ ...s.heading, marginTop: '2rem' }}>Last 6 months</h3>
            <div style={s.chartCard}>
                <div style={s.legend}>
                    <span><span style={{ ...s.dot, background: '#2563eb' }} /> Submitted</span>
                    <span><span style={{ ...s.dot, background: '#16a34a' }} /> Completed</span>
                </div>
                <div style={s.chart}>
                    {trend.map(t => (
                        <div key={t.month} style={s.col}>
                            <div style={s.bars}>
                                <div style={s.barWrap}>
                                    <span style={s.barNum}>{t.submitted}</span>
                                    <div style={{ ...s.bar, background: '#2563eb', height: `${(t.submitted / maxTrend) * 100}%` }} />
                                </div>
                                <div style={s.barWrap}>
                                    <span style={s.barNum}>{t.completed}</span>
                                    <div style={{ ...s.bar, background: '#16a34a', height: `${(t.completed / maxTrend) * 100}%` }} />
                                </div>
                            </div>
                            <div style={s.monthLabel}>{t.month}</div>
                        </div>
                    ))}
                </div>
            </div>

            <p style={s.note}>
                Completion = completed / total requests. Approval = approved-or-later / (approved-or-later + rejected).
                Avg Days = average planned duration. Restored = inspection reports marked "Restored".
            </p>
        </div>
    )
}

const s = {
    empty: { background: '#fff', borderRadius: '12px', padding: '3rem', textAlign: 'center', color: '#9ca3af', border: '1px dashed #e5e7eb' },
    cards: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.75rem' },
    card: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.1rem' },
    cardValue: { fontSize: '1.7rem', fontWeight: '700', color: '#1a1a2e' },
    cardLabel: { fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem' },
    heading: { fontSize: '1rem', fontWeight: '700', color: '#1a1a2e', marginBottom: '0.75rem' },
    tableWrapper: { background: '#fff', borderRadius: '12px', overflowX: 'auto', border: '1px solid #e5e7eb' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '0.8rem 1rem', fontSize: '0.72rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' },
    tr: { borderBottom: '1px solid #f3f4f6' },
    td: { padding: '0.9rem 1rem', fontSize: '0.85rem', color: '#1f2937' },
    barTrack: { flex: 1, height: '8px', background: '#e5e7eb', borderRadius: '999px', overflow: 'hidden' },
    barFill: { height: '100%', borderRadius: '999px' },
    chartCard: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.25rem' },
    legend: { display: 'flex', gap: '1.25rem', fontSize: '0.8rem', color: '#374151', marginBottom: '1rem' },
    dot: { display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', marginRight: '0.35rem' },
    chart: { display: 'flex', gap: '1rem', alignItems: 'flex-end' },
    col: { flex: 1, textAlign: 'center' },
    bars: { display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'flex-end', height: '150px' },
    barWrap: { display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', height: '100%', width: '28px' },
    bar: { width: '100%', borderRadius: '4px 4px 0 0', minHeight: '2px' },
    barNum: { fontSize: '0.7rem', color: '#6b7280', marginBottom: '2px' },
    monthLabel: { fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' },
    note: { fontSize: '0.75rem', color: '#9ca3af', marginTop: '1rem' },
}

export default PerformanceTab