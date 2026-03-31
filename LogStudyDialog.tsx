import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

interface LogStudyDialogProps {
  open: boolean;
  onClose: () => void;
  topicName: string;
  onSubmit: (hours: number, confidence: number) => void;
}

const LogStudyDialog = ({ open, onClose, topicName, onSubmit }: LogStudyDialogProps) => {
  const [hours, setHours] = useState('1');
  const [confidence, setConfidence] = useState([5]);

  const handleSubmit = () => {
    const h = parseFloat(hours);
    if (h > 0) {
      onSubmit(h, confidence[0]);
      setHours('1');
      setConfidence([5]);
      onClose();
    }
  };

  const getConfidenceLabel = (val: number) => {
    if (val <= 2) return '😟 Very Low';
    if (val <= 4) return '😐 Low';
    if (val <= 6) return '🙂 Moderate';
    if (val <= 8) return '😊 High';
    return '🤩 Mastered';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Log Study Session</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-2">
          <p className="text-sm text-muted-foreground font-body">Topic: <span className="font-semibold text-foreground">{topicName}</span></p>
          <div>
            <label className="text-sm font-medium font-body text-foreground mb-1.5 block">Hours Studied</label>
            <Input
              type="number"
              min="0.1"
              step="0.5"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="font-body"
            />
          </div>
          <div>
            <label className="text-sm font-medium font-body text-foreground mb-3 block">
              Confidence: {confidence[0]}/10 — {getConfidenceLabel(confidence[0])}
            </label>
            <Slider
              value={confidence}
              onValueChange={setConfidence}
              min={1}
              max={10}
              step={1}
              className="py-2"
            />
          </div>
          <Button onClick={handleSubmit} className="w-full font-body font-semibold">Save Session</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LogStudyDialog;
