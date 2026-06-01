'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { OutreachTemplateDefinition } from '@/lib/outreach/templates';

interface TemplateImportButtonProps {
  template: OutreachTemplateDefinition;
  userId: string;
}

export default function TemplateImportButton({
  template,
  userId,
}: TemplateImportButtonProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [isImported, setIsImported] = useState(false);
  const router = useRouter();

  const handleImport = async () => {
    setIsImporting(true);
    
    try {
      const response = await fetch('/api/outreach/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: template.name,
          type: template.type,
          subject: template.subject,
          content: template.content,
          variables: template.variables,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to import template');
      }

      const newTemplate = await response.json();
      setIsImported(true);
      toast.success('Template imported successfully');
      
      // Auto-redirect to edit the template after a short delay
      setTimeout(() => {
        router.push(`/outreach/templates/${newTemplate.id}/edit`);
      }, 1000);
      
    } catch (error) {
      console.error('Error importing template:', error);
      toast.error('Failed to import template');
    } finally {
      setIsImporting(false);
    }
  };

  if (isImported) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Check className="mr-2 h-4 w-4 text-green-600" />
        Imported
      </Button>
    );
  }

  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={handleImport}
      disabled={isImporting}
    >
      <Download className="mr-2 h-4 w-4" />
      {isImporting ? 'Importing...' : 'Import'}
    </Button>
  );
}