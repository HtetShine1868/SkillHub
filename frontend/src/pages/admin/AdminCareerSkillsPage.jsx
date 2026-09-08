import { useEffect, useState } from 'react'
import {
    getAdminCareers,
    getAdminSkills,
    getCareerSkills,
    addCareerSkill,
    removeCareerSkill,
} from '../../services/adminService'

export default function AdminCareerSkillsPage() {
    const [careers, setCareers] = useState([])
    const [skills, setSkills] = useState([])
    const [selectedCareer, setSelectedCareer] = useState('')
    const [careerSkills, setCareerSkills] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [addForm, setAddForm] = useState({ skillId: '', importanceLevel: 'CORE', requiredProficiency: 3 })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        Promise.all([getAdminCareers(), getAdminSkills()])
            .then(([c, s]) => {
                setCareers(Array.isArray(c) ? c : [])
                setSkills(Array.isArray(s) ? s : [])
            })
            .catch(() => setError('Failed to load careers and skills data'))
    }, [])

    const loadCareerSkills = id => {
        setLoading(true)
        setError('')
        getCareerSkills(id)
            .then(res => setCareerSkills(Array.isArray(res) ? res : []))
            .catch(() => setError('Failed to load career skills'))
            .finally(() => setLoading(false))
    }

    const handleCareerChange = id => {
        setSelectedCareer(id)
        setError('')
        setSuccess('')
        setAddForm({ skillId: '', importanceLevel: 'CORE', requiredProficiency: 3 })
        if (id) loadCareerSkills(id)
        else setCareerSkills([])
    }

    const safeCareers = Array.isArray(careers) ? careers : []
    const safeSkills = Array.isArray(skills) ? skills : []
    const safeCareerSkills = Array.isArray(careerSkills) ? careerSkills : []

    // Filter available skills that are NOT already mapped to the selected career
    const alreadyMappedSkillIds = new Set(
        safeCareerSkills.map(cs => Number(cs.skillId || cs.id)).filter(Boolean)
    )
    const availableSkills = safeSkills.filter(s => !alreadyMappedSkillIds.has(Number(s.id)))

    const handleAdd = async e => {
        e.preventDefault()
        setError('')
        setSuccess('')
        if (!selectedCareer || !addForm.skillId) return

        const targetSkillId = Number(addForm.skillId)

        // Prevent duplicate mapping
        if (alreadyMappedSkillIds.has(targetSkillId)) {
            const skillObj = safeSkills.find(s => Number(s.id) === targetSkillId)
            setError(`"${skillObj?.name || 'Skill'}" is already mapped to this career. Duplicate mappings are not allowed.`)
            return
        }

        setSaving(true)
        try {
            await addCareerSkill(selectedCareer, {
                skillId: targetSkillId,
                importanceLevel: addForm.importanceLevel,
                requiredProficiency: Number(addForm.requiredProficiency),
            })
            setSuccess('Skill mapped successfully!')
            setTimeout(() => setSuccess(''), 3000)
            loadCareerSkills(selectedCareer)
            setAddForm(f => ({ ...f, skillId: '' }))
        } catch {
            setError('Failed to add skill to career')
        } finally {
            setSaving(false)
        }
    }

    const handleRemove = async skillId => {
        if (!window.confirm('Remove this skill from the career?')) return
        setError('')
        setSuccess('')
        try {
            await removeCareerSkill(selectedCareer, skillId)
            loadCareerSkills(selectedCareer)
        } catch {
            setError('Failed to remove skill mapping')
        }
    }

    const selectedCareerName = safeCareers.find(c => String(c.id) === String(selectedCareer))?.name || ''

    return (
        <div>
            <div className="admin-page-header">
                <div>
                    <h1>Career Skills</h1>
                    <p>Map skills to careers with importance levels and proficiency requirements</p>
                </div>
            </div>

            {error && <div className="admin-error" style={{ marginBottom: '1rem' }}>{error}</div>}
            {success && <div className="admin-badge admin-badge--green" style={{ display: 'inline-block', marginBottom: '1rem', padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>{success}</div>}

            <div className="admin-field" style={{ maxWidth: 400, marginBottom: '2rem' }}>
                <label>Select Career</label>
                <select value={selectedCareer} onChange={e => handleCareerChange(e.target.value)}>
                    <option value="">— Choose a career —</option>
                    {safeCareers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>

            {selectedCareer && (
                <>
                    {/* Add skill form */}
                    <div className="admin-table-wrap" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
                        <h3 style={{ color: '#f0f2ff', fontSize: '1rem', marginBottom: '1rem' }}>
                            Add Skill to <em>{selectedCareerName}</em>
                        </h3>
                        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                            <div className="admin-field" style={{ flex: 2, minWidth: 200 }}>
                                <label>Skill</label>
                                <select
                                    required
                                    value={addForm.skillId}
                                    onChange={e => {
                                        setError('')
                                        setAddForm(f => ({ ...f, skillId: e.target.value }))
                                    }}
                                >
                                    <option value="">— Select unmapped skill ({availableSkills.length} available) —</option>
                                    {availableSkills.map(s => (
                                        <option key={s.id} value={s.id}>
                                            {s.name} {s.category ? `(${s.category})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="admin-field" style={{ flex: 1, minWidth: 140 }}>
                                <label>Importance</label>
                                <select value={addForm.importanceLevel} onChange={e => setAddForm(f => ({ ...f, importanceLevel: e.target.value }))}>
                                    <option value="CORE">Core</option>
                                    <option value="IMPORTANT">Important</option>
                                    <option value="NICE_TO_HAVE">Nice to Have</option>
                                </select>
                            </div>
                            <div className="admin-field" style={{ flex: 1, minWidth: 120 }}>
                                <label>Proficiency (1-5)</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={5}
                                    value={addForm.requiredProficiency}
                                    onChange={e => setAddForm(f => ({ ...f, requiredProficiency: e.target.value }))}
                                />
                            </div>
                            <button
                                type="submit"
                                className="admin-btn admin-btn--primary"
                                disabled={saving || availableSkills.length === 0}
                                style={{ marginBottom: '1.25rem' }}
                            >
                                {saving ? 'Adding…' : '+ Add'}
                            </button>
                        </form>
                        {availableSkills.length === 0 && safeSkills.length > 0 && (
                            <div style={{ color: 'var(--f-text-muted)', fontSize: '0.82rem', marginTop: '0.5rem' }}>
                                All available skills are currently mapped to this career.
                            </div>
                        )}
                    </div>

                    {/* Skills table */}
                    {loading ? (
                        <div className="admin-loading">Loading…</div>
                    ) : safeCareerSkills.length === 0 ? (
                        <div className="admin-empty">
                            <div className="admin-empty-icon">🔗</div>
                            <h3>No skills mapped yet</h3>
                            <p>Add skills above to link them to this career.</p>
                        </div>
                    ) : (
                        <div className="admin-table-wrap">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Skill</th>
                                        <th>Category</th>
                                        <th>Importance</th>
                                        <th>Required Proficiency</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {safeCareerSkills.map(cs => (
                                        <tr key={cs.skillId || cs.id}>
                                            <td><strong>{cs.skillName || cs.name}</strong></td>
                                            <td>{cs.skillCategory || cs.category || '—'}</td>
                                            <td>
                                                <span className={`admin-badge ${
                                                    cs.importanceLevel === 'CORE' || (cs.importance && cs.importance >= 0.85) ? 'admin-badge--green' :
                                                    cs.importanceLevel === 'IMPORTANT' || (cs.importance && cs.importance >= 0.65) ? 'admin-badge--blue' :
                                                    'admin-badge--orange'
                                                }`}>
                                                    {cs.importanceLevel || (cs.importance && cs.importance >= 0.85 ? 'CORE' : cs.importance && cs.importance >= 0.65 ? 'IMPORTANT' : 'NICE_TO_HAVE')}
                                                </span>
                                            </td>
                                            <td>{cs.requiredProficiency || cs.requiredLevel || 1} / 5</td>
                                            <td>
                                                <button className="admin-btn admin-btn--sm admin-btn--danger"
                                                    onClick={() => handleRemove(cs.skillId || cs.id)}>
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

