import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/css';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary';
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <Card className={cn('border-dashed border-2 border-border/50', className)}>
      <CardContent className="flex flex-col items-center justify-center p-12 text-center">
        {Icon && (
          <div className="mb-4 p-3 rounded-full bg-muted/30">
            <Icon className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        
        {description && (
          <p className="text-muted-foreground max-w-sm mb-6">{description}</p>
        )}
        
        {action && (
          <Button
            onClick={action.onClick}
            variant={action.variant || 'default'}
          >
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Specific empty states for common use cases
export function EmptyClients({ onAddClient }: { onAddClient: () => void }) {
  return (
    <EmptyState
      title="No clients yet"
      description="Start building your client relationships by adding your first client."
      action={{
        label: 'Add First Client',
        onClick: onAddClient,
      }}
    />
  );
}

export function EmptyProjects({ onAddProject }: { onAddProject: () => void }) {
  return (
    <EmptyState
      title="No projects yet"
      description="Create your first project to start tracking work and deliverables."
      action={{
        label: 'Create Project',
        onClick: onAddProject,
      }}
    />
  );
}

export function EmptyLeads({ onAddLead }: { onAddLead: () => void }) {
  return (
    <EmptyState
      title="No leads in pipeline"
      description="Add potential clients to your pipeline and track them through your sales process."
      action={{
        label: 'Add Lead',
        onClick: onAddLead,
      }}
    />
  );
}

export function EmptyTimeEntries({ onStartTimer }: { onStartTimer: () => void }) {
  return (
    <EmptyState
      title="No time entries yet"
      description="Start tracking your work time to monitor productivity and bill clients accurately."
      action={{
        label: 'Start Timer',
        onClick: onStartTimer,
      }}
    />
  );
}

export function EmptyInvoices({ onCreateInvoice }: { onCreateInvoice: () => void }) {
  return (
    <EmptyState
      title="No invoices created"
      description="Create invoices for your completed work and track payments from clients."
      action={{
        label: 'Create Invoice',
        onClick: onCreateInvoice,
      }}
    />
  );
}

export function EmptySearch({ searchTerm }: { searchTerm: string }) {
  return (
    <EmptyState
      title={`No results for "${searchTerm}"`}
      description="Try adjusting your search terms or filters to find what you're looking for."
    />
  );
}

export function EmptyData() {
  return (
    <EmptyState
      title="No data available"
      description="There's nothing to show here right now."
    />
  );
}