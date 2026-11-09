
import { useState } from 'react'
import { predictDelay } from '../api/aiApi'

const RISK_STYLES = {
  LOW:    { bg: '#d1fae5', color: '#065f46', label: 'Low Risk' },
  MEDIUM: { bg: '#fef3c7', color: '#92400e', label: 'Medium Risk' },
  HIGH:   { bg: '#fee2e2', color: '#991b1b', label: 'High Risk' },
}

function DelayPredictionPanel({ workType, plannedDurationDays, priority }) {
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [opened, setOpened]   = useState(false)

  const runPrediction = async () => {
    setOpened(true)
    setLoading(true)
    setError('')
    try {
      const res = await predictDelay(workType, plannedDurationDays, priority)
      setResult(res.data.data)
    } catch (err) {
      setError(err.response?.data?.message || 'AI prediction unavailable')
    } finally {
      setLoading(false)
    }
  }

  if (!opened) {
    return (
      <button style={styles.triggerBtn} onClick={runPrediction}>
        AI Delay Prediction
      </button>
    )
  }

  return (
    <div style={styles.panel}>
      {loading && (
        <div style={styles.loading}>
          <span style={styles.spinner} />
          Analyzing with AI... (first call may take up to 30s)
        </div>
      )}

      {error && <div style={styles.error}>{error}</div>}

      {result && (
        <div style={{
          ...styles.resultBox,
          background: (RISK_STYLES[result.riskLevel] || RISK_STYLES.MEDIUM).bg,
        }}>
          <div style={styles.resultHeader}>
            <span style={{
              ...styles.riskBadge,
              color: (RISK_STYLES[result.riskLevel] || RISK_STYLES.MEDIUM).color,
            }}>
              {(RISK_STYLES[result.riskLevel] || RISK_STYLES.MEDIUM).label}
            </span>
            <span style={styles.estimatedDays}>
              ~{result.estimatedDays} days estimated
            </span>
          </div>
          <p style={styles.reasoning}>{result.reasoning}</p>
        </div>
      )}
    </div>
  )
}

const styles = {
  triggerBtn: {
    padding: '4px 10px', background: '#EEF2FF', color: '#4338CA',
    border: '1px solid #C7D2FE', borderRadius: '6px',
    fontSize: '11px', fontWeight: '600', cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: '4px',
  },
  panel: { marginTop: '6px', minWidth: '220px' },
  loading: {
    display: 'flex', alignItems: 'center', gap: '8px',
    fontSize: '12px', color: '#6b7280', padding: '6px 0',
  },
  spinner: {
    width: '12px', height: '12px', borderRadius: '50%',
    border: '2px solid #e5e7eb', borderTopColor: '#4338CA',
    display: 'inline-block',
  },
  error: {
    fontSize: '11px', color: '#991b1b',
    background: '#fee2e2', padding: '6px 10px', borderRadius: '6px',
  },
  resultBox: { borderRadius: '8px', padding: '10px 12px' },
  resultHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '4px',
  },
  riskBadge: { fontSize: '11px', fontWeight: '700' },
  estimatedDays: { fontSize: '11px', fontWeight: '600', color: '#374151' },
  reasoning: { fontSize: '11px', color: '#4b5563', margin: 0, lineHeight: 1.4 },
}

export default DelayPredictionPanel
