import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import {
  Page,
  PageContent,
  PageHeader,
  PageTitle,
  PageDescription,
  PageSummary,
} from "@/components/layout/page";
import { PageBackButton } from "@/components/layout/page-back-button";
import { Card, CardContent } from "@/components/ui/card";
import { IndeedApplicationForm } from "@/components/job-applications/indeed-application-form";
import { JobBoard } from "@prisma/client";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/user";

interface ApplyIndeedPageProps {
  params: {
    id: string;
  };
}

export const metadata: Metadata = {
  title: "Apply on Indeed | Gimme Job",
  description: "Submit your job application on Indeed",
};

export default async function ApplyIndeedPage({ params }: ApplyIndeedPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // Get job lead
  const jobLead = await db.jobLead.findUnique({
    where: { 
      id: params.id,
      userId: user.id
    },
    include: {
      jobListing: true,
    },
  });

  if (!jobLead) {
    notFound();
  }

  // Check if job is on Indeed
  const jobBoard = String(jobLead.jobListing?.jobBoard || '');
  if (jobBoard !== "INDEED") {
    // Redirect to the appropriate application page or general apply page
    redirect(`/jobs/${params.id}/apply`);
  }

  // Get user's resumes
  const resumes = await db.resume.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });

  const resumeOptions = resumes.map((resume) => ({
    id: resume.id,
    name: resume.name,
  }));

  // Get user's cover letters
  const coverLetters = await db.coverLetter.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });

  const coverLetterOptions = coverLetters.map((letter) => ({
    id: letter.id,
    name: letter.name,
  }));

  const jobTitle = jobLead.title || jobLead.jobListing?.title || "Unknown Position";
  const company = (jobLead as any).company || jobLead.jobListing?.company || "Unknown Company";

  return (
    <Page>
      <PageHeader>
        <PageBackButton href={`/jobs/${params.id}`} />
        <PageSummary>
          <PageTitle>Apply on Indeed</PageTitle>
          <PageDescription>
            Submit your application for {jobTitle} at {company}
          </PageDescription>
        </PageSummary>
      </PageHeader>

      <PageContent>
        <div className="grid gap-6">
          <Card>
            <CardContent className="pt-6">
              <IndeedApplicationForm
                jobLeadId={params.id}
                jobTitle={jobTitle}
                company={company}
                resumeOptions={resumeOptions}
                coverLetterOptions={coverLetterOptions}
              />
            </CardContent>
          </Card>
          
          <div className="text-center text-sm text-muted-foreground">
            <p>
              This will submit your application through Indeed&apos;s job application system.
              <br />
              Your application will be tracked in the &quot;Applications&quot; section.
            </p>
          </div>
        </div>
      </PageContent>
    </Page>
  );
}
