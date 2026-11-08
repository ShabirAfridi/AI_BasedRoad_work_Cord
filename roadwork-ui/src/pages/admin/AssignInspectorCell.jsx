import { useState } from 'react'
import { assignInspector } from '../../api/inspectionApi'

const ASSIGNABLE = ['APPROVED', 'IN_PROGRESS', 'COMPLETED']

function AssignInspectorCell({ request, inspectors, onAssigned }) {
    const [saving, setSaving] = useState(false)

    if (!ASSIGNABLE.includes(request.status)) {
        return <span style={{ color: '#9ca3af' }}>—</span>
    }

    const handleChange = async (e) => {
        const inspectorId = e.target.value
        if (!inspectorId) return
        setSaving(true)
        try {
            await assignInspector(request.id, parseInt(inspectorId))
            onAssigned()
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to assign inspector')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div>
            {request.inspectorName && (
                <div style={{ fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                    {request.inspectorName}
                </div>
            )}
            <select
                value=""
                onChange={handleChange}
                disabled={saving || inspectors.length === 0}
                style={{ padding: '0.3rem 0.5rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.78rem' }}
            >
                <option value="">
                    {inspectors.length === 0 ? 'No inspectors' : request.inspectorName ? 'Change...' : 'Assign...'}
                </option>
                {inspectors.map(i => (
                    <option key={i.id} value={i.id}>{i.fullName}</option>
                ))}
            </select>
        </div>
    )
}

export default AssignInspectorCell