// Citizen Portal - public map view + issue reporting
import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import WorkRequestMap from '../../components/WorkRequestMap'
import MapLegend from '../../components/MapLegend'
import ReportComplaintModal from './ReportComplaintModal'
import { getActiveWorkRequests } from '../../api/workRequestApi'
import { getRoadSegments } from '../../api/roadSegmentApi'

function CitizenMapPage() {
  const [requests, setRequests]         = useState([])
  const [roadSegments, setRoadSegments] = useState([])
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState('')
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportedFlash, setReportedFlash]     = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setLoading(true)
    Promise.all([
      getActiveWorkRequests(),
      getRoadSegments(),
    ])
      .then(([reqRes, segRes]) => {
        setRequests(reqRes.data.data || [])
        setRoadSegments(segRes.data.data || [])
      })
      .catch(() => {
        setRequests([])
        setRoadSegments([])
      })
      .finally(() => setLoading(false))
  }

  const handleReportSuccess = () => {
    setShowReportModal(false)
    setReportedFlash(true)
    setTimeout(() => setReportedFlash(false), 4000)
  }

  const filtered = requests.filter(r =>
    r.roadSegmentName?.toLowerCase().includes(search.toLowerCase()) ||
    r.departmentName?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={styles.page}>
      <Navbar title="Road Work Map" />

      <div style={styles.container}>

        {reportedFlash && (
          <div style={styles.successBanner}>
            Your report has been submitted and the road authority has been notified. Thank you.
          </div>
        )}

        <div style={styles.header}>
          <div>
            <h2 style={styles.pageTitle}>Active Road Work</h2>
            <p style={styles.pageSubtitle}>
              View all approved and ongoing excavation work in your city
            </p>
          </div>

          <div style={styles.headerActions}>
            <input
              style={styles.searchInput}
              type="text"
              placeholder="Search by road or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button style={styles.reportBtn} onClick={() => setShowReportModal(true)}>
              Report an Issue
            </button>
          </div>
        </div>

        <MapLegend />

        {loading ? (
          <div style={styles.emptyState}>Loading map...</div>
        ) : (
          <>
            <WorkRequestMap requests={filtered} height="500px" />

            <div style={styles.listSection}>
              <h3 style={styles.listTitle}>
                {filtered.length} active work {filtered.length === 1 ? 'site' : 'sites'}
              </h3>

              {filtered.length === 0 ? (
                <div style={styles.emptyState}>No active work found</div>
              ) : (
                <div style={styles.cardGrid}>
                  {filtered.map(req => (
                    <div key={req.id} style={styles.card}>
                      <div style={styles.cardTitle}>{req.roadSegmentName}</div>
                      <div style={styles.cardCity}>{req.city}</div>
                      <div style={styles.cardRow}>
                        <span style={styles.cardLabel}>Department:</span> {req.departmentName}
                      </div>
                      <div style={styles.cardRow}>
                        <span style={styles.cardLabel}>Work:</span> {req.workType?.replace(/_/g, ' ')}
                      </div>
                      <div style={styles.cardRow}>
                        <span style={styles.cardLabel}>Dates:</span> {req.startDate} to {req.endDate}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

      </div>

      {showReportModal && (
        <ReportComplaintModal
          roadSegments={roadSegments}
          onClose={() => setShowReportModal(false)}
          onSuccess={handleReportSuccess}
        />
      )}
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#f9fafb' },
  container: { maxWidth: '1100px', margin: '0 auto', padding: '2rem' },
  successBanner: {
    background: '#d1fae5', border: '1px solid #6ee7b7', color: '#065f46',
    padding: '0.85rem 1.1rem', borderRadius: '10px',
    marginBottom: '1.5rem', fontSize: '0.88rem', fontWeight: '500',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap',
  },
  pageTitle: { fontSize: '1.5rem', fontWeight: '700', color: '#1a1a2e', margin: 0 },
  pageSubtitle: { color: '#6b7280', fontSize: '0.9rem', marginTop: '0.25rem' },
  headerActions: { display: 'flex', gap: '0.6rem', flexWrap: 'wrap' },
  searchInput: {
    padding: '0.6rem 1rem', border: '1px solid #d1d5db',
    borderRadius: '8px', fontSize: '0.875rem', minWidth: '240px', outline: 'none',
  },
  reportBtn: {
    padding: '0.6rem 1.1rem', background: '#dc2626', color: '#fff',
    border: 'none', borderRadius: '8px', fontWeight: '600',
    cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap',
  },
  emptyState: {
    background: '#fff', borderRadius: '12px', padding: '3rem',
    textAlign: 'center', color: '#9ca3af', border: '1px dashed #e5e7eb',
  },
  listSection: { marginTop: '1.75rem' },
  listTitle: { fontSize: '1.1rem', fontWeight: '700', color: '#1a1a2e', marginBottom: '1rem' },
  cardGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '1rem',
  },
  card: {
    background: '#fff', borderRadius: '10px', padding: '1rem',
    border: '1px solid #e5e7eb',
  },
  cardTitle: { fontWeight: '700', fontSize: '0.95rem', color: '#1a1a2e' },
  cardCity: { fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.5rem' },
  cardRow: { fontSize: '0.8rem', color: '#374151', marginTop: '0.2rem' },
  cardLabel: { fontWeight: '600', color: '#6b7280' },
  reportBanner: {
    marginTop: '2rem', background: '#fff', border: '1px solid #fecaca',
    borderRadius: '12px', padding: '1.25rem 1.5rem',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    gap: '1rem', flexWrap: 'wrap',
  },
  reportBannerTitle: { fontWeight: '700', fontSize: '0.95rem', color: '#1a1a2e' },
  reportBannerText: { fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem' },
  reportBtnSecondary: {
    padding: '0.6rem 1.2rem', background: '#fff', color: '#dc2626',
    border: '1px solid #dc2626', borderRadius: '8px', fontWeight: '600',
    cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap',
  },
}

export default CitizenMapPage