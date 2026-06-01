import { Metadata } from "next";
import { ResponsivenessAuditReport } from "@/components/mobile/responsive-audit-report";
import {
  Page,
  PageHeader,
  PageContent,
  PageTitle,
  PageDescription,
  PageSummary,
} from "@/components/layout/page";
import { getLatestResponsivenessAudit } from "@/lib/mobile/responsive-audit";
import { MobileViewTips } from "@/components/mobile/mobile-view-tips";

export const metadata: Metadata = {
  title: "Mobile Experience | Gimme Job",
  description: "Mobile optimization and responsive design for Gimme Job",
};

export default async function MobileExperiencePage() {
  // Get the latest mobile responsiveness audit data
  const auditData = await getLatestResponsivenessAudit();

  return (
    <Page>
      <PageHeader>
        <PageSummary>
          <PageTitle>Mobile Experience</PageTitle>
          <PageDescription>
            Optimize your job search experience on mobile devices
          </PageDescription>
        </PageSummary>
      </PageHeader>

      <PageContent>
        <div className="grid gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ResponsivenessAuditReport initialData={auditData || undefined} />
            </div>
            
            <div className="lg:col-span-1">
              <MobileViewTips />
            </div>
          </div>
        </div>
      </PageContent>
    </Page>
  );
}
