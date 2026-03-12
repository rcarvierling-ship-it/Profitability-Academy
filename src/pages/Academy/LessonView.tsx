import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  ArrowLeft,
  BookOpen
} from 'lucide-react';
import { academyData } from '../../data/academy';
import { Button, Badge, Card } from '../../components/ui';
import { useApp } from '../../context/AppContext';

const LessonView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { academyProgress, completeLesson } = useApp();

  const lesson = academyData.flatMap(m => m.lessons).find(l => l.id === id);
  const module = academyData.find(m => m.lessons.some(l => l.id === id));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!lesson || !module) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Lesson not found</h2>
        <Button onClick={() => navigate('/academy')}>Back to Academy</Button>
      </div>
    );
  }

  const isCompleted = academyProgress.completedLessons.includes(lesson.id);

  // Find next lesson
  const allLessons = academyData.flatMap(m => m.lessons);
  const currentIdx = allLessons.findIndex(l => l.id === id);
  const nextLesson = allLessons[currentIdx + 1];
  const prevLesson = allLessons[currentIdx - 1];

  const handleComplete = () => {
    completeLesson(lesson.id);
    if (nextLesson) {
      navigate(`/lesson/${nextLesson.id}`);
    } else {
      navigate('/academy');
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '100px' }}>
      {/* Top Nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <button 
          onClick={() => navigate('/academy')}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: 'var(--text-dim)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 500
          }}
        >
          <ChevronLeft size={20} />
          Back to Curriculum
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Badge color="neutral">{module.title}</Badge>
          {isCompleted && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)', fontSize: '0.875rem', fontWeight: 600 }}>
              <CheckCircle2 size={16} />
              Completed
            </div>
          )}
        </div>
      </div>

      {/* Lesson Content Wrapper */}
      <Card style={{ padding: '0', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ padding: '60px 80px', background: 'rgba(255,255,255,0.01)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
             <Badge color="primary">{lesson.difficulty}</Badge>
             <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-dim)', fontSize: '0.875rem' }}>
                <Clock size={14} />
                {lesson.duration}
             </div>
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '24px', lineHeight: '1.1' }} className="gradient-text">
            {lesson.title}
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-dim)', lineHeight: '1.6', marginBottom: '40px', fontStyle: 'italic' }}>
            {lesson.description}
          </p>

          <div className="lesson-content-renderer" style={{ 
            color: 'rgba(255,255,255,0.85)', 
            fontSize: '1.15rem', 
            lineHeight: '1.8',
            fontFamily: 'Outfit, sans-serif'
          }}>
            {lesson.content.split('\n').map((line, i) => {
              if (line.startsWith('# ')) return <h1 key={i} style={{ color: 'white', marginTop: '40px', marginBottom: '20px', fontSize: '2rem' }}>{line.replace('# ', '')}</h1>;
              if (line.startsWith('## ')) return <h2 key={i} style={{ color: 'white', marginTop: '30px', marginBottom: '15px', fontSize: '1.5rem' }}>{line.replace('## ', '')}</h2>;
              if (line.startsWith('### ')) return <h3 key={i} style={{ color: 'white', marginTop: '20px', marginBottom: '10px', fontSize: '1.2rem' }}>{line.replace('### ', '')}</h3>;
              if (line.startsWith('- ')) return <li key={i} style={{ marginLeft: '20px', marginBottom: '8px' }}>{line.replace('- ', '')}</li>;
              if (line.trim() === '') return <br key={i} />;
              
              // Handle bold
              let parts = line.split(/(\*\*.*?\*\*)/g);
              return (
                <p key={i} style={{ marginBottom: '20px' }}>
                  {parts.map((p, j) => p.startsWith('**') ? <strong key={j} style={{ color: 'var(--primary)' }}>{p.replace(/\*\*/g, '')}</strong> : p)}
                </p>
              );
            })}
          </div>
        </div>

        {/* Footer Navigation */}
        <div style={{ 
          padding: '40px 80px', 
          borderTop: '1px solid rgba(255,255,255,0.05)', 
          background: 'rgba(0,0,0,0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            {prevLesson ? (
              <Button variant="outline" onClick={() => navigate(`/lesson/${prevLesson.id}`)}>
                <ArrowLeft size={16} />
                Previous
              </Button>
            ) : <div />}
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <Button variant="primary" glow onClick={handleComplete}>
              {isCompleted ? (
                <>Next Lesson <ArrowRight size={16} /></>
              ) : (
                <>Complete & Continue <CheckCircle2 size={16} /></>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Suggested Next */}
      {nextLesson && (
        <div style={{ marginTop: '60px' }}>
          <p style={{ color: 'var(--text-dim)', fontWeight: 600, marginBottom: '20px', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Up Next</p>
          <Card onClick={() => navigate(`/lesson/${nextLesson.id}`)} style={{ cursor: 'pointer', transition: '0.3s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BookOpen size={24} color="var(--primary)" />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{nextLesson.title}</h4>
                  <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>{nextLesson.duration} • {nextLesson.difficulty}</p>
                </div>
              </div>
              <ArrowRight size={20} color="var(--text-dim)" />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default LessonView;
