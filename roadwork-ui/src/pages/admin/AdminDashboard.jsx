// Main dashboard for ADMIN role
// Two tabs: Work Requests (approve/reject) and Conflicts (resolve)

import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import StatusBadge from '../../components/StatusBadge'
import ResolveConflictModal from './ResolveConflictModal'
import ResolveComplaintModal from './ResolveComplaintModal'
import RejectModal from './RejectModal'

import {
  getAllRequestsAdmin,
   approveRequest,
    markInProgress,
     markCompleted,
  getPendingConflicts,
   getAllConflicts,
   getAllComplaints,
     getSubmittedComplaints,
     markComplaintUnderReview,
} from '../../api/adminApi'
import { getAuditLogs } from '../../api/auditLogApi'
import DepartmentsTab from './DepartmentsTab'
import RoadSegmentsTab from './RoadSegmentsTab'

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('requests')

  const [requests, setRequests]   = useState([])
  const [conflicts, setConflicts] = useState([])
  const [loading, setLoading]     = useState(true)
  const [conflictFilter, setConflictFilter] = useState('PENDING')

  const [selectedConflict, setSelectedConflict] = useState(null)
  const [rejectTargetId, setRejectTargetId]     = useState(null)

const [complaints, setComplaints] = useState([])
const [complaintFilter, setComplaintFilter] = useState('SUBMITTED')
const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [auditLogs, setAuditLogs] = useState([])

  useEffect(() => {
    loadData()
  }, [activeTab, conflictFilter,complaintFilter])

 const loadData = () => {
   setLoading(true)

   if (activeTab === 'requests') {
     getAllRequestsAdmin()
       .then(res => setRequests(res.data.data || []))
       .finally(() => setLoading(false))

   } else if (activeTab === 'conflicts') {
     const call =
       conflictFilter === 'PENDING'
         ? getPendingConflicts()
         : getAllConflicts()

     call
       .then(res => setConflicts(res.data.data || []))
       .finally(() => setLoading(false))

   } else if (activeTab === 'complaints') {
     const call =
       complaintFilter === 'SUBMITTED'
         ? getSubmittedComplaints()
         : getAllComplaints()

     call
         .then(res => setComplaints(res.data.data || []))
         .finally(() => setLoading(false))

   } else if (activeTab === 'auditLog') {
     getAuditLogs()
         .then(res => setAuditLogs(res.data.data || []))
         .finally(() => setLoading(false))
   }
 }
 const handleMarkUnderReview = async (id) => {
   try {
     await markComplaintUnderReview(id)
     loadData()
   } catch (err) {
     alert(err.response?.data?.message || 'Failed to update')
   }
 }
  const handleApprove = async (id) => {
    if (!window.confirm('Approve this work request?')) return
    try {
      await approveRequest(id, 'Approved by admin')
      loadData()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve')
    }
  }

  const handleStart = async (id) => {
    try {
      await markInProgress(id)
      loadData()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update')
    }
  }

  const handleComplete = async (id) => {
    try {
      await markCompleted(id)
      loadData()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update')
    }
  }

  const pendingCount  = requests.filter(r => r.status === 'PENDING').length
  const conflictCount = requests.filter(r => r.status === 'CONFLICT_FLAGGED').length
  const approvedCount = requests.filter(r => r.status === 'APPROVED').length

  return (
    <div style={styles.page}>
      <Navbar title="Admin Dashboard" />

      <div style={styles.container}>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{pendingCount}</div>
            <div style={styles.statLabel}>Pending Requests</div>
          </div>
          <div style={{ ...styles.statCard, borderLeft: '4px solid #dc2626' }}>
            <div style={{ ...styles.statValue, color: '#dc2626' }}>{conflictCount}</div>
            <div style={styles.statLabel}>Active Conflicts</div>
          </div>
          <div style={{ ...styles.statCard, borderLeft: '4px solid #16a34a' }}>
            <div style={{ ...styles.statValue, color: '#16a34a' }}>{approvedCount}</div>
            <div style={styles.statLabel}>Approved</div>
          </div>
        </div>

        <div style={styles.mainTabs}>
          <button
            style={activeTab === 'requests' ? styles.mainTabActive : styles.mainTab}
            onClick={() => setActiveTab('requests')}
          >
            Work Requests
          </button>
          <button
            style={activeTab === 'conflicts' ? styles.mainTabActive : styles.mainTab}
            onClick={() => setActiveTab('conflicts')}
          >
            Conflicts {conflictCount > 0 && <span style={styles.badge}>{conflictCount}</span>}
          </button>

          <button
            style={activeTab === 'complaints' ? styles.mainTabActive : styles.mainTab}
            onClick={() => setActiveTab('complaints')}
          >
            Complaints
            {complaints.filter(c => c.status === 'SUBMITTED').length > 0 && (
              <span style={styles.badge}>
                {complaints.filter(c => c.status === 'SUBMITTED').length}
              </span>
            )}
          </button>

          <button
              style={activeTab === 'auditLog' ? styles.mainTabActive : styles.mainTab}
              onClick={() => setActiveTab('auditLog')}
          >
            Audit Log
          </button>
          <button
              style={activeTab === 'departments' ? styles.mainTabActive : styles.mainTab}
              onClick={() => setActiveTab('departments')}
          >
            Departments
          </button>

          <button
              style={activeTab === 'roadSegments' ? styles.mainTabActive : styles.mainTab}
              onClick={() => setActiveTab('roadSegments')}
          >
            Road Segments
          </button>
        </div>

        {activeTab === 'requests' && (
          loading ? (
            <div style={styles.emptyState}>Loading...</div>
          ) : requests.length === 0 ? (
            <div style={styles.emptyState}>No work requests yet</div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Department</th>
                    <th style={styles.th}>Road Segment</th>
                    <th style={styles.th}>Dates</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(req => (
                    <tr key={req.id} style={styles.tr}>
                      <td style={styles.td}>{req.departmentName}</td>
                      <td style={styles.td}>{req.roadSegmentName}</td>
                      <td style={styles.td}>{req.startDate} → {req.endDate}</td>
                      <td style={styles.td}><StatusBadge status={req.status} /></td>
                      <td style={styles.td}>
                        <div style={styles.actionsCell}>
                          {req.status === 'PENDING' && (
                            <>
                              <button style={styles.approveBtn} onClick={() => handleApprove(req.id)}>
                                Approve
                              </button>
                              <button style={styles.rejectBtn} onClick={() => setRejectTargetId(req.id)}>
                                Reject
                              </button>
                            </>
                          )}
                          {req.status === 'APPROVED' && (
                            <button style={styles.startBtn} onClick={() => handleStart(req.id)}>
                              Mark In Progress
                            </button>
                          )}
                          {req.status === 'IN_PROGRESS' && (
                            <button style={styles.completeBtn} onClick={() => handleComplete(req.id)}>
                              Mark Completed
                            </button>
                          )}
                          {req.status === 'CONFLICT_FLAGGED' && (
                            <span style={styles.conflictNote}>Resolve in Conflicts tab</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {activeTab === 'complaints' && (
          <>
            <div style={styles.tabs}>
              {['SUBMITTED', 'ALL'].map(f => (
                <button
                  key={f}
                  style={complaintFilter === f ? styles.tabActive : styles.tab}
                  onClick={() => setComplaintFilter(f)}
                >
                  {f === 'SUBMITTED' ? 'New Only' : 'All Complaints'}
                </button>
              ))}
            </div>

            {loading ? (
              <div style={styles.emptyState}>Loading...</div>
            ) : complaints.length === 0 ? (
              <div style={styles.emptyState}>No complaints found</div>
            ) : (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Reported By</th>
                      <th style={styles.th}>Road Segment</th>
                      <th style={styles.th}>Category</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.map(c => (
                      <tr key={c.id} style={styles.tr}>
                        <td style={styles.td}>{c.reportedByName}</td>
                        <td style={styles.td}>{c.roadSegmentName}</td>
                        <td style={styles.td}>{c.category?.replace(/_/g, ' ')}</td>
                        <td style={styles.td}><StatusBadge status={c.status} /></td>
                        <td style={styles.td}>
                          <div style={styles.actionsCell}>
                            {c.status === 'SUBMITTED' && (
                              <button style={styles.startBtn} onClick={() => handleMarkUnderReview(c.id)}>
                                Review
                              </button>
                            )}
                            {(c.status === 'SUBMITTED' || c.status === 'UNDER_REVIEW') && (
                              <button style={styles.approveBtn} onClick={() => setSelectedComplaint(c)}>
                                Resolve
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {activeTab === 'conflicts' && (
          <>
            <div style={styles.tabs}>
              {['PENDING', 'ALL'].map(f => (
                <button
                  key={f}
                  style={conflictFilter === f ? styles.tabActive : styles.tab}
                  onClick={() => setConflictFilter(f)}
                >
                  {f === 'PENDING' ? 'Pending Only' : 'All Conflicts'}
                </button>
              ))}
            </div>

            {loading ? (
              <div style={styles.emptyState}>Loading...</div>
            ) : conflicts.length === 0 ? (
              <div style={styles.emptyState}>No conflicts found</div>
            ) : (
              <div style={styles.conflictList}>
                {conflicts.map(c => (
                  <div key={c.id} style={styles.conflictCard}>
                    <div style={styles.conflictHeader}>
                      <span style={styles.conflictId}>Conflict #{c.id}</span>
                      <span style={
                        c.resolutionStatus === 'PENDING'
                          ? styles.conflictStatusPending
                          : styles.conflictStatusResolved
                      }>
                        {c.resolutionStatus}
                      </span>
                    </div>

                    <div style={styles.conflictGrid}>
                      <div>
                        <div style={styles.conflictDept}>{c.requestADepartment}</div>
                        <div style={styles.conflictDetail}>{c.requestARoadSegment}</div>
                        <div style={styles.conflictDetail}>
                          {c.requestAStartDate} → {c.requestAEndDate}
                        </div>
                      </div>
                      <div style={styles.vsLabel}>VS</div>
                      <div>
                        <div style={styles.conflictDept}>{c.requestBDepartment}</div>
                        <div style={styles.conflictDetail}>{c.requestBRoadSegment}</div>
                        <div style={styles.conflictDetail}>
                          {c.requestBStartDate} → {c.requestBEndDate}
                        </div>
                      </div>
                    </div>

                    {c.adminRemarks && (
                      <div style={styles.remarksBox}>
                        <strong>Admin remarks:</strong> {c.adminRemarks}
                      </div>
                    )}

                    {c.resolutionStatus === 'PENDING' && (
                      <button
                        style={styles.resolveBtn}
                        onClick={() => setSelectedConflict(c)}
                      >
                        Resolve This Conflict
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'auditLog' && (
            loading ? (
                <div style={styles.emptyState}>Loading...</div>
            ) : auditLogs.length === 0 ? (
                <div style={styles.emptyState}>No actions logged yet</div>
            ) : (
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                    <tr>
                      <th style={styles.th}>When</th>
                      <th style={styles.th}>Admin</th>
                      <th style={styles.th}>Action</th>
                      <th style={styles.th}>On</th>
                      <th style={styles.th}>Details</th>
                    </tr>
                    </thead>
                    <tbody>
                    {auditLogs.map(entry => (
                        <tr key={entry.id} style={styles.tr}>
                          <td style={styles.td}>
                            {entry.createdAt ? new Date(entry.createdAt).toLocaleString() : ''}
                          </td>
                          <td style={styles.td}>{entry.actorEmail}</td>
                          <td style={styles.td}>{entry.action.replace(/_/g, ' ')}</td>
                          <td style={styles.td}>
                            {entry.entityType ? `${entry.entityType} #${entry.entityId}` : '—'}
                          </td>
                          <td style={styles.td}>{entry.details || '—'}</td>
                        </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
            )
        )}
        {activeTab === 'departments' && <DepartmentsTab />}
        {activeTab === 'roadSegments' && <RoadSegmentsTab />}
      </div>


      {selectedConflict && (
        <ResolveConflictModal
          conflict={selectedConflict}
          onClose={() => setSelectedConflict(null)}
          onSuccess={() => { setSelectedConflict(null); loadData() }}
        />
      )}

      {rejectTargetId && (
        <RejectModal
          requestId={rejectTargetId}
          onClose={() => setRejectTargetId(null)}
          onSuccess={() => { setRejectTargetId(null); loadData() }}
        />
      )}

      {selectedComplaint && (
        <ResolveComplaintModal
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          onSuccess={() => { setSelectedComplaint(null); loadData() }}
        />
      )}
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#f9fafb' },
  container: { maxWidth: '1100px', margin: '0 auto', padding: '2rem' },

  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem',
    marginBottom: '1.75rem',
  },
  statCard: {
    background: '#fff', borderRadius: '12px', padding: '1.25rem',
    border: '1px solid #e5e7eb',
  },
  statValue: { fontSize: '1.8rem', fontWeight: '700', color: '#1a1a2e' },
  statLabel: { fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem' },

  mainTabs: { display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' },
  mainTab: {
    padding: '0.65rem 1.25rem', background: '#fff', border: '1px solid #e5e7eb',
    borderRadius: '8px', fontSize: '0.9rem', cursor: 'pointer',
    color: '#374151', fontWeight: '500',
  },
  mainTabActive: {
    padding: '0.65rem 1.25rem', background: '#1a1a2e', border: '1px solid #1a1a2e',
    borderRadius: '8px', fontSize: '0.9rem', cursor: 'pointer',
    color: '#fff', fontWeight: '600',
  },
  badge: {
    background: '#dc2626', color: '#fff', borderRadius: '999px',
    padding: '0.1rem 0.5rem', fontSize: '0.7rem', marginLeft: '0.4rem',
  },

  tabs: { display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' },
  tab: {
    padding: '0.4rem 0.85rem', background: '#fff', border: '1px solid #e5e7eb',
    borderRadius: '999px', fontSize: '0.8rem', cursor: 'pointer', color: '#374151',
  },
  tabActive: {
    padding: '0.4rem 0.85rem', background: '#1a1a2e', border: '1px solid #1a1a2e',
    borderRadius: '999px', fontSize: '0.8rem', cursor: 'pointer', color: '#fff',
    fontWeight: '600',
  },

  emptyState: {
    background: '#fff', borderRadius: '12px', padding: '3rem',
    textAlign: 'center', color: '#9ca3af', border: '1px dashed #e5e7eb',
  },

  tableWrapper: {
    background: '#fff', borderRadius: '12px', overflow: 'hidden',
    border: '1px solid #e5e7eb',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    textAlign: 'left', padding: '0.85rem 1.25rem', fontSize: '0.75rem',
    fontWeight: '600', color: '#6b7280', textTransform: 'uppercase',
    background: '#f9fafb', borderBottom: '1px solid #e5e7eb',
  },
  tr: { borderBottom: '1px solid #f3f4f6' },
  td: { padding: '1rem 1.25rem', fontSize: '0.875rem', color: '#1f2937' },
  actionsCell: { display: 'flex', gap: '0.5rem' },

  approveBtn: {
    padding: '0.4rem 0.8rem', background: '#16a34a', color: '#fff',
    border: 'none', borderRadius: '6px', fontSize: '0.78rem',
    fontWeight: '600', cursor: 'pointer',
  },
  rejectBtn: {
    padding: '0.4rem 0.8rem', background: '#dc2626', color: '#fff',
    border: 'none', borderRadius: '6px', fontSize: '0.78rem',
    fontWeight: '600', cursor: 'pointer',
  },
  startBtn: {
    padding: '0.4rem 0.8rem', background: '#2563eb', color: '#fff',
    border: 'none', borderRadius: '6px', fontSize: '0.78rem',
    fontWeight: '600', cursor: 'pointer',
  },
  completeBtn: {
    padding: '0.4rem 0.8rem', background: '#6b7280', color: '#fff',
    border: 'none', borderRadius: '6px', fontSize: '0.78rem',
    fontWeight: '600', cursor: 'pointer',
  },
  conflictNote: { fontSize: '0.78rem', color: '#dc2626', fontStyle: 'italic' },

  conflictList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  conflictCard: {
    background: '#fff', borderRadius: '12px', padding: '1.25rem',
    border: '1px solid #e5e7eb',
  },
  conflictHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '1rem',
  },
  conflictId: { fontWeight: '700', color: '#1a1a2e' },
  conflictStatusPending: {
    background: '#fef3c7', color: '#92400e', padding: '0.2rem 0.6rem',
    borderRadius: '999px', fontSize: '0.7rem', fontWeight: '700',
  },
  conflictStatusResolved: {
    background: '#d1fae5', color: '#065f46', padding: '0.2rem 0.6rem',
    borderRadius: '999px', fontSize: '0.7rem', fontWeight: '700',
  },
  conflictGrid: {
    display: 'grid', gridTemplateColumns: '1fr auto 1fr',
    gap: '1rem', alignItems: 'center', marginBottom: '0.75rem',
  },
  vsLabel: { fontWeight: '700', color: '#d1d5db', fontSize: '0.85rem' },
  conflictDept: { fontWeight: '700', fontSize: '0.9rem', color: '#1a1a2e' },
  conflictDetail: { fontSize: '0.8rem', color: '#6b7280', marginTop: '0.15rem' },
  remarksBox: {
    background: '#f9fafb', borderRadius: '8px', padding: '0.65rem 0.9rem',
    fontSize: '0.82rem', color: '#374151', marginBottom: '0.75rem',
  },
  resolveBtn: {
    padding: '0.6rem 1.1rem', background: '#1a1a2e', color: '#fff',
    border: 'none', borderRadius: '8px', fontSize: '0.85rem',
    fontWeight: '600', cursor: 'pointer',
  },
}

export default AdminDashboard