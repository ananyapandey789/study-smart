import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { useState } from 'react';
import type { Subject, Topic } from '@/types/study';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SubjectCardProps {
  subject: Subject;
  onAddTopic: (subjectId: string, topicName: string) => void;
  onLogStudy: (subjectId: string, topicId: string) => void;
}

const ConfidenceBar = ({ level }: { level: number }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: 10 }).map((_, i) => (
      <div
        key={i}
        className={`h-2 w-3 rounded-sm ${
          i < level
            ? level <= 4
              ? 'bg-destructive'
              : level <= 6
              ? 'bg-warning'
              : 'bg-success'
            : 'bg-muted'
        }`}
      />
    ))}
  </div>
);

const SubjectCard = ({ subject, onAddTopic, onLogStudy }: SubjectCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [newTopic, setNewTopic] = useState('');

  const avgConfidence = subject.topics.length
    ? Math.round((subject.topics.reduce((s, t) => s + t.confidenceLevel, 0) / subject.topics.length) * 10) / 10
    : 0;

  const totalHours = Math.round(subject.topics.reduce((s, t) => s + t.hoursStudied, 0) * 10) / 10;

  const handleAddTopic = () => {
    if (newTopic.trim()) {
      onAddTopic(subject.id, newTopic.trim());
      setNewTopic('');
      setShowAddTopic(false);
    }
  };

  return (
    <motion.div
      layout
      className="bg-card rounded-xl border border-border shadow-card overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <div className="text-left">
          <h3 className="font-display font-bold text-lg text-foreground">{subject.name}</h3>
          <p className="text-sm text-muted-foreground font-body">
            {subject.topics.length} topics · {totalHours}h studied · Avg: {avgConfidence}/10
          </p>
        </div>
        {expanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
      </button>

      {expanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-5 pb-5 space-y-3"
        >
          {subject.topics.map((topic) => (
            <div key={topic.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
              <div className="flex-1 min-w-0 mr-3">
                <p className="font-medium text-foreground font-body text-sm truncate">{topic.name}</p>
                <div className="flex items-center gap-3 mt-1">
                  <ConfidenceBar level={topic.confidenceLevel} />
                  <span className="text-xs text-muted-foreground">{topic.hoursStudied}h</span>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => onLogStudy(subject.id, topic.id)} className="font-body text-xs">
                Log Study
              </Button>
            </div>
          ))}

          {showAddTopic ? (
            <div className="flex gap-2">
              <Input
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                placeholder="Topic name"
                className="h-9 font-body"
                onKeyDown={(e) => e.key === 'Enter' && handleAddTopic()}
                autoFocus
              />
              <Button size="sm" onClick={handleAddTopic} className="font-body">Add</Button>
              <Button size="sm" variant="ghost" onClick={() => setShowAddTopic(false)} className="font-body">Cancel</Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddTopic(true)}
              className="w-full text-muted-foreground font-body"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Topic
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default SubjectCard;
