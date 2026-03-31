import { motion } from 'framer-motion';
import { Brain, AlertTriangle, RefreshCw, Trophy, Lightbulb } from 'lucide-react';
import type { User } from '@/types/study';
import { getRecommendations } from '@/lib/ai-recommender';

interface RecommendationsViewProps {
  user: User;
}

const RecommendationsView = ({ user }: RecommendationsViewProps) => {
  const recs = getRecommendations(user);
  const hasData = user.subjects.some(s => s.topics.length > 0);

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-6">
      <div className="flex items-center gap-2 mb-5">
        <Brain className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-display font-bold text-foreground">AI Recommendations</h2>
      </div>

      {!hasData ? (
        <p className="text-muted-foreground font-body text-sm">Add subjects and log study sessions to get personalized recommendations.</p>
      ) : (
        <div className="space-y-5">
          {recs.weakTopics.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <h3 className="font-semibold text-foreground font-body text-sm">Weak Areas</h3>
              </div>
              {recs.weakTopics.map((w, i) => (
                <div key={i} className="ml-6 py-1.5 text-sm text-muted-foreground font-body">
                  <span className="text-foreground font-medium">{w.topic.name}</span> ({w.subjectName}) — Confidence: {w.topic.confidenceLevel}/10
                </div>
              ))}
            </motion.div>
          )}

          {recs.neglectedTopics.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw className="w-4 h-4 text-warning" />
                <h3 className="font-semibold text-foreground font-body text-sm">Needs Revision</h3>
              </div>
              {recs.neglectedTopics.map((n, i) => (
                <div key={i} className="ml-6 py-1.5 text-sm text-muted-foreground font-body">
                  <span className="text-foreground font-medium">{n.topic.name}</span> ({n.subjectName}) — {n.daysSince} days ago
                </div>
              ))}
            </motion.div>
          )}

          {recs.strongTopics.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-4 h-4 text-success" />
                <h3 className="font-semibold text-foreground font-body text-sm">Strong Areas</h3>
              </div>
              {recs.strongTopics.map((s, i) => (
                <div key={i} className="ml-6 py-1.5 text-sm text-muted-foreground font-body">
                  <span className="text-foreground font-medium">{s.topic.name}</span> ({s.subjectName}) — {s.topic.confidenceLevel}/10
                </div>
              ))}
            </motion.div>
          )}

          {recs.insight && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10"
            >
              <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-foreground font-body">{recs.insight}</p>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecommendationsView;
