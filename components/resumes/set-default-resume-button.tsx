'use client';

import { StarFilledIcon, StarIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { cn } from '@/lib/css';

import { Button } from '../ui/button';

interface SetDefaultResumeButtonProps {
  isDefault?: boolean;
  resumeId: string;
  save: (resumeId: string) => Promise<void>;
}

const SetDefaultResumeButton = ({
  resumeId,
  isDefault: isDefaultResume,
  save,
}: SetDefaultResumeButtonProps) => {
  const [isPending, startTransition] = useTransition();
  const [isDefault, setIsDefault] = useState(isDefaultResume);
  const router = useRouter();

  return (
    <form
      action={formData => {
        const resumeId = formData.get('resumeId') as string;
        startTransition(async () => {
          if (!isDefault) {
            await save(resumeId);
            setIsDefault(true);
          }

          router.refresh();
        });
      }}
      className="size-full"
    >
      <input name="resumeId" type="hidden" value={resumeId} />

      <Button
        className={cn(
          'space-x-0 place-self-start text-primary/70 shadow-sm shadow-blue-300/0 ring ring-transparent ring-offset-0 drop-shadow-sm transition-all duration-300 hover:border-blue-500/30 hover:bg-primary/15 hover:text-primary hover:shadow-lg hover:shadow-blue-500/20',
          isDefault
            ? 'border-blue-400/20 text-primary drop-shadow-none hover:border-blue-500/20 hover:bg-primary/10 hover:text-primary hover:shadow-blue-500/20'
            : 'border-blue-400',
        )}
        disabled={isPending}
        type="submit"
        variant="outline"
      >
        {isDefault ? (
          <StarFilledIcon className="!size-4" />
        ) : (
          <StarIcon className="!size-4" />
        )}

        <span className="text-sm font-semibold">
          {isPending ? 'Updating...' : isDefault ? 'Default' : 'Set as default'}
        </span>
      </Button>
    </form>
  );
};
SetDefaultResumeButton.displayName = 'SetDefaultResumeButton';

export { SetDefaultResumeButton };
