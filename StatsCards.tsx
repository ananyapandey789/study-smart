import { motion } from 'framer-motion';
import { BookOpen, Clock, AlertTriangle, Trophy } from 'lucide-react';

interface StatsCardsProps {
  totalHours: number;
  subjectCount: number;
  weakCount: number;
  strongCount: number;
}

const StatsCards = ({ totalHours, subjectCount, weakCount, strongCount }: StatsCardsProps) => {
  const stats = [
    { label: 'Study Hours', value: totalHours, icon: Clock, color: 'text-primary' },
    { label: 'Subjects', value: subjectCount, icon: BookOpen, color: 'text-accent' },
    { label: 'Weak Topics', value: weakCount, icon: AlertTriangle, color: 'text-destructive' },
    { label: 'Strong Topics', value: strongCount, icon: Trophy, color: 'text-success' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-card rounded-xl p-5 shadow-card border border-border"
        >
          <div className="flex items-center justify-between mb-3">
            <s.icon className={`w-5 h-5 ${s.color}`} />
          </div>
          <p className="text-2xl font-bold font-display text-foreground">{s.value}</p>
          <p className="text-sm text-muted-foreground font-body">{s.label}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsCards;
