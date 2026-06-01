import { auth } from '@/lib/auth/server';
import { headers } from 'next/headers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Calculator,
  DollarSign,
  TrendingUp,
  FileText,
  Download,
  Settings,
  Info,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

export default async function FeeCalculatorPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  const industryBenchmarks = [
    { role: "Junior Developer", min: 70000, max: 95000, avg: 82500 },
    { role: "Mid-level Developer", min: 95000, max: 130000, avg: 112500 },
    { role: "Senior Developer", min: 130000, max: 170000, avg: 150000 },
    { role: "Lead Developer", min: 160000, max: 200000, avg: 180000 },
    { role: "Principal Engineer", min: 190000, max: 250000, avg: 220000 },
    { role: "Engineering Manager", min: 150000, max: 200000, avg: 175000 },
    { role: "Senior Manager", min: 180000, max: 230000, avg: 205000 },
    { role: "Director", min: 200000, max: 300000, avg: 250000 }
  ];

  const feeStructures = [
    {
      type: "Contingency",
      description: "Fee paid only upon successful placement",
      percentage: "15-25%",
      pros: ["No upfront cost", "Risk-free for client", "Performance-based"],
      cons: ["Higher percentage", "No guarantee of payment"],
      bestFor: "Standard placements, new clients"
    },
    {
      type: "Retained",
      description: "Fee paid in installments throughout search",
      percentage: "20-33%",
      pros: ["Guaranteed payment", "Exclusive search", "Higher priority"],
      cons: ["Upfront investment", "Client commitment required"],
      bestFor: "Executive roles, specialized positions"
    },
    {
      type: "Flat Fee",
      description: "Fixed fee regardless of salary",
      percentage: "Fixed $",
      pros: ["Predictable cost", "Simple structure", "Good for high salaries"],
      cons: ["Less flexible", "May not scale with market"],
      bestFor: "High-volume recruiting, specific budgets"
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Recruiting Fee Calculator</h1>
          <p className="text-muted-foreground">Calculate competitive fees and generate client proposals</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export Quote
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calculator */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Calculator */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Fee Calculator
              </CardTitle>
              <CardDescription>
                Enter position details to calculate recruiting fees
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Position Details */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="position">Position Level</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select position level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="junior">Junior Developer</SelectItem>
                      <SelectItem value="mid">Mid-level Developer</SelectItem>
                      <SelectItem value="senior">Senior Developer</SelectItem>
                      <SelectItem value="lead">Lead Developer</SelectItem>
                      <SelectItem value="principal">Principal Engineer</SelectItem>
                      <SelectItem value="manager">Engineering Manager</SelectItem>
                      <SelectItem value="senior-manager">Senior Manager</SelectItem>
                      <SelectItem value="director">Director</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sf">San Francisco Bay Area</SelectItem>
                      <SelectItem value="nyc">New York City</SelectItem>
                      <SelectItem value="seattle">Seattle</SelectItem>
                      <SelectItem value="austin">Austin</SelectItem>
                      <SelectItem value="denver">Denver</SelectItem>
                      <SelectItem value="remote">Remote</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Salary Input */}
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="salary-min">Minimum Salary</Label>
                    <Input 
                      id="salary-min" 
                      type="number" 
                      placeholder="130000"
                      defaultValue="130000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salary-max">Maximum Salary</Label>
                    <Input 
                      id="salary-max" 
                      type="number" 
                      placeholder="170000"
                      defaultValue="170000"
                    />
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900">Market Data</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Senior Developer in SF Bay Area: $130K - $170K (avg: $150K)
                  </p>
                </div>
              </div>

              {/* Fee Structure */}
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fee-type">Fee Structure</Label>
                    <Select defaultValue="contingency">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contingency">Contingency</SelectItem>
                        <SelectItem value="retained">Retained</SelectItem>
                        <SelectItem value="flat">Flat Fee</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fee-percentage">Fee Percentage</Label>
                    <Input 
                      id="fee-percentage" 
                      type="number" 
                      placeholder="20"
                      defaultValue="20"
                      min="10"
                      max="35"
                    />
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
                <h3 className="text-lg font-semibold text-green-900 mb-4">Fee Calculation Results</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">$26,000</div>
                    <div className="text-sm text-green-700">Minimum Fee</div>
                    <div className="text-xs text-green-600">$130K × 20%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">$30,000</div>
                    <div className="text-sm text-green-700">Average Fee</div>
                    <div className="text-xs text-green-600">$150K × 20%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">$34,000</div>
                    <div className="text-sm text-green-700">Maximum Fee</div>
                    <div className="text-xs text-green-600">$170K × 20%</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fee Structure Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Fee Structure Comparison</CardTitle>
              <CardDescription>
                Choose the best fee structure for your client and position
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feeStructures.map((structure, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">{structure.type}</h4>
                        <p className="text-sm text-muted-foreground">{structure.description}</p>
                      </div>
                      <Badge variant="outline">{structure.percentage}</Badge>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h5 className="text-sm font-medium text-green-700 mb-2">Advantages</h5>
                        <ul className="text-sm space-y-1">
                          {structure.pros.map((pro, proIndex) => (
                            <li key={proIndex} className="flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-red-700 mb-2">Considerations</h5>
                        <ul className="text-sm space-y-1">
                          {structure.cons.map((con, conIndex) => (
                            <li key={conIndex} className="flex items-center gap-2">
                              <AlertCircle className="h-3 w-3 text-red-500" />
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm">
                        <span className="font-medium">Best for:</span> {structure.bestFor}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Proposal Generator */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Client Proposal
              </CardTitle>
              <CardDescription>
                Generate a professional fee proposal for your client
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Proposal Summary</h4>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span>Position:</span>
                    <span className="font-medium">Senior Full Stack Developer</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Salary Range:</span>
                    <span className="font-medium">$130,000 - $170,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fee Structure:</span>
                    <span className="font-medium">20% Contingency</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expected Fee:</span>
                    <span className="font-medium text-green-600">$26,000 - $34,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Timeline:</span>
                    <span className="font-medium">4-6 weeks</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1">
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Full Proposal
                </Button>
                <Button variant="outline" className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Market Benchmarks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Market Benchmarks
              </CardTitle>
              <CardDescription>
                Current salary ranges by position level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {industryBenchmarks.map((benchmark, index) => (
                  <div key={index} className="border-b pb-3 last:border-b-0">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-sm">{benchmark.role}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ${benchmark.min.toLocaleString()} - ${benchmark.max.toLocaleString()}
                    </div>
                    <div className="text-xs text-green-600 font-medium">
                      Avg: ${benchmark.avg.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Fee Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle>Fee Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Industry Standards</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Contingency: 15-25%</li>
                    <li>• Retained: 20-33%</li>
                    <li>• Executive: 25-35%</li>
                  </ul>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-2">Pricing Factors</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Position difficulty</li>
                    <li>• Market competition</li>
                    <li>• Client relationship</li>
                    <li>• Timeline urgency</li>
                    <li>• Exclusive vs. non-exclusive</li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Negotiation Tips</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Start with value proposition</li>
                    <li>• Highlight specialization</li>
                    <li>• Offer payment terms</li>
                    <li>• Include guarantees</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Calculator className="mr-2 h-4 w-4" />
                Save Calculation
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Email Proposal
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <DollarSign className="mr-2 h-4 w-4" />
                Track Fee Status
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Settings className="mr-2 h-4 w-4" />
                Custom Templates
              </Button>
            </CardContent>
          </Card>

          {/* Recent Calculations */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Calculations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">Senior Developer</div>
                    <div className="text-muted-foreground">TechFlow Solutions</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">$30K</div>
                    <div className="text-muted-foreground">20%</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">Lead Engineer</div>
                    <div className="text-muted-foreground">CloudSync Inc</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">$36K</div>
                    <div className="text-muted-foreground">18%</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">Principal Engineer</div>
                    <div className="text-muted-foreground">DataViz Pro</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">$55K</div>
                    <div className="text-muted-foreground">25%</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
