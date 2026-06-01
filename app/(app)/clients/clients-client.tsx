'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NewClientModal } from '@/components/clients/new-client-modal';
import { EmptyClientsWrapper } from '@/components/clients/empty-clients-wrapper';
import {
  Building2,
  DollarSign,
  FolderOpen,
  Plus,
  Users,
  TrendingUp,
  Mail,
  Phone,
  Globe
} from 'lucide-react';

interface ClientsClientProps {
  clients: any[];
  stats: any;
}

export function ClientsClient({ clients, stats }: ClientsClientProps) {
  const [showNewClientModal, setShowNewClientModal] = useState(false);

  const statusColors = {
    PROSPECT: 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200',
    LEAD: 'bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-200',
    ACTIVE: 'bg-green-100 dark:bg-green-950/50 text-green-800 dark:text-green-200',
    INACTIVE: 'bg-yellow-100 dark:bg-yellow-950/50 text-yellow-800 dark:text-yellow-200',
    CHURNED: 'bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-200',
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="text-muted-foreground">Manage your client relationships</p>
        </div>
        <Button onClick={() => setShowNewClientModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeClients}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalRevenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProjects}</div>
          </CardContent>
        </Card>
      </div>

      {/* Clients List */}
      <div className="grid gap-4">
        {clients.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No clients yet</h2>
              <p className="text-muted-foreground mb-4">
                Start by adding your first client
              </p>
              <Button onClick={() => setShowNewClientModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Client
              </Button>
            </CardContent>
          </Card>
        ) : (
          clients.map((client) => (
            <Card key={client.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Link
                        href={`/clients/${client.id}`}
                        className="hover:underline"
                      >
                        {client.name}
                      </Link>
                      <Badge className={statusColors[client.status]}>
                        {client.status}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {client.industry && (
                        <span className="mr-4">{client.industry}</span>
                      )}
                      <span className="text-sm">
                        {client._count.projects} projects ·
                        {client._count.proposals} proposals ·
                        {client._count.invoices} invoices
                      </span>
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    {client.totalRevenue > 0 && (
                      <div className="flex items-center text-green-600 dark:text-green-400">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-semibold">
                          {client.totalRevenue.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  {client.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {client.email}
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {client.phone}
                    </div>
                  )}
                  {client.website && (
                    <div className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      {client.website}
                    </div>
                  )}
                </div>
                {client.projects.length > 0 && (
                  <div className="mt-3 flex gap-2">
                    {client.projects.slice(0, 3).map((project) => (
                      <Badge key={project.id} variant="outline">
                        {project.name}
                      </Badge>
                    ))}
                    {client.projects.length > 3 && (
                      <Badge variant="outline">
                        +{client.projects.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* New Client Modal */}
      <NewClientModal
        open={showNewClientModal}
        onOpenChange={setShowNewClientModal}
      />
    </div>
  );
}