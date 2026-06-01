'use client';

import { Button } from '@/components/ui/button';

const ShowToastButton = ({
  userChannel,
  action,
}: {
  action: (formData: FormData) => void;
  userChannel: string;
  userId: string;
}) => {
  // const { toast } = useToast();

  return (
    <form action={action}>
      <input name="userChannel" type="hidden" value={userChannel} />
      <Button
        // onClick={() => {
        //   toast({
        //     description: 'This is a toast',
        //     title: 'Hello',
        //   });
        // }}
        type="submit"
      >
        Show toast
      </Button>{' '}
    </form>
  );
};
ShowToastButton.displayName = 'ShowToastButton';

export default ShowToastButton;
