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
  Users,
  Plus,
  Download,
  Upload,
  Search,
  Filter,
  Star,
  Building,
  Phone,
  Mail,
  Linkedin,
  Github,
  MapPin,
  Briefcase,
  Calendar,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

export default async function NetworkMappingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  const networkContacts = [
    {
      id: 1,
      name: "Alex Rodriguez",
      company: "Meta",
      role: "Senior Engineering Manager",
      relationship: "Former Colleague",
      strength: "strong",
      lastContact: "2024-08-15",
      contactType: "candidate",
      skills: ["React", "Node.js", "Team Leadership"],
      notes: "Led my team at previous company. Great technical leader.",
      email: "alex.rodriguez@meta.com",
      linkedin: "linkedin.com/in/alexrodriguez",
      phone: "(555) 123-4567"
    },
    {
      id: 2,
      name: "Sarah Kim",
      company: "Stripe",
      role: "VP of Engineering",
      relationship: "Former Manager",
      strength: "strong",
      lastContact: "2024-09-01",
      contactType: "referral",
      skills: ["Leadership", "Scaling Teams", "Fintech"],
      notes: "My former manager. Great network of senior engineers.",
      email: "sarah.kim@stripe.com",
      linkedin: "linkedin.com/in/sarahkim",
      phone: "(555) 234-5678"
    },
    {
      id: 3,
      name: "David Chen",
      company: "Freelancer",
      role: "Full Stack Developer",
      relationship: "Freelance Partner",
      strength: "medium",
      lastContact: "2024-07-20",
      contactType: "candidate",
      skills: ["Vue.js", "Python", "AWS"],
      notes: "Reliable freelancer. Looking for full-time opportunities.",
      email: "david.chen@gmail.com",
      linkedin: "linkedin.com/in/davidchen",
      phone: "(555) 345-6789"
    }
  ];

  const relationshipTypes = [
    { value: "former-colleague", label: "Former Colleague", count: 15 },
    { value: "former-manager", label: "Former Manager", count: 3 },
    { value: "current-client", label: "Current Client", count: 8 },
    { value: "freelance-partner", label: "Freelance Partner", count: 12 },
    { value: "bootcamp-connection", label: "Bootcamp Connection", count: 6 },
    { value: "meetup-contact", label: "Meetup Contact", count: 9 },
    { value: "industry-contact", label: "Industry Contact", count: 7 }
  ];

  const strengthLevels = [
    { value: "strong", label: "Strong", description: "Close relationship, regular contact", color: "bg-green-500" },
    { value: "medium", label: "Medium", description: "Good relationship, occasional contact", color: "bg-yellow-500" },
    { value: "weak", label: "Weak", description: "Distant relationship, rare contact", color: "bg-red-500" }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Network Mapping</h1>
          <p className="text-muted-foreground">Map and leverage your professional network for recruiting success</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import CSV
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Contact
          </Button>
        </div>
      </div>

      {/* Network Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">60</div>
              <div className="text-sm text-muted-foreground">Total Contacts</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">23</div>
              <div className="text-sm text-muted-foreground">Strong Relationships</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">28</div>
              <div className="text-sm text-muted-foreground">Potential Candidates</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">15</div>
              <div className="text-sm text-muted-foreground">Referral Sources</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <Input placeholder="Search contacts..." className="w-full" />
                </div>
                <Button variant="outline">
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </div>
              
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline">All (60)</Badge>
                <Badge variant="secondary">Strong (23)</Badge>
                <Badge variant="outline">Candidates (28)</Badge>
                <Badge variant="outline">Referrals (15)</Badge>
                <Badge variant="outline">Recent Contact (12)</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Contact List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Network Contacts
              </CardTitle>
              <CardDescription>
                Your professional network mapped for recruiting opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {networkContacts.map((contact) => (
                  <div key={contact.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{contact.name}</h3>
                          <div className={`w-3 h-3 rounded-full ${
                            contact.strength === 'strong' ? 'bg-green-500' :
                            contact.strength === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                          <Badge variant={contact.contactType === 'candidate' ? 'default' : 'secondary'}>
                            {contact.contactType === 'candidate' ? 'Candidate' : 'Referral Source'}
                          </Badge>
                        </div>
                        
                        <div className="grid gap-2 md:grid-cols-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <span>{contact.company}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                            <span>{contact.role}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{contact.relationship}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>Last contact: {contact.lastContact}</span>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-3">
                          {contact.skills.map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>

                        <p className="text-sm text-muted-foreground mt-2">{contact.notes}</p>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Phone className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Mail className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Linkedin className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Edit Contact
                        </Button>
                        <Button size="sm" variant="outline">
                          Log Interaction
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        {contact.contactType === 'candidate' ? (
                          <Button size="sm">
                            <Target className="mr-1 h-3 w-3" />
                            Reach Out
                          </Button>
                        ) : (
                          <Button size="sm">
                            <TrendingUp className="mr-1 h-3 w-3" />
                            Request Referral
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Add Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Quick Add Contact
              </CardTitle>
              <CardDescription>
                Quickly add a new contact to your network
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input id="name" placeholder="John Smith" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" placeholder="Google" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" placeholder="Senior Developer" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="relationship">Relationship</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="former-colleague">Former Colleague</SelectItem>
                      <SelectItem value="former-manager">Former Manager</SelectItem>
                      <SelectItem value="current-client">Current Client</SelectItem>
                      <SelectItem value="freelance-partner">Freelance Partner</SelectItem>
                      <SelectItem value="bootcamp-connection">Bootcamp Connection</SelectItem>
                      <SelectItem value="meetup-contact">Meetup Contact</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="strength">Relationship Strength</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select strength" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="strong">Strong</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="weak">Weak</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-type">Contact Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="candidate">Potential Candidate</SelectItem>
                      <SelectItem value="referral">Referral Source</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2 mt-4">
                <Label htmlFor="notes">Notes</Label>
                <Textarea 
                  id="notes" 
                  placeholder="How you know them, their interests, potential opportunities..."
                  rows={3}
                />
              </div>

              <Button className="w-full mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Add Contact
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Network Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Network Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {relationshipTypes.map((type, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm">{type.label}</span>
                    <Badge variant="outline">{type.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Relationship Strength Guide */}
          <Card>
            <CardHeader>
              <CardTitle>Relationship Strength</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {strengthLevels.map((level, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full ${level.color} mt-1`} />
                    <div>
                      <div className="font-medium text-sm">{level.label}</div>
                      <div className="text-xs text-muted-foreground">{level.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Action Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <span>5 contacts need follow-up</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>12 recent interactions logged</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-blue-500" />
                  <span>8 warm introductions available</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Outreach Templates */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Templates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                Recruiting Opportunity
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                Referral Request
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                Catch Up Message
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                Industry Update
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
