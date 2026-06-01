import { Search, Briefcase, ArrowDownToLine, ListFilter } from 'lucide-react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import {
  Page,
  PageContent,
  PageDescription,
  PageHeader,
  PageSummary,
  PageTitle,
} from '@/components/layout/page';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardSummary,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getSessionUser } from '@/lib/user';

export const metadata: Metadata = {
  description: 'Scrape and search for job listings across multiple platforms.',
  title: 'Job Scraper | gimmejob',
};

export default async function JobScraperPage() {
  const user = await getSessionUser();

  if (!user || !user.id) {
    redirect('/login');
  }

  return (
    <Page>
      <PageHeader className="border-b border-border/50">
        <PageSummary>
          <PageTitle>Job Scraper</PageTitle>
          <PageDescription>
            Scrape and search for job listings across multiple platforms.
          </PageDescription>
        </PageSummary>
      </PageHeader>
      <PageContent className="my-4 flex h-full grow flex-col">
        <div className="flex grow flex-col gap-4 lg:flex-row">
          <div className="flex flex-col gap-2 lg:w-72">
            <Card>
              <CardHeader>
                <CardSummary>
                  <CardTitle>Search</CardTitle>
                  <CardDescription>
                    Enter search criteria to find jobs.
                  </CardDescription>
                </CardSummary>
              </CardHeader>
              <CardContent className="p-4">
                <form>
                  <div className="mb-4 space-y-1.5">
                    <Label htmlFor="keywords">Keywords</Label>
                    <Input 
                      id="keywords"
                      placeholder="e.g. React Developer"
                    />
                  </div>
                  
                  <div className="mb-4 space-y-1.5">
                    <Label htmlFor="location">Location</Label>
                    <Input 
                      id="location"
                      placeholder="e.g. Remote, New York"
                    />
                  </div>
                  
                  <div className="mb-4 space-y-1.5">
                    <Label>Sources</Label>
                    <Select defaultValue="all">
                      <SelectTrigger>
                        <SelectValue placeholder="Select sources" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sources</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="indeed">Indeed</SelectItem>
                        <SelectItem value="glassdoor">Glassdoor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator
                    className="my-2 bg-border/60 md:my-3"
                    orientation="horizontal"
                  />

                  <div className="flex justify-end">
                    <Button className="mt-4">
                      <Search className="mr-2 size-4" />
                      Search Jobs
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="flex grow flex-col gap-2 lg:w-2/3">
            <div className="flex flex-row items-center justify-between">
              <h4 className="text-lg font-semibold">Results</h4>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <ListFilter className="mr-2 size-4" />
                  Filter
                </Button>
                <Button size="sm" variant="outline">
                  <ArrowDownToLine className="mr-2 size-4" />
                  Export
                </Button>
              </div>
            </div>

            <Tabs className="h-full grow pb-12" defaultValue="listings">
              <TabsList>
                <TabsTrigger value="listings">Job Listings</TabsTrigger>
                <TabsTrigger value="saved">Saved Jobs</TabsTrigger>
                <TabsTrigger value="history">Search History</TabsTrigger>
              </TabsList>

              <TabsContent className="grow lg:h-full" value="listings">
                <div className="flex grow flex-col items-center justify-center rounded-md border border-border bg-accent/40 p-5 shadow-inner lg:h-full">
                  <div className="flex flex-row items-start gap-2.5 rounded-md border border-border bg-background p-6 md:w-2/3">
                    <div className="pt-0.5">
                      <Briefcase className="size-6 text-primary" />
                    </div>

                    <div className="flex flex-col">
                      <h5 className="text-lg font-semibold">Job Listings</h5>
                      <p className="text-sm text-muted-foreground/70">
                        Enter search criteria and click "Search Jobs" to find job listings across multiple platforms.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent className="grow lg:h-full" value="saved">
                <div className="flex grow flex-col items-center justify-center rounded-md border border-border bg-accent/40 p-5 shadow-inner lg:h-full">
                  <div className="flex flex-row items-start gap-2.5 rounded-md border border-border bg-background p-6 md:w-2/3">
                    <div className="pt-0.5">
                      <Briefcase className="size-6 text-yellow-500" />
                    </div>

                    <div className="flex flex-col">
                      <h5 className="text-lg font-semibold">Saved Jobs</h5>
                      <p className="text-sm text-muted-foreground/70">
                        Your saved jobs will appear here.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent className="grow lg:h-full" value="history">
                <div className="flex grow flex-col items-center justify-center rounded-md border border-border bg-accent/40 p-5 shadow-inner lg:h-full">
                  <div className="flex flex-row items-start gap-2.5 rounded-md border border-border bg-background p-6 md:w-2/3">
                    <div className="pt-0.5">
                      <Search className="size-6 text-blue-500" />
                    </div>

                    <div className="flex flex-col">
                      <h5 className="text-lg font-semibold">Search History</h5>
                      <p className="text-sm text-muted-foreground/70">
                        Your previous job searches will be displayed here.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </PageContent>
    </Page>
  );
}
