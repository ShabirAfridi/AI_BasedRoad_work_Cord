
import { useState, useEffect } from 'react'
import { FiClock, FiCheckCircle, FiAlertTriangle, FiCheckSquare } from 'react-icons/fi'
import DashboardLayout from '../../components/layout/DashboardLayout'
import HeroSection from '../../components/dashboard/HeroSection'
import StatCard from '../../components/dashboard/StatCard'
import StatusBadge from '../../components/StatusBadge'
import SubmitRequestModal from './SubmitRequestModal'
import { getWorkRequests, cancelWorkRequest } from '../../api/workRequestApi'

function DepartmentDashboard() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = () => {
    setLoading(true)
    getWorkRequests()
      .then(res => setRequests(res.data.data || []))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false))
  }

  const handleSubmitSuccess = () => {
    setShowModal(false)
    loadRequests()
  }

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this work request?')) return
    try {
      await cancelWorkRequest(id)
      loadRequests()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel request')
    }
  }

  const filteredRequests = filter === 'ALL'
    ? requests
    : requests.filter(r => r.status === filter)

  // KPI counts — derived from the same requests array, no extra API calls needed
  const pendingCount   = requests.filter(r => r.status === 'PENDING').length
  const approvedCount  = requests.filter(r => r.status === 'APPROVED').length
  const conflictCount  = requests.filter(r => r.status === 'CONFLICT_FLAGGED').length
  const completedCount = requests.filter(r => r.status === 'COMPLETED').length

  return (
<DashboardLayout conflictCount={conflictCount}>

      <HeroSection onNewRequest={() => setShowModal(true)} />

      <div className="mb-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Pending"   value={pendingCount}   color="#F59E0B" icon={FiClock} />
        <StatCard title="Approved"  value={approvedCount}  color="#22C55E" icon={FiCheckCircle} />
        <StatCard title="Conflicts" value={conflictCount}  color="#EF4444" icon={FiAlertTriangle} />
        <StatCard title="Completed" value={completedCount} color="#3B82F6" icon={FiCheckSquare} />
      </div>

      {conflictCount > 0 && (
        <div  id="conflict-banner" className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-3.5 text-sm font-medium text-red-800">
          You have {conflictCount} work request{conflictCount > 1 ? 's' : ''} with
          scheduling conflicts. These are pending admin review.
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div id="requests-table" className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">My Work Requests</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Manage your department's road excavation requests
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {['ALL', 'PENDING', 'CONFLICT_FLAGGED', 'APPROVED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED'].map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  filter === tab
                    ? 'bg-slate-900 text-white'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-slate-400">Loading...</div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            No work requests found. Click "New Request" to submit one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Road Segment</th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Work Type</th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Start Date</th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">End Date</th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map(req => (
                  <tr key={req.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm">
                      <div className="font-semibold text-slate-900">{req.roadSegmentName}</div>
                      <div className="text-xs text-slate-400">{req.city}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{req.workType?.replace(/_/g, ' ')}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{req.startDate}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{req.endDate}</td>
                    <td className="px-6 py-4"><StatusBadge status={req.status} /></td>
                    <td className="px-6 py-4">
                      {(req.status === 'PENDING' || req.status === 'CONFLICT_FLAGGED') && (
                        <button
                          onClick={() => handleCancel(req.id)}
                          className="text-sm font-semibold text-red-600 hover:text-red-700"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <SubmitRequestModal
          onClose={() => setShowModal(false)}
          onSuccess={handleSubmitSuccess}
        />
      )}

    </DashboardLayout>
  )
}

export default DepartmentDashboard