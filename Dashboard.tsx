import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { LogOut, Plus, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import StatsCards from '@/components/StatsCards';
import SubjectCard from '@/components/SubjectCard';
import LogStudyDialog from '@/components/LogStudyDialog';
import DailyPlanView from '@/components/DailyPlanView';
import RecommendationsView from '@/components/RecommendationsView';
import { getTotalStats } from '@/lib/ai-recommender';

const Dashboard = () => {
  const { user, logout, updateUser } = useAuth();
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [studyDialog, setStudyDialog] = useState<{ subjectId: string; topicId: string; topicName: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'subjects' | 'plan' | 'ai'>('subjects');

  if (!user) return null;

  const stats = getTotalStats(user);

  const handleAddSubject = () => {
    if (!newSubjectName.trim()) return;
    const updated = { ...user, subjects: [...user.subjects, { id: crypto.randomUUID(), name: newSubjectName.trim(), topics: [] }] };
    updateUser(updated);
    setNewSubjectName('');
    setShowAddSubject(false);
  };

  const handleAddTopic = (subjectId: string, topicName: string) => {
    const updated = {
      ...user,
      subjects: user.subjects.map(s =>
        s.id === subjectId
          ? { ...s, topics: [...s.topics, { id: crypto.randomUUID(), name: topicName, hoursStudied: 0, confidenceLevel: 1, timesRevisited: 0, lastStudiedTimestamp: 0 }] }
          : s
      ),
    };
    updateUser(updated);
  };

  const handleLogStudy = (subjectId: string, topicId: string) => {
    const subject = user.subjects.find(s => s.id === subjectId);
    const topic = subject?.topics.find(t => t.id === topicId);
    if (topic) setStudyDialog({ subjectId, topicId, topicName: topic.name });
  };

  const handleStudySubmit = (hours: number, confidence: number) => {
    if (!studyDialog) return;
    const updated = {
      ...user,
      subjects: user.subjects.map(s =>
        s.id === studyDialog.subjectId
          ? {
              ...s,
              topics: s.topics.map(t =>
                t.id === studyDialog.topicId
                  ? { ...t, hoursStudied: t.hoursStudied + hours, confidenceLevel: confidence, timesRevisited: t.timesRevisited + 1, lastStudiedTimestamp: Date.now() }
                  : t
              ),
            }
          : s
      ),
    };
    updateUser(updated);
  };

  const tabs = [
    { key: 'subjects' as const, label: 'Subjects' },
    { key: 'plan' as const, label: 'Daily Plan' },
    { key: 'ai' as const, label: 'AI Insights' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg text-foreground hidden sm:block">Smart Study Planner</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground font-body">Hi, {user.username}</span>
            <Button variant="ghost" size="sm" onClick={logout} className="font-body">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold text-foreground mb-1">Dashboard</h1>
          <p className="text-muted-foreground font-body">Track your progress and study smarter.</p>
        </motion.div>

        <StatsCards {...stats} />

        {/* Tabs */}
        <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-md text-sm font-medium font-body transition-colors ${
                activeTab === tab.key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'subjects' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display font-bold text-foreground">Your Subjects</h2>
              <Button onClick={() => setShowAddSubject(true)} size="sm" className="font-body">
                <Plus className="w-4 h-4 mr-1" /> Add Subject
              </Button>
            </div>
            {user.subjects.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground font-body">
                <p className="text-lg mb-2">No subjects yet</p>
                <p className="text-sm">Click "Add Subject" to get started!</p>
              </div>
            ) : (
              user.subjects.map(subject => (
                <SubjectCard key={subject.id} subject={subject} onAddTopic={handleAddTopic} onLogStudy={handleLogStudy} />
              ))
            )}
          </div>
        )}

        {activeTab === 'plan' && <DailyPlanView user={user} />}
        {activeTab === 'ai' && <RecommendationsView user={user} />}
      </main>

      {/* Add Subject Dialog */}
      <Dialog open={showAddSubject} onOpenChange={setShowAddSubject}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Add New Subject</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              placeholder="e.g. Mathematics, Physics, History..."
              className="font-body"
              onKeyDown={(e) => e.key === 'Enter' && handleAddSubject()}
              autoFocus
            />
            <Button onClick={handleAddSubject} className="w-full font-body font-semibold">Add Subject</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Log Study Dialog */}
      {studyDialog && (
        <LogStudyDialog
          open={!!studyDialog}
          onClose={() => setStudyDialog(null)}
          topicName={studyDialog.topicName}
          onSubmit={handleStudySubmit}
        />
      )}
    </div>
  );
};

export default Dashboard;
