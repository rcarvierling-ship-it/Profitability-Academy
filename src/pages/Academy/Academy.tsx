import React from 'react';
import { 
  Play, 
  Lock, 
  CheckCircle2, 
  Clock, 
  BookOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Module, Lesson } from '../../data/academy';
import { academyData } from '../../data/academy';
import { Card, Button, Badge } from '../../components/ui';
import { useApp } from '../../context/AppContext';

const Academy: React.FC = () => {
  const navigate = useNavigate();
  const { academyProgress } = useApp();

  const totalLessons = academyData.reduce((sum, mod) => sum + mod.lessons.length, 0);
  const completedCount = academyProgress.completedLessons.length;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const getLessonStatus = (lessonId: string, moduleIndex: number, lessonIndex: number) => {
    if (academyProgress.completedLessons.includes(lessonId)) return 'completed';
    
    // First lesson of first module is always available
    if (moduleIndex === 0 && lessonIndex === 0) return 'available';
    
    // Available if previous lesson is completed
    const prevModule = lessonIndex === 0 ? academyData[moduleIndex - 1] : academyData[moduleIndex];
    const prevLesson = lessonIndex === 0 
      ? prevModule?.lessons[prevModule.lessons.length - 1] 
      : academyData[moduleIndex].lessons[lessonIndex - 1];
    
    if (prevLesson && academyProgress.completedLessons.includes(prevLesson.id)) return 'available';
    
    return 'locked';
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <section>
        <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '12px' }}>Curriculum</h1>
        <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem', maxWidth: '600px' }}>
          Master the art of professional speculation through our structured learning path.
        </p>
      </section>

      {/* Progress Overview */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '20px' 
      }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '12px', 
              background: 'rgba(59, 130, 246, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BookOpen color="var(--primary)" size={24} />
            </div>
            <div>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>Total Progress</p>
              <h4 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{progressPercent}%</h4>
            </div>
            <div style={{ flex: 1, marginLeft: '20px' }}>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary-glow)' }} />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Modules List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
        {academyData.map((module: Module, mIdx: number) => (
          <div key={module.id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>{module.title}</h2>
              <Badge color="neutral">{module.lessons.length} Lessons</Badge>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', 
              gap: '20px' 
            }}>
              {module.lessons.map((lesson: Lesson, lIdx: number) => {
                const status = getLessonStatus(lesson.id, mIdx, lIdx);
                return (
                  <Card 
                    key={lesson.id} 
                    style={{ 
                      opacity: status === 'locked' ? 0.6 : 1,
                      cursor: status === 'locked' ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Badge color={
                          status === 'completed' ? 'success' : 
                          status === 'available' ? 'primary' : 'neutral'
                        }>
                          {lesson.difficulty}
                        </Badge>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                          <Clock size={12} />
                          {lesson.duration}
                        </div>
                      </div>

                      <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}>{lesson.title}</h3>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                          {lesson.description}
                        </p>
                      </div>

                      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {status === 'completed' ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)' }}>
                            <CheckCircle2 size={18} />
                            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Completed</span>
                          </div>
                        ) : status === 'available' ? (
                          <Button 
                            size="sm" 
                            variant="primary" 
                            glow 
                            onClick={() => navigate(`/lesson/${lesson.id}`)}
                            style={{ width: '100%' }}
                          >
                            <Play size={14} fill="white" />
                            Start Lesson
                          </Button>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', width: '100%', justifyContent: 'center' }}>
                            <Lock size={16} />
                            <span style={{ fontSize: '0.875rem' }}>Locked</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Academy;
