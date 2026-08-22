import { useState, useEffect } from 'react'

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
  // Screens: onboarding -> discover -> careers -> career -> assessment -> results -> gap -> generate -> roadmap -> courses
  const [screen, setScreen] = useState('onboarding')
  
  const [careersList, setCareersList] = useState([])
  const [selectedCareer, setSelectedCareer] = useState(null)
  
  // Discovery questions
  const [discoveryQuestions, setDiscoveryQuestions] = useState([])
  const [discoveryAnswers, setDiscoveryAnswers] = useState({})
  const [discoveryResults, setDiscoveryResults] = useState([])
  const [discoveryIndex, setDiscoveryIndex] = useState(0)

  // Assessment questions
  const [assessmentQuestionsList, setAssessmentQuestionsList] = useState([])
  const [assessmentAnswers, setAssessmentAnswers] = useState({})
  const [gradedResults, setGradedResults] = useState(null)

  // Roadmap
  const [roadmapData, setRoadmapData] = useState(null)
  const [selectedStage, setSelectedStage] = useState(null)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Load initial careers list
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

  const handleStartDiscovery = async () => {
    setLoading(true);
    setError(null);
    try {
      const questions = await getDiscoveryQuestions();
      setDiscoveryQuestions(questions);
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
        setDiscoveryResults(results.topCareers);
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

  const handleSelectCareer = async (careerId) => {
    setLoading(true);
    try {
      const fullCareer = await getCareerById(careerId);
      // Map API fields (name -> title, requiredSkills list -> string list for compatibility)
      setSelectedCareer({
        id: fullCareer.id,
        title: fullCareer.name,
        category: fullCareer.category,
        icon: fullCareer.icon || '💼',
        description: fullCareer.description,
        responsibilities: fullCareer.responsibilities ? fullCareer.responsibilities.split(';') : [],
        requiredSkills: fullCareer.requiredSkills.map(s => s.skillName),
        rawRequiredSkills: fullCareer.requiredSkills // save full array for later gap calculations
      });
      setScreen('career');
    } catch (err) {
      setError("Failed to fetch career details.");
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
      setAssessmentAnswers({});
      setScreen('assessment');
    } catch (err) {
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
      setError("Failed to submit assessment.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRoadmapComplete = async () => {
    try {
      const response = await generateRoadmap(selectedCareer.id);
      setRoadmapData(response);
      setScreen('roadmap');
    } catch (err) {
      setError("Failed to generate personalized roadmap.");
    }
  };

  const handleStageClick = (stage) => {
    if (stage.status === 'locked') return;
    setSelectedStage(stage);
    setScreen('courses');
  };

  // Convert graded results into formats expected by mock components
  const getMappedSkillsForResults = () => {
    if (!gradedResults) return [];
    return gradedResults.skillResults.map(res => {
      const scoreMap = { 0: 0, 1: 20, 2: 40, 3: 60, 4: 80, 5: 100 };
      return {
        skill: res.skillName,
        level: res.level,
        score: scoreMap[res.level] || 0
      };
    });
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
    return roadmapData.items.map(item => {
      let status = 'locked';
      if (item.status === 'COMPLETED') status = 'completed';
      else if (item.status === 'IN_PROGRESS') status = 'current';
      else if (item.status === 'AVAILABLE') status = 'available';

      return {
        id: item.courseId,
        title: item.courseTitle,
        status: status,
        description: item.reason,
        lockedReason: item.status === 'LOCKED' ? item.reason : null,
        courses: [item.courseId] // single course stage
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
              <h2>Let's define your path.</h2>
              <p>Choose how you would like to proceed with your career learning roadmap.</p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', width: '100%', maxWidth: '800px', margin: '40px auto' }}>
              <div className="career-card" style={{ cursor: 'pointer', textAlign: 'center', padding: '40px' }} onClick={handleStartDiscovery}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>🧭</div>
                <h2>Find My Career</h2>
                <p>Answer a few questions about your interests and let our algorithm match you with suitable career paths.</p>
              </div>
              <div className="career-card" style={{ cursor: 'pointer', textAlign: 'center', padding: '40px' }} onClick={() => setScreen('careers')}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎯</div>
                <h2>I Know My Career</h2>
                <p>Select your target career directly from our database to start analyzing your skills and roadmaps.</p>
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
                <div className="career-card" key={c.id} style={{ cursor: 'pointer', padding: '30px' }} onClick={() => handleSelectCareer(c.id)}>
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
            <button className="back-to-career" onClick={() => setScreen('onboarding')}>← Back</button>
            <div className="assessment-title">
              <span>CAREER DISCOVERY</span>
              <h2>Discovery Quiz</h2>
              <p>Question {discoveryIndex + 1} of {discoveryQuestions.length}</p>
            </div>
          </div>
          <div className="assessment-container">
            <div className="question-card">
              <h1>{discoveryQuestions[discoveryIndex].question}</h1>
              <div className="assessment-options" style={{ marginTop: '30px' }}>
                {discoveryQuestions[discoveryIndex].options.map((opt, i) => (
                  <button
                    type="button"
                    key={i}
                    className={`assessment-option ${discoveryAnswers[discoveryQuestions[discoveryIndex].id] === i ? 'selected' : ''}`}
                    onClick={() => handleSelectDiscoveryOption(discoveryQuestions[discoveryIndex].id, i)}
                  >
                    <div className="option-radio">
                      {discoveryAnswers[discoveryQuestions[discoveryIndex].id] === i && <span />}
                    </div>
                    <div className="option-content">
                      <strong>{opt.label}</strong>
                      <p>{opt.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="assessment-navigation" style={{ marginTop: '20px' }}>
              <button className="secondary-button" onClick={() => {
                if (discoveryIndex === 0) setScreen('onboarding');
                else setDiscoveryIndex(prev => prev - 1);
              }}>← Previous</button>
              <button
                className="primary-button"
                disabled={discoveryAnswers[discoveryQuestions[discoveryIndex].id] === undefined}
                onClick={handleNextDiscovery}
              >
                {discoveryIndex === discoveryQuestions.length - 1 ? 'Show Matches' : 'Next'} →
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
              <h2>Your career matches.</h2>
              <p>Based on your answers, these paths match your profiles and interests.</p>
              <button className="back-to-career" style={{ marginTop: '20px' }} onClick={() => setScreen('onboarding')}>← Start Over</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', width: '100%', maxWidth: '1000px', margin: '40px auto' }}>
              {discoveryResults.map(res => (
                <div className="career-card" key={res.careerId} style={{ cursor: 'pointer', padding: '30px' }} onClick={() => handleSelectCareer(res.careerId)}>
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
              <p>Review the details of your selected career and begin the skill verification assessment.</p>
              <button className="back-to-career" style={{ marginTop: '20px' }} onClick={() => setScreen('careers')}>← Select Different Career</button>
            </div>
            <SelectedCareerCard
              career={selectedCareer}
              onStart={handleStartAssessment}
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
              <h2>Let's verify your skills.</h2>
              <p>Help us customize your path by answering these self-reported and knowledge questions.</p>
            </div>
          </div>
          <Assessment
            questions={assessmentQuestionsList}
            onComplete={handleAssessmentComplete}
            onBack={() => setScreen('career')}
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
          SCREEN 6 — PERSONALIZED ROADMAP PATH
      ===================================== */}
      {screen === 'roadmap' && roadmapData && (
        <PersonalizedRoadmap
          career={selectedCareer}
          stages={getMappedRoadmapStages()}
          onStageClick={handleStageClick}
        />
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
    </main>
  )
}