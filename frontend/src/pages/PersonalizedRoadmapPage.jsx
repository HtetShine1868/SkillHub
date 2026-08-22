import { useState } from 'react'

import SelectedCareerCard from '../components/roadmap/SelectedCareerCard'

import Assessment from '../components/roadmap/assessment/Assessment'

import AssessmentResult from '../components/roadmap/results/AssessmentResult'

import SkillGap from '../components/roadmap/gap/SkillGap'

import GenerateRoadmap from '../components/roadmap/generator/GenerateRoadmap'

import PersonalizedRoadmap from '../components/roadmap/roadmap/PersonalizedRoadmap'

import CourseCard from '../components/roadmap/courses/CourseCard'

import CourseDetails from '../components/roadmap/courses/CourseDetails'

import {
  selectedCareer,
  assessmentQuestions,
  skillGapData,
  roadmapStages,
  roadmapCourses,
} from '../data/roadmapMockData'

import '../styles/roadmap.css'


export default function PersonalizedRoadmapPage() {

  const [screen, setScreen] = useState('career')

  const [answers, setAnswers] = useState({})

  const [selectedStage, setSelectedStage] = useState(null)

  const [selectedCourse, setSelectedCourse] = useState(null)


  const handleAssessmentComplete = (
    assessmentAnswers
  ) => {

    setAnswers(assessmentAnswers)

    setScreen('results')
  }


  const handleStageClick = (stage) => {

    if (stage.status === 'locked') {
      return
    }

    setSelectedStage(stage)

    setScreen('courses')
  }


  const handleCourseClick = (course) => {

    setSelectedCourse(course)
  }


  return (
    <main className="roadmap-page">


      {/* =====================================
          SCREEN 1 — SELECTED CAREER
      ===================================== */}

      {screen === 'career' && (

        <section className="career-screen">

          <div className="screen-background-glow" />

          <div className="career-wrapper">

            <div className="career-intro">

              <span>SKILLHUB</span>

              <h2>
                Let's build your
                <br />
                learning path.
              </h2>

              <p>
                First, let's understand where you are
                so we can create a roadmap that fits you.
              </p>

            </div>

            <SelectedCareerCard
              career={selectedCareer}
              onStart={() =>
                setScreen('assessment')
              }
            />

          </div>

        </section>

      )}


      {/* =====================================
          SCREEN 2 — ASSESSMENT
      ===================================== */}

      {screen === 'assessment' && (

        <section className="assessment-screen">

          <div className="assessment-background-glow" />

          <div className="assessment-header">

            <button
              className="back-to-career"
              onClick={() =>
                setScreen('career')
              }
            >
              ← {selectedCareer.title}
            </button>

            <div className="assessment-title">

              <span>SKILL ASSESSMENT</span>

              <h2>
                Let's understand
                <br />
                your current skills.
              </h2>

              <p>
                There are no right or wrong answers.
                Just choose what feels closest to your
                experience.
              </p>

            </div>

          </div>

          <Assessment
            questions={assessmentQuestions}
            onComplete={handleAssessmentComplete}
            onBack={() =>
              setScreen('career')
            }
          />

        </section>

      )}


      {/* =====================================
          SCREEN 3 — RESULT
      ===================================== */}

      {screen === 'results' && (

        <AssessmentResult

          answers={answers}

          questions={assessmentQuestions}

          career={selectedCareer}

          onContinue={() =>
            setScreen('gap')
          }

        />

      )}


      {/* =====================================
          SCREEN 4 — SKILL GAP
      ===================================== */}

      {screen === 'gap' && (

        <SkillGap

          gapData={skillGapData}

          career={selectedCareer}

          onBack={() =>
            setScreen('results')
          }

          onContinue={() =>
            setScreen('generate')
          }

        />

      )}


      {/* =====================================
          SCREEN 5 — GENERATE ROADMAP
      ===================================== */}

      {screen === 'generate' && (

        <GenerateRoadmap

          career={selectedCareer}

          onComplete={() =>
            setScreen('roadmap')
          }

        />

      )}


      {/* =====================================
          SCREEN 6 — PERSONALIZED ROADMAP
      ===================================== */}

      {screen === 'roadmap' && (

        <PersonalizedRoadmap

          career={selectedCareer}

          stages={roadmapStages}

          onStageClick={handleStageClick}

        />

      )}


      {/* =====================================
          SCREEN 7 — COURSES
      ===================================== */}

      {screen === 'courses' && (

        <section className="courses-screen">

          <div className="courses-container">

            <button
              className="courses-back"
              onClick={() => {
                setSelectedStage(null)
                setScreen('roadmap')
              }}
            >
              ← Back to Roadmap
            </button>

            <div className="courses-header">

              <span>
                ROADMAP STAGE
              </span>

              <h1>
                {selectedStage?.title}
              </h1>

              <p>
                {selectedStage?.description}
              </p>

            </div>


            <div className="courses-divider">

              <div>

                <span>
                  RECOMMENDED COURSES
                </span>

                <h2>
                  Build this skill
                </h2>

              </div>

              <span>
                {selectedStage?.courses?.length || 0}
                {' '}
                courses
              </span>

            </div>


            <div className="courses-grid">

              {selectedStage?.courses?.length > 0 ? (

                selectedStage.courses.map(
                  (courseId) => {

                    const course =
                      roadmapCourses.find(
                        (item) =>
                          item.id === courseId
                      )

                    if (!course) return null

                    return (
                      <CourseCard
                        key={course.id}
                        course={course}
                        onView={
                          handleCourseClick
                        }
                      />
                    )
                  }
                )

              ) : (

                <div className="courses-empty">

                  <span>✦</span>

                  <h3>
                    Foundation complete
                  </h3>

                  <p>
                    You've already completed
                    this roadmap stage.
                  </p>

                </div>

              )}

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

          onClose={() =>
            setSelectedCourse(null)
          }

        />

      )}

    </main>
  )
}