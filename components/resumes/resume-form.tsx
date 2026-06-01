'use client';

import type { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { Checkbox } from '../ui/checkbox';
import { FileUploadInput } from '../ui/file-upload-input';
import { Textarea } from '../ui/textarea';
import { useSession } from '@/lib/auth/client';

export const resumeFormSchema = z.object({
  description: z.string().optional(),
  name: z.string().min(2, {
    message: 'You must enter a name.',
  }),
  setDefault: z.boolean().optional(),
  url: z.string().url({
    message: 'You must upload a resume.',
  }),
});

export function ResumeForm({
  form,
}: {
  form: UseFormReturn<z.infer<typeof resumeFormSchema>, any, undefined>;
}) {
  const { data: session } = useSession();

  return (
    <div className="flex flex-col space-y-4">
      <input autoFocus className="hidden" type="text" />

      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input {...field} autoComplete="off" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Resume</FormLabel>
            <FormDescription>
              Select a PDF or Word document to upload.
            </FormDescription>
            <FormControl>
              <FileUploadInput
                {...field}
                contentTypes="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={url => field.onChange(url)}
                uploadUrlPath={`users/${session?.user.id}/resumes/`}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="setDefault"
        render={({ field }) => {
          return (
            <FormItem className="flex flex-col">
              <FormLabel>Set as default</FormLabel>
              <FormControl>
                <Checkbox
                  {...field}
                  className="size-6"
                  onCheckedChange={e => {
                    field.onChange(e);
                  }}
                />
              </FormControl>
            </FormItem>
          );
        }}
      />
    </div>
  );
}
