import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

import SelectedCareerCard from '../components/roadmap/SelectedCareerCard'
import Assessment from '../components/roadmap/assessment/Assessment'
import AssessmentResult from '../components/roadmap/results/AssessmentResult'
import SkillGap from '../components/roadmap/gap/SkillGap'
import GenerateRoadmap from '../components/roadmap/generator/GenerateRoadmap'
import PersonalizedRoadmap from '../components/roadmap/roadmap/PersonalizedRoadmap'
import CourseCard from '../components/roadmap/courses/CourseCard'
import CourseDetails from '../components/roadmap/courses/CourseDetails'

// Real API Services
import { getAllCareers, getCareerById, getDiscoveryQuestions, submitDiscoveryAnswers } from '../services/careerService'
import { getAssessmentQuestions, submitAssessment } from '../services/assessmentService'
import { generateRoadmap, getMyRoadmap } from '../services/roadmapService'

import '../styles/roadmap.css'

export default function PersonalizedRoadmapPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const careerIdFromUrl = searchParams.get('careerId')

  // Screens: onboarding -> discover -> careers -> career -> assessment -> results -> gap -> generate -> roadmap -> courses
  const [screen, setScreen] = useState('onboarding')
  
  const [careersList, setCareersList] = useState([])
  const [selectedCareer, setSelectedCareer] = useState(null)
  const [careerSelectMode, setCareerSelectMode] = useState('browse') // 'browse' | 'discovery'

  // Discovery questions
  const [discoveryQuestions, setDiscoveryQuestions] = useState([])
  const [discoveryAnswers, setDiscoveryAnswers] = useState({})
  const [discoveryResults, setDiscoveryResults] = useState([])
  const [discoveryIndex, setDiscoveryIndex] = useState(0)

  // Assessment questions
  const [assessmentQuestionsList, setAssessmentQuestionsList] = useState([])
  const [gradedResults, setGradedResults] = useState(null)

  // Roadmap
  const [roadmapData, setRoadmapData] = useState(null)
  const [isPersonalized, setIsPersonalized] = useState(false)
  const [selectedStage, setSelectedStage] = useState(null)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Load initial careers list & check URL param
  useEffect(() => {
    const fetchCareers = async () => {
      try {
        const data = await getAllCareers();
        setCareersList(data);
      } catch (err) {
        console.error("Failed to fetch careers", err);
      }
    };
    fetchCareers();
  }, []);

  useEffect(() => {
    const isRoadmapPath = typeof window !== 'undefined' && window.location.pathname.includes('/roadmap')
    const userKeyPrefix = user?.id ? `_${user.id}` : ''
    const careerKey = `skillhub_active_career${userKeyPrefix}`
    const roadmapKey = `skillhub_active_roadmap${userKeyPrefix}`

    if (careerIdFromUrl) {
      handleSelectCareer(parseInt(careerIdFromUrl))
    } else {
      try {
        const savedRoadmap = typeof window !== 'undefined' ? localStorage.getItem(roadmapKey) : null
        const savedCareer = typeof window !== 'undefined' ? localStorage.getItem(careerKey) : null
        if (savedCareer) {
          const parsedCareer = JSON.parse(savedCareer)
          setSelectedCareer(parsedCareer)
          if (savedRoadmap) {
            const parsedRoadmap = JSON.parse(savedRoadmap)
            if (parsedRoadmap && (parsedRoadmap.items || parsedRoadmap.careerName)) {
              setRoadmapData(parsedRoadmap)
              setIsPersonalized(true)
              setScreen('roadmap')
            }
          }
          // Always sync live roadmap from backend for accurate progress
          if (parsedCareer.id) {
            getMyRoadmap(parsedCareer.id).then(liveRoadmap => {
              if (liveRoadmap && liveRoadmap.items) {
                setRoadmapData(liveRoadmap)
                setIsPersonalized(true)
                setScreen('roadmap')
                localStorage.setItem(roadmapKey, JSON.stringify(liveRoadmap))
              }
            }).catch(() => {})
          }
        } else if (isRoadmapPath) {
          // If accessing /roadmap directly without prior selection, default to Backend Developer (id: 1)
          getMyRoadmap(1).then(liveRoadmap => {
            if (liveRoadmap && liveRoadmap.items) {
              const defaultCareer = { id: 1, name: 'Backend Developer', title: 'Backend Developer' }
              setSelectedCareer(defaultCareer)
              setRoadmapData(liveRoadmap)
              setIsPersonalized(true)
              setScreen('roadmap')
              localStorage.setItem(careerKey, JSON.stringify(defaultCareer))
              localStorage.setItem(roadmapKey, JSON.stringify(liveRoadmap))
            }
          }).catch(() => {})
        }
      } catch (e) {
        console.error("Error restoring saved roadmap", e)
      }
    }
  }, [careerIdFromUrl, user])

  const handleStartDiscovery = async () => {
    setLoading(true);
    setError(null);
    try {
      const questions = await getDiscoveryQuestions();
      setDiscoveryQuestions(questions || []);
      setDiscoveryAnswers({});
      setDiscoveryIndex(0);
      setScreen('discover');
    } catch (err) {
      setError("Failed to load discovery questions.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDiscoveryOption = (questionId, optionIndex) => {
    setDiscoveryAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleNextDiscovery = async () => {
    const currentQ = discoveryQuestions[discoveryIndex];
    if (discoveryAnswers[currentQ.id] === undefined) return;

    if (discoveryIndex === discoveryQuestions.length - 1) {
      setLoading(true);
      try {
        const results = await submitDiscoveryAnswers(discoveryAnswers);
        const matches = results?.topCareers || results?.results || results || [];
        setDiscoveryResults(matches);
        setScreen('discovery-results');
      } catch (err) {
        setError("Failed to match careers.");
      } finally {
        setLoading(false);
      }
      return;
    }
    setDiscoveryIndex(prev => prev + 1);
  };

  const handleSelectCareer = async (careerId, mode = 'browse') => {
    setLoading(true);
    setError(null);
    try {
      const fullCareer = await getCareerById(careerId);
      const careerObj = {
        id: fullCareer.id,
        title: fullCareer.name,
        category: fullCareer.category,
        icon: fullCareer.icon || '💼',
        description: fullCareer.description,
        responsibilities: fullCareer.responsibilities
          ? (Array.isArray(fullCareer.responsibilities) ? fullCareer.responsibilities : fullCareer.responsibilities.split(';'))
          : [],
        requiredSkills: (fullCareer.requiredSkills || []).map(s => s.skillName || s),
        rawRequiredSkills: fullCareer.requiredSkills || []
      };
      setSelectedCareer(careerObj);
      setCareerSelectMode(mode);
      // Always show career detail screen first — user clicks 'Start Assessment' to proceed
      setScreen('career');
    } catch (err) {
      setError("Failed to load career details.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartAssessment = async () => {
    setLoading(true);
    try {
      const questions = await getAssessmentQuestions(selectedCareer.id);
      
      // Map JSON options to options format expected by the frontend
      const mappedQuestions = questions.map(q => {
        let parsed = [];
        try {
          parsed = JSON.parse(q.optionsJson);
        } catch (e) {
          console.error("Failed to parse optionsJson for question " + q.id, e);
        }
        
        const mappedOptions = parsed.map(opt => ({
          label: opt.optionKey ? `Option ${opt.optionKey}` : opt.label,
          description: opt.text || opt.description,
          value: opt.optionKey ? opt.optionKey : opt.value
        }));

        return {
          id: q.id,
          skill: q.skillName,
          question: q.question,
          type: q.type === 'SELF_REPORTED' ? 'skill-level' : 'experience',
          options: mappedOptions
        };
      });

      setAssessmentQuestionsList(mappedQuestions);
      setScreen('assessment');
    } catch (err) {
      console.error(err);
      setError("Failed to load assessment questions.");
    } finally {
      setLoading(false);
    }
  };

  const handleAssessmentComplete = async (answers) => {
    setLoading(true);
    try {
      // Convert all answer values to string for the API request
      const formattedAnswers = {};
      Object.keys(answers).forEach(k => {
        formattedAnswers[k] = String(answers[k]);
      });

      const results = await submitAssessment(selectedCareer.id, formattedAnswers);
      setGradedResults(results);
      setScreen('results');
    } catch (err) {
      console.error(err);
      setError("Failed to submit assessment.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRoadmap = () => {
    setScreen('generate');
  };

  const handleGenerateRoadmapComplete = async () => {
    try {
      const response = await generateRoadmap(selectedCareer.id);
      setRoadmapData(response);
      setIsPersonalized(true);
      if (typeof window !== 'undefined') {
        const userKeyPrefix = user?.id ? `_${user.id}` : ''
        localStorage.setItem(`skillhub_active_roadmap${userKeyPrefix}`, JSON.stringify(response));
        localStorage.setItem(`skillhub_active_career${userKeyPrefix}`, JSON.stringify(selectedCareer));
      }
      setScreen('roadmap');
    } catch (err) {
      console.error(err);
      setError("Failed to generate personalized roadmap.");
    }
  };

  const handleStageClick = (stage) => {
    if (stage.status === 'locked') return;
    const targetCourseId = stage.id || (stage.courses && stage.courses[0]);
    if (targetCourseId) {
      navigate(`/courses/${targetCourseId}`);
    } else {
      setSelectedStage(stage);
      setScreen('courses');
    }
  };

  const handleCourseClick = (course) => {
    if (course) {
      const targetId = course.courseId || course.id;
      if (targetId) {
        navigate(`/courses/${targetId}`);
      } else {
        setSelectedCourse(course);
      }
    }
  };

  const getMappedGapData = () => {
    if (!gradedResults || !selectedCareer) return [];
    const levelNames = ['None', 'Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Expert'];
    const scoreMap = [0, 20, 40, 60, 80, 100];

    return selectedCareer.rawRequiredSkills.map(cs => {
      const userRes = gradedResults.skillResults.find(r => r.skillId === cs.skillId);
      const currentLevel = userRes ? userRes.level : 0;
      const requiredLevel = cs.requiredLevel;
      const gap = requiredLevel - currentLevel;

      let status = 'complete';
      let message = 'You already meet the required level.';
      if (gap > 0) {
        if (currentLevel === 0) {
          status = 'missing';
          message = 'This is a new skill you need to learn.';
        } else {
          status = 'improve';
          message = `You need to improve your level from ${levelNames[currentLevel]} to ${levelNames[requiredLevel]}.`;
        }
      }

      return {
        id: cs.skillId,
        skill: cs.skillName,
        currentLevel: levelNames[currentLevel],
        currentScore: scoreMap[currentLevel],
        requiredLevel: levelNames[requiredLevel],
        requiredScore: scoreMap[requiredLevel],
        status,
        message
      };
    });
  };

  const getMappedRoadmapStages = () => {
    if (!roadmapData) return [];
    return (roadmapData.items || []).map(item => {
      let status = 'locked';
      const isCompleted = item.status === 'COMPLETED' || (item.progress !== undefined && item.progress >= 100);
      const isInProgress = item.status === 'IN_PROGRESS' || (item.progress !== undefined && item.progress > 0);

      if (isCompleted) {
        status = 'completed';
      } else if (isInProgress) {
        status = 'current';
      } else if (item.status === 'AVAILABLE') {
        status = 'available';
      }

      return {
        id: item.courseId,
        title: item.courseTitle,
        status: status,
        progress: item.progress || (isCompleted ? 100 : 0),
        description: item.reason,
        lockedReason: item.status === 'LOCKED' ? item.reason : null,
        courses: [item.courseId]
      };
    });
  };

  const getMappedRoadmapCourses = () => {
    if (!roadmapData) return [];
    return roadmapData.items.map(item => ({
      id: item.courseId,
      title: item.courseTitle,
      description: item.reason,
      rating: 4.8,
      difficulty: item.courseDifficulty || 'Intermediate',
      duration: `${item.courseDurationHours || 8} hours`,
      lessons: 20,
      skills: item.skills,
      prerequisites: [],
      roadmapSkill: item.skills[0] || '',
      status: item.status.toLowerCase(),
      reason: item.reason
    }));
  };

  return (
    <main className="roadmap-page">
      <div key={screen} className="roadmap-screen-fade">
        {error && (
          <div className="error-toast" onClick={() => setError(null)}>
            <p>{error} (Click to dismiss)</p>
          </div>
        )}

        {/* =====================================
            SCREEN 0.1 — ONBOARDING SELECTION
        ===================================== */}
        {screen === 'onboarding' && (
          <section className="career-screen">
            <div className="screen-background-glow" />
            <div className="career-wrapper">
              <div className="career-intro">
                <span>WELCOME TO SKILLHUB</span>
                <h2>Define Your Career Path</h2>
                <p>Choose how you would like to proceed with your personalized learning journey.</p>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', width: '100%', maxWidth: '680px', margin: '36px auto' }}>
                <div
                  className="career-card"
                  style={{
                    cursor: 'pointer',
                    padding: '32px 28px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '24px',
                    border: '1px solid rgba(124, 58, 237, 0.3)',
                    background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.12), rgba(37, 99, 235, 0.08))',
                    transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)'
                  }}
                  onClick={handleStartDiscovery}
                >
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '18px',
                    background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '32px',
                    boxShadow: '0 8px 24px rgba(124, 58, 237, 0.35)',
                    flexShrink: 0
                  }}>
                    🧭
                  </div>
                  <div style={{ textAlign: 'left', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <h2 style={{ margin: 0, color: '#f0f2ff', fontSize: '1.25rem' }}>Find My Career (AI Discovery)</h2>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#6ee7b7', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '2px 8px', borderRadius: '999px' }}>
                        Recommended
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(200, 210, 240, 0.75)', lineHeight: 1.5 }}>
                      Answer a few guided interest questions to receive tailored AI and data-backed career path matches.
                    </p>
                  </div>
                  <span style={{ fontSize: '1.4rem', color: '#a78bfa', opacity: 0.8 }}>→</span>
                </div>

                <div
                  className="career-card"
                  style={{
                    cursor: 'pointer',
                    padding: '32px 28px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '24px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'rgba(255, 255, 255, 0.04)',
                    transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)'
                  }}
                  onClick={() => setScreen('careers')}
                >
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '18px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '32px',
                    flexShrink: 0
                  }}>
                    🎯
                  </div>
                  <div style={{ textAlign: 'left', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <h2 style={{ margin: 0, color: '#f0f2ff', fontSize: '1.25rem' }}>I Know My Career (Direct Pick)</h2>
                      <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '2px 8px', borderRadius: '999px' }}>
                        Fast Track
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(200, 210, 240, 0.75)', lineHeight: 1.5 }}>
                      Already have a target role in mind? Select from our catalog and generate your roadmap in 1 click.
                    </p>
                  </div>
                  <span style={{ fontSize: '1.4rem', color: 'rgba(200, 210, 240, 0.5)' }}>→</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* =====================================
            SCREEN 0.2 — CAREER LIST BROWSE
        ===================================== */}
        {screen === 'careers' && (
          <section className="career-screen">
            <div className="screen-background-glow" />
            <div className="career-wrapper">
              <div className="career-intro">
                <span>CAREERS</span>
                <h2>Select your goal.</h2>
                <p>Choose the career path you want to build a personalized roadmap for.</p>
                <button className="back-to-career" style={{ marginTop: '20px' }} onClick={() => setScreen('onboarding')}>← Back</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', width: '100%', maxWidth: '1000px', margin: '40px auto' }}>
                {careersList.map(c => (
                  <div className="career-card" key={c.id} style={{ cursor: 'pointer', padding: '30px' }} onClick={() => handleSelectCareer(c.id, 'browse')}>
                    <div style={{ fontSize: '32px', marginBottom: '16px' }}>{c.icon || '💼'}</div>
                    <span className="career-badge" style={{ marginBottom: '8px', display: 'inline-block' }}>{c.category}</span>
                    <h3>{c.name}</h3>
                    <p style={{ fontSize: '14px', marginTop: '10px' }}>{c.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* =====================================
            SCREEN 0.3 — DISCOVERY QUESTIONS
        ===================================== */}
        {screen === 'discover' && discoveryQuestions.length > 0 && (
          <section className="assessment-screen">
            <div className="assessment-background-glow" />
            <div className="assessment-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <button className="back-to-career" style={{ margin: 0 }} onClick={() => setScreen('onboarding')}>← Back</button>
                <button
                  type="button"
                  className="quick-skip-btn"
                  onClick={() => setScreen('careers')}
                >
                  🎯 I know my career (Browse all) →
                </button>
              </div>

              <div className="assessment-title">
                <span>CAREER DISCOVERY</span>
                <h2>Find Your Perfect Tech Role</h2>
                <div className="assessment-step-badge" style={{ display: 'inline-block', marginTop: '8px' }}>
                  ✨ Question {discoveryIndex + 1} of {discoveryQuestions.length}
                </div>
              </div>

              <div className="progress-track" style={{ marginTop: '16px', maxWidth: '760px' }}>
                <div
                  className="progress-fill"
                  style={{ width: `${((discoveryIndex + 1) / discoveryQuestions.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="assessment-container">
              <div className="question-card">
                <h1>{discoveryQuestions[discoveryIndex].question}</h1>
                <p className="question-subtitle">Select the answer that aligns closest with your passion and goals.</p>

                <div className="assessment-options">
                  {discoveryQuestions[discoveryIndex].options.map((opt, i) => {
                    const letters = ['A', 'B', 'C', 'D', 'E']
                    const isSelected = discoveryAnswers[discoveryQuestions[discoveryIndex].id] === i
                    return (
                      <button
                        type="button"
                        key={i}
                        className={`assessment-option ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleSelectDiscoveryOption(discoveryQuestions[discoveryIndex].id, i)}
                      >
                        <div className="option-letter-badge">
                          {letters[i % letters.length]}
                        </div>
                        <div className="option-content">
                          <strong className="option-title">{opt.label}</strong>
                          {opt.description && <p className="option-desc">{opt.description}</p>}
                        </div>
                        <div className={`option-check-circle ${isSelected ? 'option-check-circle--active' : ''}`}>
                          {isSelected ? '✓' : ''}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="assessment-navigation" style={{ marginTop: '24px' }}>
                <button className="secondary-button" onClick={() => {
                  if (discoveryIndex === 0) setScreen('onboarding');
                  else setDiscoveryIndex(prev => prev - 1);
                }}>← Previous</button>
                <button
                  className="primary-button"
                  disabled={discoveryAnswers[discoveryQuestions[discoveryIndex].id] === undefined}
                  onClick={handleNextDiscovery}
                >
                  {discoveryIndex === discoveryQuestions.length - 1 ? '🎯 Show My Career Matches' : 'Next Question'} →
                </button>
              </div>
            </div>
          </section>
        )}

        {/* =====================================
            SCREEN 0.4 — DISCOVERY MATCH RESULTS
        ===================================== */}
        {screen === 'discovery-results' && (
          <section className="career-screen">
            <div className="screen-background-glow" />
            <div className="career-wrapper">
              <div className="career-intro">
                <span>DISCOVERY RESULTS</span>
                <h2>Your Top Career Matches</h2>
                <p>Based on your answers, these paths match your strengths and interests best:</p>
                <button className="back-to-career" style={{ marginTop: '20px' }} onClick={() => setScreen('onboarding')}>← Start Over</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', width: '100%', maxWidth: '1000px', margin: '40px auto' }}>
                {discoveryResults.map(res => (
                  <div className="career-card" key={res.careerId} style={{ cursor: 'pointer', padding: '30px' }} onClick={() => handleSelectCareer(res.careerId, 'discovery')}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div style={{ fontSize: '32px' }}>{res.careerIcon || '💼'}</div>
                      <span className="career-match" style={{ color: 'var(--accent)', background: 'var(--accent-bg)', padding: '4px 10px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>
                        {res.matchPercentage}% Match
                      </span>
                    </div>
                    <span className="career-badge" style={{ marginBottom: '8px', display: 'inline-block' }}>{res.careerCategory}</span>
                    <h3>{res.careerName}</h3>
                    <p style={{ fontSize: '14px', marginTop: '10px' }}>{res.careerDescription}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* =====================================
            SCREEN 1 — SELECTED CAREER DETAIL
        ===================================== */}
        {screen === 'career' && selectedCareer && (
          <section className="career-screen">
            <div className="screen-background-glow" />
            <div className="career-wrapper">
              <div className="career-intro">
                <span>SELECTED PATH</span>
                <h2>Let's build your path.</h2>
                <p>Review your selected career and begin the skill assessment, or skip directly to your roadmap.</p>
                <button className="back-to-career" style={{ marginTop: '20px' }} onClick={() => setScreen(careerSelectMode === 'discovery' ? 'discovery-results' : 'careers')}>← Select Different Career</button>
              </div>
              <SelectedCareerCard
                career={selectedCareer}
                onStart={handleStartAssessment}
                onSkip={handleGenerateRoadmap}
              />
            </div>
          </section>
        )}

        {/* =====================================
            SCREEN 2 — ASSESSMENT QUESTIONS
        ===================================== */}
        {screen === 'assessment' && assessmentQuestionsList.length > 0 && (
          <section className="assessment-screen">
            <div className="assessment-background-glow" />
            <div className="assessment-header">
              <button className="back-to-career" onClick={() => setScreen('career')}>← {selectedCareer?.title}</button>
              <div className="assessment-title">
                <span>SKILL ASSESSMENT</span>
                <h2>Verify Your Skills</h2>
                <p>Help us customize your path by answering these quick questions, or skip to auto-generate.</p>
              </div>
            </div>
            <Assessment
              questions={assessmentQuestionsList}
              onComplete={handleAssessmentComplete}
              onBack={() => setScreen('career')}
              onSkip={handleGenerateRoadmap}
            />
          </section>
        )}

        {/* =====================================
            SCREEN 3 — RESULTS
        ===================================== */}
        {screen === 'results' && gradedResults && (
          <AssessmentResult
            answers={gradedResults.skillResults.reduce((acc, res) => ({ ...acc, [res.skillId]: Math.max(1, Math.min(4, res.level)) }), {})}
            questions={gradedResults.skillResults.map(res => ({ id: res.skillId, skill: res.skillName }))}
            career={selectedCareer}
            onContinue={() => setScreen('gap')}
          />
        )}

        {/* =====================================
            SCREEN 4 — SKILL GAP
        ===================================== */}
        {screen === 'gap' && gradedResults && (
          <SkillGap
            gapData={getMappedGapData()}
            career={selectedCareer}
            onBack={() => setScreen('results')}
            onContinue={() => setScreen('generate')}
          />
        )}

        {/* =====================================
            SCREEN 5 — GENERATE ROADMAP (LOADER)
        ===================================== */}
        {screen === 'generate' && (
          <GenerateRoadmap
            career={selectedCareer}
            onComplete={handleGenerateRoadmapComplete}
          />
        )}

        {/* =====================================
            SCREEN 6 — ROADMAP PATH
        ===================================== */}
        {screen === 'roadmap' && roadmapData && (
          <div style={{ position: 'relative', width: '100%' }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto 20px', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                className="back-to-career"
                onClick={() => setScreen('onboarding')}
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#cbd5e1', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
              >
                ← Choose Different Career
              </button>
              <span style={{ fontSize: '13px', color: isPersonalized ? '#4ade80' : '#a78bfa', fontWeight: '600' }}>
                {isPersonalized ? '✓ Personalized Roadmap' : '📋 Standard Roadmap'}
              </span>
            </div>

            {!isPersonalized && (
              <div style={{
                maxWidth: '1050px',
                margin: '0 auto 24px',
                padding: '20px 24px',
                background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(37, 99, 235, 0.2))',
                border: '1px solid rgba(167, 139, 250, 0.4)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '18px' }}>⚡</span>
                    <strong style={{ fontSize: '16px', color: '#f8fafc' }}>This is the standard roadmap for {selectedCareer?.title}</strong>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#cbd5e1' }}>
                    Take a 3-minute Skill Assessment to customize this path and skip courses for skills you already have.
                  </p>
                </div>
                <button
                  id="btn-personalize-roadmap"
                  style={{
                    padding: '12px 22px',
                    background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#ffffff',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 4px 15px rgba(124, 58, 237, 0.4)',
                    transition: 'transform 0.2s'
                  }}
                  onClick={handleStartAssessment}
                >
                  Personalize Roadmap ✨
                </button>
              </div>
            )}

            {/* Start Learning & Go to My Roadmap Banner */}
            <div style={{
              maxWidth: '1050px',
              margin: '0 auto 24px',
              padding: '20px 24px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(124, 58, 237, 0.2))',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '20px' }}>🚀</span>
                  <strong style={{ fontSize: '17px', color: '#f8fafc' }}>Roadmap Generated & Ready!</strong>
                </div>
                <p style={{ margin: 0, fontSize: '14px', color: '#cbd5e1' }}>
                  Your learning queue has been generated with {roadmapData?.items?.length || 5} course milestones.
                </p>
              </div>
              <button
                id="btn-start-learning-queue"
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '14px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
                  transition: 'transform 0.2s'
                }}
                onClick={() => {
                  const firstCourseId = (roadmapData?.items && roadmapData.items.length > 0)
                    ? roadmapData.items[0].courseId
                    : 1;
                  navigate(`/courses/${firstCourseId}`);
                }}
              >
                Start Learning Queue →
              </button>
            </div>

            <PersonalizedRoadmap
              career={selectedCareer}
              stages={getMappedRoadmapStages()}
              onStageClick={handleStageClick}
            />
          </div>
        )}

        {/* =====================================
            SCREEN 7 — COURSES LIST IN STAGE
        ===================================== */}
        {screen === 'courses' && (
          <section className="courses-screen">
            <div className="courses-container">
              <button className="courses-back" onClick={() => {
                setSelectedStage(null)
                setScreen('roadmap')
              }}>← Back to Roadmap</button>

              <div className="courses-header">
                <span>ROADMAP MILESTONE</span>
                <h1>{selectedStage?.title}</h1>
                <p>{selectedStage?.description}</p>
              </div>

              <div className="courses-divider">
                <div>
                  <span>RECOMMENDED COURSE</span>
                  <h2>Build this skill</h2>
                </div>
              </div>

              <div className="courses-grid">
                {getMappedRoadmapCourses()
                  .filter(c => selectedStage.courses.includes(c.id))
                  .map(course => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      onView={handleCourseClick}
                    />
                  ))}
              </div>
            </div>
          </section>
        )}

        {/* =====================================
            SCREEN 8 — COURSE DETAILS
        ===================================== */}
        {selectedCourse && (
          <CourseDetails
            course={selectedCourse}
            onClose={() => setSelectedCourse(null)}
          />
        )}
      </div>
    </main>
  )
}