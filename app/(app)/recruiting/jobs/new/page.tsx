import { auth } from '@/lib/auth/server';
import { headers } from 'next/headers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Briefcase,
  Building,
  DollarSign,
  MapPin,
  Users,
  Clock,
  Target,
  Plus,
  X,
  Save,
  Send
} from 'lucide-react';

export default async function NewJobPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">New Job Requisition</h1>
          <p className="text-muted-foreground">Create a detailed job posting for client approval</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          <Button>
            <Send className="mr-2 h-4 w-4" />
            Submit for Approval
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Job Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title *</Label>
                  <Input id="title" placeholder="e.g., Senior Full Stack Developer" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="product">Product</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="data">Data</SelectItem>
                      <SelectItem value="devops">DevOps</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="level">Level *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="junior">Junior (0-2 years)</SelectItem>
                      <SelectItem value="mid">Mid-level (2-5 years)</SelectItem>
                      <SelectItem value="senior">Senior (5-8 years)</SelectItem>
                      <SelectItem value="lead">Lead (8+ years)</SelectItem>
                      <SelectItem value="principal">Principal (10+ years)</SelectItem>
                      <SelectItem value="executive">Executive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employment-type">Employment Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="contract-to-hire">Contract-to-hire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" placeholder="e.g., San Francisco, CA" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="remote">Remote Policy</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select remote policy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">On-site only</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="full">Fully remote</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compensation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Compensation & Benefits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="salary-min">Minimum Salary</Label>
                  <Input id="salary-min" type="number" placeholder="120000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary-max">Maximum Salary</Label>
                  <Input id="salary-max" type="number" placeholder="150000" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="equity" className="rounded" />
                  <Label htmlFor="equity">Equity offered</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="bonus" className="rounded" />
                  <Label htmlFor="bonus">Bonus eligible</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="benefits" className="rounded" />
                  <Label htmlFor="benefits">Full benefits</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="additional-benefits">Additional Benefits</Label>
                <Textarea 
                  id="additional-benefits" 
                  placeholder="e.g., Unlimited PTO, $5K learning budget, top-tier health insurance..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Technical Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Technical Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Required Skills *</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge variant="secondary">React <X className="ml-1 h-3 w-3" /></Badge>
                  <Badge variant="secondary">Node.js <X className="ml-1 h-3 w-3" /></Badge>
                  <Badge variant="secondary">TypeScript <X className="ml-1 h-3 w-3" /></Badge>
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Add required skill..." className="flex-1" />
                  <Button size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Preferred Skills</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge variant="outline">AWS <X className="ml-1 h-3 w-3" /></Badge>
                  <Badge variant="outline">GraphQL <X className="ml-1 h-3 w-3" /></Badge>
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Add preferred skill..." className="flex-1" />
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="min-experience">Minimum Experience (years)</Label>
                  <Input id="min-experience" type="number" placeholder="5" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="education">Education Requirements</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select requirement" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No specific requirement</SelectItem>
                      <SelectItem value="bootcamp">Bootcamp or equivalent</SelectItem>
                      <SelectItem value="bachelors">Bachelor's degree</SelectItem>
                      <SelectItem value="masters">Master's degree</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Overview</Label>
                <Textarea 
                  id="description" 
                  placeholder="Brief overview of the role and what makes it exciting..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsibilities">Key Responsibilities</Label>
                <Textarea 
                  id="responsibilities" 
                  placeholder="• Build and maintain scalable web applications&#10;• Collaborate with product and design teams&#10;• Mentor junior developers..."
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="qualifications">Qualifications</Label>
                <Textarea 
                  id="qualifications" 
                  placeholder="• 5+ years of full-stack development experience&#10;• Strong proficiency in React and Node.js&#10;• Experience with cloud platforms (AWS preferred)..."
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nice-to-have">Nice to Have</Label>
                <Textarea 
                  id="nice-to-have" 
                  placeholder="• Experience with microservices architecture&#10;• Previous startup experience&#10;• Open source contributions..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="client">Client *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="techflow">TechFlow Solutions</SelectItem>
                    <SelectItem value="cloudsync">CloudSync Inc</SelectItem>
                    <SelectItem value="dataviz">DataViz Pro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hiring-manager">Hiring Manager</Label>
                <Input id="hiring-manager" placeholder="Contact name" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="target-start">Target Start Date</Label>
                <Input id="target-start" type="date" />
              </div>
            </CardContent>
          </Card>

          {/* Recruiting Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Recruiting Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fee-percentage">Fee Percentage</Label>
                  <Input id="fee-percentage" type="number" placeholder="20" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fee-type">Fee Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contingency">Contingency</SelectItem>
                      <SelectItem value="retained">Retained</SelectItem>
                      <SelectItem value="flat">Flat Fee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Estimated Fee</Label>
                <div className="text-2xl font-bold text-green-600">$27,000</div>
                <p className="text-sm text-muted-foreground">
                  Based on $135K average salary × 20%
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="sourcing-notes">Sourcing Notes</Label>
                <Textarea 
                  id="sourcing-notes" 
                  placeholder="Special requirements, sourcing strategies, client preferences..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Expected Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Sourcing & Outreach</span>
                  <span className="text-muted-foreground">1-2 weeks</span>
                </div>
                <div className="flex justify-between">
                  <span>Initial Screening</span>
                  <span className="text-muted-foreground">2-3 weeks</span>
                </div>
                <div className="flex justify-between">
                  <span>Client Interviews</span>
                  <span className="text-muted-foreground">3-4 weeks</span>
                </div>
                <div className="flex justify-between">
                  <span>Offer & Negotiation</span>
                  <span className="text-muted-foreground">4-5 weeks</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total Timeline</span>
                  <span>4-5 weeks</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
