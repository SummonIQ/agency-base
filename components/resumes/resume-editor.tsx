'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { Resume } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';

import {
  ResponsiveDialog,
  ResponsiveDialogContainer,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from '@/components/ui/responsive-dialog';

import { Button } from '../ui/button';
import { Form } from '../ui/form';
import { ResumeForm, resumeFormSchema } from './resume-form';

interface ResumeEditorProps {
  action: (data: z.infer<typeof resumeFormSchema>) => Promise<Resume>;
  isOpen?: boolean;
  label?: string;
  onDelete?: (jobId: string) => void;
  setIsOpen?: (open: boolean) => void;
  showTrigger?: boolean;
}

export function ResumeEditor({
  action,
  label,
  isOpen,
  setIsOpen,
  showTrigger = true,
}: ResumeEditorProps) {
  const router = useRouter();
  const form = useForm<z.infer<typeof resumeFormSchema>>({
    defaultValues: {
      description: '',
      name: '',
      setDefault: false,
      url: undefined,
    },
    resolver: zodResolver(resumeFormSchema),
  });
  const [open, setOpen] = useState(isOpen);
  const [inProgress, setInProgress] = useState(false);

  const onSubmit = async (values: z.infer<typeof resumeFormSchema>) => {
    setInProgress(true);

    const { description, name, url, setDefault } = values;

    await action({
      description,
      name,
      setDefault,
      url,
    });

    setInProgress(false);
    setOpen(false);
    setIsOpen?.(false);
    form.reset();
    router.refresh();
  };

  return (
    <ResponsiveDialog
      onOpenChange={setIsOpen ? setIsOpen : setOpen}
      open={isOpen ?? open}
    >
      {showTrigger && (
        <ResponsiveDialogTrigger>
          <Button size="sm">{label ?? 'New Resume'}</Button>
        </ResponsiveDialogTrigger>
      )}

      <ResponsiveDialogContainer>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ResponsiveDialogHeader>
              <ResponsiveDialogTitle>New Resume</ResponsiveDialogTitle>
              <ResponsiveDialogDescription>
                Upload a new resume for analysis.
              </ResponsiveDialogDescription>
            </ResponsiveDialogHeader>

            <ResponsiveDialogContent>
              <ResumeForm form={form} />
            </ResponsiveDialogContent>

            <ResponsiveDialogFooter>
              <Button
                disabled={inProgress}
                onClick={e => {
                  e.preventDefault();
                  setOpen(false);
                }}
                variant="outline"
              >
                Cancel
              </Button>

              <Button inProgress={inProgress} type="submit">
                {inProgress ? 'Saving...' : 'Save'}
              </Button>
            </ResponsiveDialogFooter>
          </form>
        </Form>
      </ResponsiveDialogContainer>
    </ResponsiveDialog>
  );
}
