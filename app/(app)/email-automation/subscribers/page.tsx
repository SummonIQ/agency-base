import { auth } from '@/lib/auth/server';
import { headers } from 'next/headers';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Users,
  Plus,
  Upload,
  Download,
  Search,
  Filter,
  UserCheck,
  UserX,
  Mail,
  Calendar,
  Tag,
  MoreVertical
} from 'lucide-react';

export default async function EmailSubscribersPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  // Mock data for subscribers
  const subscribers = [
    {
      id: '1',
      email: 'john.doe@example.com',
      name: 'John Doe',
      status: 'active',
      lists: ['newsletter', 'product-updates'],
      subscribedAt: new Date('2024-01-15'),
      lastActivity: new Date('2024-06-20'),
    },
    {
      id: '2',
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      status: 'active',
      lists: ['newsletter'],
      subscribedAt: new Date('2024-02-20'),
      lastActivity: new Date('2024-06-19'),
    },
    {
      id: '3',
      email: 'bob.johnson@example.com',
      name: 'Bob Johnson',
      status: 'unsubscribed',
      lists: [],
      subscribedAt: new Date('2024-03-10'),
      lastActivity: new Date('2024-05-15'),
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'unsubscribed':
        return 'bg-red-100 text-red-800';
      case 'bounced':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getListColor = (index: number) => {
    const colors = ['bg-purple-100 text-purple-800', 'bg-blue-100 text-blue-800', 'bg-green-100 text-green-800'];
    return colors[index % colors.length];
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Email Subscribers</h1>
          <p className="text-muted-foreground">Manage your email subscriber list</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Link href="/email-automation/subscribers/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Subscriber
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscribers.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscribers.filter(s => s.status === 'active').length}
            </div>
            <p className="text-xs text-green-600">+12% this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unsubscribed</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscribers.filter(s => s.status === 'unsubscribed').length}
            </div>
            <p className="text-xs text-muted-foreground">1.2% rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lists</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Subscriber lists</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search subscribers by email or name..."
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Subscribers Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="text-left p-4">
                    <input type="checkbox" className="rounded" />
                  </th>
                  <th className="text-left p-4">Subscriber</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Lists</th>
                  <th className="text-left p-4">Subscribed</th>
                  <th className="text-left p-4">Last Activity</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <input type="checkbox" className="rounded" />
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{subscriber.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {subscriber.email}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={getStatusColor(subscriber.status)}>
                        {subscriber.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1 flex-wrap">
                        {subscriber.lists.map((list, index) => (
                          <Badge key={list} variant="secondary" className={`text-xs ${getListColor(index)}`}>
                            {list}
                          </Badge>
                        ))}
                        {subscriber.lists.length === 0 && (
                          <span className="text-sm text-muted-foreground">No lists</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {subscriber.subscribedAt.toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-muted-foreground">
                        {subscriber.lastActivity.toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {subscribers.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No subscribers yet</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Start building your email list by adding subscribers
            </p>
            <div className="flex gap-2">
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Import List
              </Button>
              <Link href="/email-automation/subscribers/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Subscriber
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}