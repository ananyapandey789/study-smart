import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { User } from '@/types/study';
import { generateDailyPlan, type PlanSlot } from '@/lib/ai-recommender';

interface DailyPlanViewProps {
  user: User;
}

const urgencyStyles = {
  urgent: 'border-l-destructive bg-destructive/5',
  review: 'border-l-warning bg-warning/5',
  maintain: 'border-l-success bg-success/5',
};

const urgencyLabels = {
  urgent: '🔴 Urgent',
  review: '🟡 Review',
  maintain: '🟢 Maintain',
};

const DailyPlanView = ({ user }: DailyPlanViewProps) => {
  const [hours, setHours] = useState('4');
  const [plan, setPlan] = useState<PlanSlot[] | null>(null);

  const generate = () => {
    const h = parseFloat(hours);
    if (h > 0) setPlan(generateDailyPlan(user, h));
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-display font-bold text-foreground">Daily Study Plan</h2>
      </div>

      <div className="flex gap-3 mb-6">
        <Input
          type="number"
          min="0.5"
          step="0.5"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          placeholder="Hours available"
          className="w-40 font-body"
        />
        <Button onClick={generate} className="font-body font-semibold">Generate Plan</Button>
      </div>

      {plan !== null && plan.length === 0 && (
        <p className="text-muted-foreground font-body text-sm">Add subjects and topics first to generate a plan.</p>
      )}

      {plan && plan.length > 0 && (
        <div className="space-y-3">
          {plan.map((slot, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-4 rounded-lg border-l-4 ${urgencyStyles[slot.urgency]}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold font-body">{urgencyLabels[slot.urgency]}</span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span className="font-body">{slot.allocatedTime}h</span>
                </div>
              </div>
              <p className="font-semibold text-foreground font-body">{slot.subjectName} → {slot.topicName}</p>
              <p className="text-xs text-muted-foreground mt-1 font-body">Confidence: {slot.confidence}/10</p>
              <div className="flex items-start gap-1.5 mt-2 text-xs text-muted-foreground">
                <Lightbulb className="w-3 h-3 mt-0.5 flex-shrink-0 text-primary" />
                <span className="font-body">{slot.tip}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DailyPlanView;
