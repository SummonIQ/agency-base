'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Star,
  FileText,
  Linkedin,
  MessageSquare,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/css';

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  location: string | null;
  currentRole: string | null;
  experience: string | null;
  skills: string[];
  resumeUrl: string | null;
  linkedInUrl: string | null;
}

interface Application {
  id: string;
  status: string;
  score: number | null;
  appliedDate: string;
  candidate: Candidate;
}

interface PipelineStage {
  stage: string;
  label: string;
  color: string;
  applications: Application[];
}

interface CandidatePipelineProps {
  applications: Application[];
  onProvideFeedback: (candidateId: string) => void;
  onViewCandidate: (candidateId: string) => void;
}

export function CandidatePipeline({
  applications,
  onProvideFeedback,
  onViewCandidate,
}: CandidatePipelineProps) {
  const stages: PipelineStage[] = [
    {
      stage: 'new',
      label: 'New Candidates',
      color: 'bg-blue-500/10 text-blue-500 dark:bg-blue-500/20',
      applications: applications.filter((app) => app.status === 'new'),
    },
    {
      stage: 'screening',
      label: 'In Screening',
      color: 'bg-yellow-500/10 text-yellow-500 dark:bg-yellow-500/20',
      applications: applications.filter((app) => app.status === 'screening'),
    },
    {
      stage: 'interview',
      label: 'Interviewing',
      color: 'bg-purple-500/10 text-purple-500 dark:bg-purple-500/20',
      applications: applications.filter((app) => app.status === 'interview'),
    },
    {
      stage: 'offer',
      label: 'Offer Stage',
      color: 'bg-green-500/10 text-green-500 dark:bg-green-500/20',
      applications: applications.filter((app) => app.status === 'offer'),
    },
    {
      stage: 'hired',
      label: 'Hired',
      color: 'bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20',
      applications: applications.filter((app) => app.status === 'hired'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Pipeline Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stages.map((stage) => (
          <Card key={stage.stage}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stage.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {stage.applications.length}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pipeline Stages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {stages.map((stage) => (
          <div key={stage.stage} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">{stage.label}</h3>
              <Badge className={stage.color}>{stage.applications.length}</Badge>
            </div>

            <div className="space-y-3">
              {stage.applications.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      No candidates in this stage
                    </p>
                  </CardContent>
                </Card>
              ) : (
                stage.applications.map((application) => (
                  <CandidateCard
                    key={application.id}
                    application={application}
                    stageColor={stage.color}
                    onProvideFeedback={onProvideFeedback}
                    onViewCandidate={onViewCandidate}
                  />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CandidateCard({
  application,
  stageColor,
  onProvideFeedback,
  onViewCandidate,
}: {
  application: Application;
  stageColor: string;
  onProvideFeedback: (candidateId: string) => void;
  onViewCandidate: (candidateId: string) => void;
}) {
  const { candidate, score } = application;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-foreground">{candidate.name}</h4>
                {score && score >= 80 && (
                  <Badge variant="outline" className="text-xs">
                    <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                    {score}
                  </Badge>
                )}
              </div>
              {candidate.currentRole && (
                <p className="text-sm text-muted-foreground">{candidate.currentRole}</p>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-1 text-sm">
            {candidate.email && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-3 w-3" />
                <span className="truncate">{candidate.email}</span>
              </div>
            )}
            {candidate.location && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{candidate.location}</span>
              </div>
            )}
            {candidate.experience && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Briefcase className="h-3 w-3" />
                <span>{candidate.experience}</span>
              </div>
            )}
          </div>

          {/* Skills */}
          {candidate.skills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {candidate.skills.slice(0, 3).map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {candidate.skills.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{candidate.skills.length - 3} more
                </Badge>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => onViewCandidate(candidate.id)}
            >
              <User className="h-3 w-3 mr-1" />
              View Profile
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={() => onProvideFeedback(candidate.id)}
            >
              <MessageSquare className="h-3 w-3 mr-1" />
              Feedback
            </Button>
          </div>

          {/* Links */}
          <div className="flex gap-2 pt-1">
            {candidate.resumeUrl && (
              <a
                href={candidate.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <FileText className="h-3 w-3" />
                Resume
              </a>
            )}
            {candidate.linkedInUrl && (
              <a
                href={candidate.linkedInUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <Linkedin className="h-3 w-3" />
                LinkedIn
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
