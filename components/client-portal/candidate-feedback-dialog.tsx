'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Star, ThumbsUp, ThumbsDown, Calendar } from 'lucide-react';
import { cn } from '@/lib/css';

interface CandidateFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: {
    id: string;
    name: string;
    currentRole?: string | null;
  };
  requisitionId: string;
  clientId: string;
  onSubmit: (feedback: FeedbackData) => Promise<void>;
}

export interface FeedbackData {
  rating?: number;
  status: string;
  comments?: string;
  strengths?: string[];
  concerns?: string[];
  moveForward?: boolean;
  interviewRequested?: boolean;
  preferredInterviewDates?: string[];
}

export function CandidateFeedbackDialog({
  open,
  onOpenChange,
  candidate,
  requisitionId,
  clientId,
  onSubmit,
}: CandidateFeedbackDialogProps) {
  const [rating, setRating] = useState<number>(0);
  const [status, setStatus] = useState<string>('pending');
  const [comments, setComments] = useState('');
  const [strengths, setStrengths] = useState<string[]>([]);
  const [concerns, setConcerns] = useState<string[]>([]);
  const [moveForward, setMoveForward] = useState<boolean | undefined>(undefined);
  const [interviewRequested, setInterviewRequested] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const strengthOptions = [
    'Technical Skills',
    'Communication',
    'Experience Level',
    'Cultural Fit',
    'Problem Solving',
    'Leadership',
  ];

  const concernOptions = [
    'Salary Expectations',
    'Experience Gap',
    'Location/Remote',
    'Availability',
    'Technical Skills',
    'Cultural Fit',
  ];

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      await onSubmit({
        rating: rating > 0 ? rating : undefined,
        status,
        comments: comments || undefined,
        strengths: strengths.length > 0 ? strengths : undefined,
        concerns: concerns.length > 0 ? concerns : undefined,
        moveForward,
        interviewRequested,
      });
      onOpenChange(false);
      // Reset form
      setRating(0);
      setStatus('pending');
      setComments('');
      setStrengths([]);
      setConcerns([]);
      setMoveForward(undefined);
      setInterviewRequested(false);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStrength = (strength: string) => {
    setStrengths((prev) =>
      prev.includes(strength)
        ? prev.filter((s) => s !== strength)
        : [...prev, strength]
    );
  };

  const toggleConcern = (concern: string) => {
    setConcerns((prev) =>
      prev.includes(concern)
        ? prev.filter((c) => c !== concern)
        : [...prev, concern]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Provide Feedback on {candidate.name}</DialogTitle>
          <DialogDescription>
            {candidate.currentRole && `${candidate.currentRole} • `}
            Share your thoughts on this candidate
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Rating */}
          <div className="space-y-2">
            <Label>Overall Rating</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="transition-colors"
                >
                  <Star
                    className={cn(
                      'h-8 w-8',
                      star <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Decision */}
          <div className="space-y-2">
            <Label>Decision</Label>
            <RadioGroup value={status} onValueChange={setStatus}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="interested" id="interested" />
                <Label htmlFor="interested" className="font-normal cursor-pointer">
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="h-4 w-4 text-green-500" />
                    Interested - Move forward
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="not-interested" id="not-interested" />
                <Label htmlFor="not-interested" className="font-normal cursor-pointer">
                  <div className="flex items-center gap-2">
                    <ThumbsDown className="h-4 w-4 text-red-500" />
                    Not interested - Pass
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pending" id="pending" />
                <Label htmlFor="pending" className="font-normal cursor-pointer">
                  Need more information
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Interview Request */}
          {status === 'interested' && (
            <div className="flex items-center space-x-2 p-4 bg-muted/50 rounded-lg">
              <Checkbox
                id="interview"
                checked={interviewRequested}
                onCheckedChange={(checked) => setInterviewRequested(checked as boolean)}
              />
              <Label htmlFor="interview" className="font-normal cursor-pointer flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Request interview with this candidate
              </Label>
            </div>
          )}

          {/* Strengths */}
          <div className="space-y-2">
            <Label>Key Strengths (select all that apply)</Label>
            <div className="grid grid-cols-2 gap-2">
              {strengthOptions.map((strength) => (
                <div key={strength} className="flex items-center space-x-2">
                  <Checkbox
                    id={`strength-${strength}`}
                    checked={strengths.includes(strength)}
                    onCheckedChange={() => toggleStrength(strength)}
                  />
                  <Label
                    htmlFor={`strength-${strength}`}
                    className="font-normal cursor-pointer text-sm"
                  >
                    {strength}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Concerns */}
          <div className="space-y-2">
            <Label>Concerns (select all that apply)</Label>
            <div className="grid grid-cols-2 gap-2">
              {concernOptions.map((concern) => (
                <div key={concern} className="flex items-center space-x-2">
                  <Checkbox
                    id={`concern-${concern}`}
                    checked={concerns.includes(concern)}
                    onCheckedChange={() => toggleConcern(concern)}
                  />
                  <Label
                    htmlFor={`concern-${concern}`}
                    className="font-normal cursor-pointer text-sm"
                  >
                    {concern}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-2">
            <Label htmlFor="comments">Additional Comments</Label>
            <Textarea
              id="comments"
              placeholder="Share any additional thoughts about this candidate..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
