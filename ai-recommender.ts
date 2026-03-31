import type { User, Topic, Subject } from '@/types/study';

interface TopicPriority {
  subjectName: string;
  topic: Topic;
  priority: number;
}

export interface PlanSlot {
  urgency: 'urgent' | 'review' | 'maintain';
  subjectName: string;
  topicName: string;
  allocatedTime: number;
  confidence: number;
  tip: string;
}

export interface Recommendations {
  weakTopics: { topic: Topic; subjectName: string }[];
  neglectedTopics: { topic: Topic; subjectName: string; daysSince: number }[];
  strongTopics: { topic: Topic; subjectName: string }[];
  insight: string | null;
}

const getStudyTip = (confidence: number): string => {
  if (confidence <= 2) return "Start with basics. Watch tutorial videos or read introductory material.";
  if (confidence <= 4) return "Practice with solved examples. Focus on understanding concepts.";
  if (confidence <= 6) return "Attempt practice problems independently. Time yourself.";
  if (confidence <= 8) return "Try advanced problems. Teach this topic to someone else.";
  return "Quick revision only. Focus your energy on weaker topics.";
};

const calculatePriority = (topic: Topic): number => {
  let priority = 0;
  priority += (10 - topic.confidenceLevel) * 2;
  if (topic.lastStudiedTimestamp > 0) {
    const daysSince = (Date.now() - topic.lastStudiedTimestamp) / (1000 * 60 * 60 * 24);
    if (daysSince > 7) priority += 5;
    else if (daysSince > 3) priority += 3;
    else if (daysSince > 1) priority += 1;
  } else {
    priority += 4;
  }
  if (topic.timesRevisited === 0) priority += 3;
  else if (topic.timesRevisited < 3) priority += 1;
  return priority;
};

export const generateDailyPlan = (user: User, availableHours: number): PlanSlot[] => {
  const prioritized: TopicPriority[] = [];
  for (const s of user.subjects) {
    for (const t of s.topics) {
      prioritized.push({ subjectName: s.name, topic: t, priority: calculatePriority(t) });
    }
  }
  if (prioritized.length === 0) return [];
  prioritized.sort((a, b) => b.priority - a.priority);

  const slots: PlanSlot[] = [];
  let remaining = availableHours;

  for (const tp of prioritized) {
    if (remaining <= 0) break;
    const base = availableHours / prioritized.length;
    let allocated = tp.priority >= 8 ? base * 2 : tp.priority >= 5 ? base * 1.5 : base;
    allocated = Math.min(allocated, remaining);
    allocated = Math.round(allocated * 10) / 10;

    slots.push({
      urgency: tp.priority >= 8 ? 'urgent' : tp.priority >= 5 ? 'review' : 'maintain',
      subjectName: tp.subjectName,
      topicName: tp.topic.name,
      allocatedTime: allocated,
      confidence: tp.topic.confidenceLevel,
      tip: getStudyTip(tp.topic.confidenceLevel),
    });
    remaining -= allocated;
  }
  return slots;
};

export const getRecommendations = (user: User): Recommendations => {
  const weak: Recommendations['weakTopics'] = [];
  const neglected: Recommendations['neglectedTopics'] = [];
  const strong: Recommendations['strongTopics'] = [];

  for (const s of user.subjects) {
    for (const t of s.topics) {
      if (t.confidenceLevel <= 4) {
        weak.push({ topic: t, subjectName: s.name });
      } else if (t.lastStudiedTimestamp > 0 && (Date.now() - t.lastStudiedTimestamp) / (1000 * 60 * 60 * 24) > 3) {
        const daysSince = Math.floor((Date.now() - t.lastStudiedTimestamp) / (1000 * 60 * 60 * 24));
        neglected.push({ topic: t, subjectName: s.name, daysSince });
      } else if (t.confidenceLevel >= 7) {
        strong.push({ topic: t, subjectName: s.name });
      }
    }
  }

  let insight: string | null = null;
  if (weak.length > strong.length) {
    insight = "You have more weak topics than strong ones. Consider focusing 70% of study time on weak areas.";
  } else if (strong.length > 0 && weak.length === 0) {
    insight = "Amazing progress! All your topics are in good shape. Keep revising to maintain momentum.";
  }

  return { weakTopics: weak, neglectedTopics: neglected, strongTopics: strong, insight };
};

export const getTotalStats = (user: User) => {
  let totalHours = 0;
  let totalTopics = 0;
  let weakCount = 0;
  let strongCount = 0;

  for (const s of user.subjects) {
    for (const t of s.topics) {
      totalHours += t.hoursStudied;
      totalTopics++;
      if (t.confidenceLevel <= 4) weakCount++;
      if (t.confidenceLevel >= 7) strongCount++;
    }
  }

  return { totalHours: Math.round(totalHours * 10) / 10, totalTopics, weakCount, strongCount, subjectCount: user.subjects.length };
};
