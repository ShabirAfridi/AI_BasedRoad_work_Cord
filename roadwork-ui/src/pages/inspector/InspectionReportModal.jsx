// Inspector fills this in on site: before/after photos (live camera), GPS and verdict
import { useState, useEffect } from 'react'
import CameraCapture from '../../components/CameraCapture'
import { uploadPhoto } from '../../api/uploadApi'
import { submitInspectionReport } from '../../api/inspectionApi'

function InspectionReportModal({ request, onClose, onSuccess }) {
    const [before, setBefore] = useState(null)
    const [after, setAfter] = useState(null)
    const [status, setStatus] = useState('RESTORED')
    const [remarks, setRemarks] = useState('')
    const [coords, setCoords] = useState(null)
    const [geoError, setGeoError] = useState(
        () => (navigator.geolocation ? '' : 'Location is not supported in this browser')
    )
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    // Geo-tag: read the inspector's position as soon as the form opens
    useEffect(() => {
        if (!navigator.geolocation) return
        navigator.geolocation.getCurrentPosition(
            (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => setGeoError('Could not get your location. Please allow location access.'),
            { enableHighAccuracy: true, timeout: 15000 }
        )
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!before || !after) {
            setError('Please capture both the before and the after photo')
            return
        }
        if (!coords) {
            setError('Location is required for the report')
            return
        }

        setLoading(true)
        try {
            const b = await uploadPhoto(before)
            const a = await uploadPhoto(after)

            await submitInspectionReport({
                workRequestId: request.id,
                beforePhotoUrl: b.data.data.url,
                afterPhotoUrl: a.data.data.url,
                latitude: coords.lat,
                longitude: coords.lng,
                restorationStatus: status,
                remarks,
            })
            onSuccess()
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit report')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={s.overlay} onClick={onClose}>
            <div style={s.modal} onClick={(e) => e.stopPropagation()}>
                <div style={s.header}>
                    <div>
                        <h3 style={s.title}>Inspection Report</h3>
                        <div style={s.sub}>{request.roadSegmentName} · {request.departmentName}</div>
                    </div>
                    <button style={s.closeBtn} onClick={onClose}>✕</button>
                </div>

                {error && <div style={s.error}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={s.field}>
                        <label style={s.label}>Before photo (live camera)</label>
                        <CameraCapture onCapture={setBefore} />
                    </div>

                    <div style={s.field}>
                        <label style={s.label}>After photo (live camera)</label>
                        <CameraCapture onCapture={setAfter} />
                    </div>

                    <div style={s.field}>
                        <label style={s.label}>Location</label>
                        {coords ? (
                            <div style={s.ok}>📍 {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}</div>
                        ) : geoError ? (
                            <div style={s.error}>{geoError}</div>
                        ) : (
                            <div style={s.muted}>Getting your location...</div>
                        )}
                    </div>

                    <div style={s.field}>
                        <label style={s.label}>Is the road restored?</label>
                        <select style={s.input} value={status} onChange={(e) => setStatus(e.target.value)}>
                            <option value="RESTORED">Restored</option>
                            <option value="PARTIALLY_RESTORED">Partially restored</option>
                            <option value="NOT_RESTORED">Not restored</option>
                        </select>
                    </div>

                    <div style={s.field}>
                        <label style={s.label}>Remarks</label>
                        <textarea
                            style={{ ...s.input, minHeight: '80px', resize: 'vertical' }}
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            placeholder="Condition of the road, issues found..."
                        />
                    </div>

                    <div style={s.actions}>
                        <button type="button" style={s.cancelBtn} onClick={onClose}>Cancel</button>
                        <button type="submit" style={loading ? s.submitDisabled : s.submitBtn} disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Report'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

const s = {
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' },
    modal: { background: '#fff', borderRadius: '12px', padding: '1.75rem', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' },
    title: { fontSize: '1.2rem', fontWeight: '700', color: '#1a1a2e', margin: 0 },
    sub: { fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem' },
    closeBtn: { background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#6b7280' },
    error: { background: '#fee2e2', color: '#991b1b', padding: '0.6rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' },
    ok: { background: '#d1fae5', color: '#065f46', padding: '0.6rem 1rem', borderRadius: '8px', fontSize: '0.85rem' },
    muted: { color: '#6b7280', fontSize: '0.85rem' },
    field: { marginBottom: '1rem' },
    label: { display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', fontWeight: '500', color: '#374151' },
    input: { width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', background: '#fff', fontFamily: 'inherit' },
    actions: { display: 'flex', gap: '0.75rem', marginTop: '1.5rem' },
    cancelBtn: { flex: 1, padding: '0.7rem', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
    submitBtn: { flex: 1, padding: '0.7rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
    submitDisabled: { flex: 1, padding: '0.7rem', background: '#93c5fd', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'not-allowed' },
}

export default InspectionReportModal