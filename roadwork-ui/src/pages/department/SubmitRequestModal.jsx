// Modal form for submitting a new work request
// Opens when department user clicks "New Request" button

import { useState, useEffect } from 'react'
import { submitWorkRequest } from '../../api/workRequestApi'
import { getRoadSegments } from '../../api/roadSegmentApi'

const WORK_TYPES = [
  'WATER_PIPE', 'GAS_PIPE', 'ELECTRICITY_CABLE',
  'TELECOM_CABLE', 'SEWERAGE', 'ROAD_REPAIR', 'OTHER'
]

function SubmitRequestModal({ onClose, onSuccess }) {
  const [roadSegments, setRoadSegments] = useState([])
  const [segmentsLoading, setSegmentsLoading] = useState(false)
  const [roadSegmentsError, setRoadSegmentsError] = useState('')
  const [formData, setFormData] = useState({
    roadSegmentId: '',
    workType: 'WATER_PIPE',
    description: '',
    startDate: '',
    endDate: '',
    priority: 2,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Load road segments for the dropdown when modal opens
  useEffect(() => {
    loadSegments()
    }, [])
    const loadSegments = () => {
    setSegmentsLoading(true)
    setRoadSegmentsError("")
    getRoadSegments()
      .then(res =>{
      const list = res.data.data || [];
      setRoadSegments(list);
      if(list.length===0){
      setRoadSegmentsError(
      "No road segment available .Contact an Administrator"
      );
     }
  })
   .catch (err=>{
   setRoadSegmentsError(err.response?.data?.message || "Failed to load Road segments")
   })
   .finally (() => {setSegmentsLoading(false);
 });
};
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const payload = {
        ...formData,
        roadSegmentId: parseInt(formData.roadSegmentId),
        priority: parseInt(formData.priority),
      }
      await submitWorkRequest(payload)
      onSuccess()  // tells parent to refresh the list and close modal
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>

        <div style={styles.header}>
          <h3 style={styles.title}>Submit New Work Request</h3>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>

          <div style={styles.field}>
            <label style={styles.label}>Road Segment</label>
            <select
              style={styles.input}
              name="roadSegmentId"
              value={formData.roadSegmentId}
              onChange={handleChange}
              required
            >
              <option value="">Select road segment</option>
              {roadSegments.map(seg => (
                <option key={seg.id} value={seg.id}>
                  {seg.name} — {seg.city}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Work Type</label>
            <select
              style={styles.input}
              name="workType"
              value={formData.workType}
              onChange={handleChange}
            >
              {WORK_TYPES.map(type => (
                <option key={type} value={type}>
                  {type.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.row}>
            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.label}>Start Date</label>
              <input
                style={styles.input}
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>
            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.label}>End Date</label>
              <input
                style={styles.input}
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Priority</label>
            <select
              style={styles.input}
              name="priority"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value={1}>High</option>
              <option value={2}>Normal</option>
              <option value={3}>Low</option>
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Description</label>
            <textarea
              style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of the work..."
            />
          </div>

          <div style={styles.actions}>
            <button type="button" style={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              style={loading ? styles.submitBtnDisabled : styles.submitBtn}
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#fff',
    borderRadius: '12px',
    padding: '1.75rem',
    width: '100%',
    maxWidth: '480px',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '1.25rem',
  },
  title: { fontSize: '1.2rem', fontWeight: '700', color: '#1a1a2e' },
  closeBtn: {
    background: 'none', border: 'none', fontSize: '1.2rem',
    cursor: 'pointer', color: '#6b7280',
  },
  error: {
    background: '#fee2e2', color: '#991b1b',
    padding: '0.65rem 1rem', borderRadius: '8px',
    marginBottom: '1rem', fontSize: '0.85rem',
  },
  field: { marginBottom: '1rem' },
  row: { display: 'flex', gap: '0.75rem' },
  label: {
    display: 'block', marginBottom: '0.35rem',
    fontSize: '0.85rem', fontWeight: '500', color: '#374151',
  },
  input: {
    width: '100%', padding: '0.6rem 0.8rem',
    border: '1px solid #d1d5db', borderRadius: '8px',
    fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
    background: '#fff', fontFamily: 'inherit',
  },
  actions: {
    display: 'flex', gap: '0.75rem', marginTop: '1.5rem',
  },
  cancelBtn: {
    flex: 1, padding: '0.7rem',
    background: '#f3f4f6', color: '#374151',
    border: 'none', borderRadius: '8px',
    fontWeight: '600', cursor: 'pointer',
  },
  submitBtn: {
    flex: 1, padding: '0.7rem',
    background: '#2563eb', color: '#fff',
    border: 'none', borderRadius: '8px',
    fontWeight: '600', cursor: 'pointer',
  },
  submitBtnDisabled: {
    flex: 1, padding: '0.7rem',
    background: '#93c5fd', color: '#fff',
    border: 'none', borderRadius: '8px',
    fontWeight: '600', cursor: 'not-allowed',
  },
}

export default SubmitRequestModal