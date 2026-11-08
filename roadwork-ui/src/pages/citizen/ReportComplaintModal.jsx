
import { useState } from 'react'
import { submitComplaint } from '../../api/complaintApi'
import CameraCapture from '../../components/CameraCapture'
import { uploadPhoto } from '../../api/uploadApi'

const CATEGORIES = [
  { value: 'ILLEGAL_DIGGING',      label: 'Illegal Digging (no permit)' },
  { value: 'ROAD_DAMAGE',          label: 'Road Left Damaged' },
  { value: 'DELAY',                label: 'Work Taking Too Long' },
  { value: 'NOISE_OR_DISRUPTION',  label: 'Noise / Disruption' },
  { value: 'OTHER',                label: 'Other' },
]

function ReportComplaintModal({ roadSegments, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    roadSegmentId: '',
    category: 'ILLEGAL_DIGGING',
    description: '',
  })
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [photo, setPhoto] = useState(null)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.description.trim()) {
      setError('Please describe the issue')
      return
    }

    setLoading(true)
    try {
      let photoUrl = null
      if (photo) {
        const up = await uploadPhoto(photo)
        photoUrl = up.data.data.url
      }
      const payload = {
        ...formData,
        roadSegmentId: formData.roadSegmentId ? parseInt(formData.roadSegmentId) : null,
        photoUrl,
      }
      await submitComplaint(payload)
      setSuccess(true)
      setTimeout(() => onSuccess(), 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit report')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>

        {success ? (
          <div style={styles.successBox}>
            <div style={styles.successIcon}>OK</div>
            <h3 style={styles.successTitle}>Report Submitted</h3>
            <p style={styles.successText}>
              Thank you. The road authority has been notified and will review your report.
            </p>
          </div>
        ) : (
          <>
            <div style={styles.header}>
              <div>
                <h3 style={styles.title}>Report an Issue</h3>
                <p style={styles.subtitle}>
                  Report unauthorized digging, road damage, or delays — no account required
                </p>
              </div>
              <button style={styles.closeBtn} onClick={onClose}>close</button>
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <form onSubmit={handleSubmit}>

              <div style={styles.field}>
                <label style={styles.label}>Road Segment (optional)</label>
                <select
                  style={styles.input}
                  name="roadSegmentId"
                  value={formData.roadSegmentId}
                  onChange={handleChange}
                >
                  <option value="">Not sure / not listed</option>
                  {roadSegments.map(seg => (
                    <option key={seg.id} value={seg.id}>
                      {seg.name} - {seg.city}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Issue Type</label>
                <select
                  style={styles.input}
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Description</label>
                <textarea
                  style={{ ...styles.input, minHeight: '100px', resize: 'vertical' }}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe what you observed - location details help..."
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Photo (taken live with camera)</label>
                <CameraCapture onCapture={setPhoto} />
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
                  {loading ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    padding: '1rem',
  },
  modal: {
    background: '#fff', borderRadius: '12px', padding: '1.75rem',
    width: '100%', maxWidth: '460px', maxHeight: '90vh', overflowY: 'auto',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: '1.25rem', gap: '0.75rem',
  },
  title: { fontSize: '1.15rem', fontWeight: '700', color: '#1a1a2e', margin: 0 },
  subtitle: { fontSize: '0.8rem', color: '#6b7280', marginTop: '0.3rem', lineHeight: 1.4 },
  closeBtn: {
    background: 'none', border: 'none', fontSize: '0.8rem',
    cursor: 'pointer', color: '#6b7280', flexShrink: 0,
  },
  error: {
    background: '#fee2e2', color: '#991b1b', padding: '0.65rem 1rem',
    borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem',
  },
  field: { marginBottom: '1rem' },
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
  actions: { display: 'flex', gap: '0.75rem', marginTop: '1.5rem' },
  cancelBtn: {
    flex: 1, padding: '0.7rem', background: '#f3f4f6', color: '#374151',
    border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer',
  },
  submitBtn: {
    flex: 1, padding: '0.7rem', background: '#dc2626', color: '#fff',
    border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer',
  },
  submitBtnDisabled: {
    flex: 1, padding: '0.7rem', background: '#fca5a5', color: '#fff',
    border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'not-allowed',
  },
  successBox: { textAlign: 'center', padding: '1.5rem 0.5rem' },
  successIcon: {
    width: '52px', height: '52px', borderRadius: '50%',
    background: '#d1fae5', color: '#065f46',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.95rem', fontWeight: '700', margin: '0 auto 1rem',
  },
  successTitle: { fontSize: '1.1rem', fontWeight: '700', color: '#1a1a2e', marginBottom: '0.5rem' },
  successText: { fontSize: '0.85rem', color: '#6b7280', lineHeight: 1.5 },
}

export default ReportComplaintModal