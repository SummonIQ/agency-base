'use client';

import { pusherClient } from '@/lib/pusher/client';

export function ConnectionStatus() {
  const connected = pusherClient.connection.state === 'connected';

  return (
    <div className="inline-flex flex-row items-center space-x-2 rounded-sm">
      {connected ? (
        <>
          <div className="h-3 w-3 rounded-full bg-green-500" />
          <span className="text-sm font-medium">Live</span>
        </>
      ) : (
        <>
          <div className="h-3 w-3 rounded-full bg-red-500" />
          <span className="text-sm font-medium ">Not Live</span>
        </>
      )}
    </div>
  );
}
