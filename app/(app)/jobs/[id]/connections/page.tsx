import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  Page,
  PageHeader,
  PageContent,
  PageTitle,
  PageDescription,
  PageSummary,
  PageBackButton,
} from "@/components/layout/page";
import { ConnectionSuggestions } from "@/components/linkedin/connection-suggestions";
import { LinkedInProfileImport } from "@/components/linkedin/profile-import";
import { getLinkedInProfileData } from "@/lib/linkedin/profile-import";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/user";

interface JobConnectionsPageProps {
  params: {
    id: string;
  };
}

export const metadata: Metadata = {
  title: "LinkedIn Connections | Gimme Job",
  description: "Find relevant LinkedIn connections for this job opportunity",
};

export default async function JobConnectionsPage({ params }: JobConnectionsPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    notFound();
  }

  // Get job lead details
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

  const title = jobLead.jobListing?.title || jobLead.title || "Unknown Position";
  const company = jobLead.jobListing?.company || "Unknown Company";

  // Check if user has imported LinkedIn profile
  const profileData = await getLinkedInProfileData();
  const hasProfile = !!profileData;

  return (
    <Page>
      <PageHeader>
        <PageBackButton href={`/jobs/${params.id}`} />
        <PageSummary>
          <PageTitle>LinkedIn Networking</PageTitle>
          <PageDescription>
            Find connections that can help with your application for {title} at {company}
          </PageDescription>
        </PageSummary>
      </PageHeader>

      <PageContent>
        <div className="grid gap-6">
          {!hasProfile ? (
            <LinkedInProfileImport redirectUri={`/jobs/${params.id}/connections`} />
          ) : (
            <div className="grid gap-6">
              <ConnectionSuggestions 
                jobLeadId={params.id}
                jobTitle={title}
                companyName={company}
              />
              
              <div className="text-center text-sm text-muted-foreground mt-4">
                <p>
                  These suggestions are based on your LinkedIn profile data and the job details.
                  <br />
                  Reaching out to relevant connections can increase your chances of success by 85%.
                </p>
              </div>
            </div>
          )}
        </div>
      </PageContent>
    </Page>
  );
}
