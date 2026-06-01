'use client';

/**
 * Client Portal - Requisition Detail Page
 * 
 * Allows clients to view candidates for a specific requisition
 * and provide feedback on each candidate.
 */

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Star,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  FileText,
  Linkedin,
  Globe,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import Link from 'next/link';

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  location: string | null;
  currentRole: string | null;
  experience: string | null;
  education: string | null;
  skills: string[];
  resumeUrl: string | null;
  linkedInUrl: string | null;
  portfolioUrl: string | null;
  clientFeedback: Array<{
    id: string;
    rating: number | null;
    status: string;
    comments: string | null;
    moveForward: boolean | null;
    interviewRequested: boolean;
  }>;
}

interface Application {
  id: string;
  appliedDate: string;
  status: string;
  score: number | null;
  candidate: Candidate;
}

interface Requisition {
  id: string;
  title: string;
  description: string;
  department: string | null;
  location: string | null;
  requiredSkills: string[];
  preferredSkills: string[];
  salaryMin: number | null;
  salaryMax: number | null;
  applications: Application[];
}

export default function RequisitionDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const requisitionId = params.id as string;
  const token = searchParams.get('token');
  const clientId = searchParams.get('clientId');

  const [loading, setLoading] = useState(true);
  const [requisition, setRequisition] = useState<Requisition | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Feedback form state
  const [rating, setRating] = useState<number>(0);
  const [status, setStatus] = useState<string>('pending');
  const [comments, setComments] = useState<string>('');
  const [strengths, setStrengths] = useState<string>('');
  const [concerns, setConcerns] = useState<string>('');
  const [interviewRequested, setInterviewRequested] = useState(false);

  useEffect(() => {
    async function loadRequisition() {
      if (!token || !clientId) {
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `/api/recruiting/client-portal?action=requisition&requisitionId=${requisitionId}&clientId=${clientId}`
        );

        if (!response.ok) {
          throw new Error('Failed to load requisition');
        }

        const data = await response.json();
        setRequisition(data);
      } catch (error) {
        console.error('Error loading requisition:', error);
      } finally {
        setLoading(false);
      }
    }

    loadRequisition();
  }, [requisitionId, token, clientId]);

  const openFeedbackDialog = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    
    // Pre-fill existing feedback if available
    const existingFeedback = candidate.clientFeedback[0];
    if (existingFeedback) {
      setRating(existingFeedback.rating || 0);
      setStatus(existingFeedback.status);
      setComments(existingFeedback.comments || '');
      setInterviewRequested(existingFeedback.interviewRequested);
    } else {
      // Reset form
      setRating(0);
      setStatus('pending');
      setComments('');
      setStrengths('');
      setConcerns('');
      setInterviewRequested(false);
    }
    
    setFeedbackDialogOpen(true);
  };

  const submitFeedback = async () => {
    if (!selectedCandidate || !clientId) return;

    try {
      setSubmitting(true);

      const response = await fetch('/api/recruiting/client-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit_feedback',
          requisitionId,
          candidateId: selectedCandidate.id,
          clientId,
          rating: rating > 0 ? rating : null,
          status,
          comments,
          strengths: strengths ? strengths.split('\n').filter(Boolean) : [],
          concerns: concerns ? concerns.split('\n').filter(Boolean) : [],
          moveForward: status === 'interested' || status === 'interview-requested',
          interviewRequested,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      // Reload requisition data
      const reloadResponse = await fetch(
        `/api/recruiting/client-portal?action=requisition&requisitionId=${requisitionId}&clientId=${clientId}`
      );
      const data = await reloadResponse.json();
      setRequisition(data);

      setFeedbackDialogOpen(false);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading candidates...</p>
        </div>
      </div>
    );
  }

  if (!requisition) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Requisition not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getFeedbackStatus = (candidate: Candidate) => {
    if (candidate.clientFeedback.length === 0) {
      return { label: 'Pending Review', color: 'bg-yellow-500/10 text-yellow-500', icon: Clock };
    }
    const feedback = candidate.clientFeedback[0];
    switch (feedback.status) {
      case 'interested':
        return { label: 'Interested', color: 'bg-green-500/10 text-green-500', icon: ThumbsUp };
      case 'not-interested':
        return { label: 'Not Interested', color: 'bg-red-500/10 text-red-500', icon: ThumbsDown };
      case 'interview-requested':
        return { label: 'Interview Requested', color: 'bg-blue-500/10 text-blue-500', icon: Calendar };
      case 'rejected':
        return { label: 'Rejected', color: 'bg-gray-500/10 text-gray-500', icon: XCircle };
      default:
        return { label: 'Pending Review', color: 'bg-yellow-500/10 text-yellow-500', icon: Clock };
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <Button
            variant="ghost"
            asChild
            className="mb-4"
          >
            <Link href={`/client-portal?token=${token}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Portal
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-foreground">{requisition.title}</h1>
          <p className="text-muted-foreground mt-1">
            {requisition.department && `${requisition.department} • `}
            {requisition.location || 'Remote'}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Requisition Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Position Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-foreground mb-2">Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{requisition.description}</p>
            </div>
            
            {requisition.requiredSkills.length > 0 && (
              <div>
                <h3 className="font-semibold text-foreground mb-2">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {requisition.requiredSkills.map((skill) => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}

            {requisition.salaryMin && requisition.salaryMax && (
              <div>
                <h3 className="font-semibold text-foreground mb-2">Salary Range</h3>
                <p className="text-muted-foreground">
                  ${requisition.salaryMin.toLocaleString()} - ${requisition.salaryMax.toLocaleString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Candidates */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Candidates ({requisition.applications.length})
          </h2>

          {requisition.applications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No candidates submitted yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {requisition.applications.map((application) => {
                const candidate = application.candidate;
                const feedbackStatus = getFeedbackStatus(candidate);
                const StatusIcon = feedbackStatus.icon;

                return (
                  <Card key={candidate.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-foreground">{candidate.name}</CardTitle>
                              <CardDescription>{candidate.currentRole || 'Candidate'}</CardDescription>
                            </div>
                          </div>
                        </div>
                        <Badge className={feedbackStatus.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {feedbackStatus.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          {candidate.email && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span className="text-foreground">{candidate.email}</span>
                            </div>
                          )}
                          {candidate.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span className="text-foreground">{candidate.phone}</span>
                            </div>
                          )}
                          {candidate.location && (
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="text-foreground">{candidate.location}</span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          {candidate.experience && (
                            <div className="flex items-center gap-2 text-sm">
                              <Briefcase className="h-4 w-4 text-muted-foreground" />
                              <span className="text-foreground">{candidate.experience}</span>
                            </div>
                          )}
                          {candidate.education && (
                            <div className="flex items-center gap-2 text-sm">
                              <GraduationCap className="h-4 w-4 text-muted-foreground" />
                              <span className="text-foreground">{candidate.education}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {candidate.skills.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-foreground mb-2">Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {candidate.skills.map((skill) => (
                              <Badge key={skill} variant="outline">{skill}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button onClick={() => openFeedbackDialog(candidate)}>
                          <Star className="h-4 w-4 mr-2" />
                          {candidate.clientFeedback.length > 0 ? 'Update Feedback' : 'Provide Feedback'}
                        </Button>
                        {candidate.resumeUrl && (
                          <Button variant="outline" asChild>
                            <a href={candidate.resumeUrl} target="_blank" rel="noopener noreferrer">
                              <FileText className="h-4 w-4 mr-2" />
                              View Resume
                            </a>
                          </Button>
                        )}
                        {candidate.linkedInUrl && (
                          <Button variant="outline" asChild>
                            <a href={candidate.linkedInUrl} target="_blank" rel="noopener noreferrer">
                              <Linkedin className="h-4 w-4 mr-2" />
                              LinkedIn
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Feedback Dialog */}
      <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Provide Feedback</DialogTitle>
            <DialogDescription>
              Share your thoughts on {selectedCandidate?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Rating */}
            <div>
              <Label>Overall Rating</Label>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        value <= rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <Label>Decision</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button
                  type="button"
                  variant={status === 'interested' ? 'default' : 'outline'}
                  onClick={() => setStatus('interested')}
                  className="justify-start"
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Interested
                </Button>
                <Button
                  type="button"
                  variant={status === 'not-interested' ? 'default' : 'outline'}
                  onClick={() => setStatus('not-interested')}
                  className="justify-start"
                >
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  Not Interested
                </Button>
                <Button
                  type="button"
                  variant={status === 'interview-requested' ? 'default' : 'outline'}
                  onClick={() => {
                    setStatus('interview-requested');
                    setInterviewRequested(true);
                  }}
                  className="justify-start"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Request Interview
                </Button>
                <Button
                  type="button"
                  variant={status === 'rejected' ? 'default' : 'outline'}
                  onClick={() => setStatus('rejected')}
                  className="justify-start"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>

            {/* Comments */}
            <div>
              <Label htmlFor="comments">Comments</Label>
              <Textarea
                id="comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Share your overall thoughts about this candidate..."
                rows={4}
                className="mt-2"
              />
            </div>

            {/* Strengths */}
            <div>
              <Label htmlFor="strengths">Strengths (one per line)</Label>
              <Textarea
                id="strengths"
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
                placeholder="What are this candidate's key strengths?"
                rows={3}
                className="mt-2"
              />
            </div>

            {/* Concerns */}
            <div>
              <Label htmlFor="concerns">Concerns (one per line)</Label>
              <Textarea
                id="concerns"
                value={concerns}
                onChange={(e) => setConcerns(e.target.value)}
                placeholder="Any concerns or areas for improvement?"
                rows={3}
                className="mt-2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFeedbackDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={submitFeedback} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
