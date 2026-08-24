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
    const [addForm, setAddForm] = useState({ skillId: '', importanceLevel: 'CORE', requiredProficiency: 3 })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        Promise.all([getAdminCareers(), getAdminSkills()])
            .then(([c, s]) => { setCareers(c); setSkills(s) })
            .catch(() => setError('Failed to load data'))
    }, [])

    const loadCareerSkills = id => {
        setLoading(true)
        getCareerSkills(id)
            .then(setCareerSkills)
            .catch(() => setError('Failed to load career skills'))
            .finally(() => setLoading(false))
    }

    const handleCareerChange = id => {
        setSelectedCareer(id)
        if (id) loadCareerSkills(id)
        else setCareerSkills([])
    }

    const handleAdd = async e => {
        e.preventDefault()
        if (!selectedCareer || !addForm.skillId) return
        setSaving(true)
        try {
            await addCareerSkill(selectedCareer, {
                skillId: Number(addForm.skillId),
                importanceLevel: addForm.importanceLevel,
                requiredProficiency: Number(addForm.requiredProficiency),
            })
            loadCareerSkills(selectedCareer)
            setAddForm(f => ({ ...f, skillId: '' }))
        } catch { setError('Failed to add skill') }
        finally { setSaving(false) }
    }

    const handleRemove = async skillId => {
        if (!window.confirm('Remove this skill from the career?')) return
        try {
            await removeCareerSkill(selectedCareer, skillId)
            loadCareerSkills(selectedCareer)
        } catch { setError('Remove failed') }
    }

    const selectedCareerName = careers.find(c => String(c.id) === String(selectedCareer))?.name || ''

    return (
        <div>
            <div className="admin-page-header">
                <div>
                    <h1>Career Skills</h1>
                    <p>Map skills to careers with importance levels and proficiency requirements</p>
                </div>
            </div>

            {error && <div className="admin-error">{error}</div>}

            <div className="admin-field" style={{ maxWidth: 400, marginBottom: '2rem' }}>
                <label>Select Career</label>
                <select value={selectedCareer} onChange={e => handleCareerChange(e.target.value)}>
                    <option value="">— Choose a career —</option>
                    {careers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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
                            <div className="admin-field" style={{ flex: 2, minWidth: 180 }}>
                                <label>Skill</label>
                                <select required value={addForm.skillId} onChange={e => setAddForm(f => ({ ...f, skillId: e.target.value }))}>
                                    <option value="">— Select skill —</option>
                                    {skills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
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
                                <input type="number" min={1} max={5} value={addForm.requiredProficiency}
                                    onChange={e => setAddForm(f => ({ ...f, requiredProficiency: e.target.value }))} />
                            </div>
                            <button type="submit" className="admin-btn admin-btn--primary" disabled={saving} style={{ marginBottom: '1.25rem' }}>
                                {saving ? 'Adding…' : '+ Add'}
                            </button>
                        </form>
                    </div>

                    {/* Skills table */}
                    {loading ? (
                        <div className="admin-loading">Loading…</div>
                    ) : careerSkills.length === 0 ? (
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
                                    {careerSkills.map(cs => (
                                        <tr key={cs.skillId || cs.id}>
                                            <td><strong>{cs.skillName || cs.name}</strong></td>
                                            <td>{cs.skillCategory || cs.category || '—'}</td>
                                            <td>
                                                <span className={`admin-badge ${
                                                    cs.importanceLevel === 'CORE' ? 'admin-badge--green' :
                                                    cs.importanceLevel === 'IMPORTANT' ? 'admin-badge--blue' :
                                                    'admin-badge--orange'
                                                }`}>{cs.importanceLevel}</span>
                                            </td>
                                            <td>{cs.requiredProficiency} / 5</td>
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
