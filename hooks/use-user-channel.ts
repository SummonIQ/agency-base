import type { Channel, PresenceChannel } from 'pusher-js';
import { useEffect, useState } from 'react';

import { useChannels } from '@/hooks/use-channels';
import { useSession } from '@/lib/auth/client';
import { getPrivateUserChannel } from '@/lib/events/channels';

/**
 * Subscribe to a channel
 *
 * @param channelName The name of the channel you want to subscribe to.
 * @typeparam T Type of channel you're subscribing to. Can be one of `Channel` or `PresenceChannel` from `pusher-js`.
 * @returns Instance of the channel you just subscribed to.
 *
 * @example
 * ```tsx
 * const channel = useChannel("my-channel")
 * channel.bind('some-event', () => {})
 * ```
 */
export function useUserChannel<T extends Channel & PresenceChannel>():
  | T
  | undefined {
  const [channel, setChannel] = useState<T | undefined>(undefined);
  const { subscribe, unsubscribe } = useChannels();
  const { data: session } = useSession();
  const userChannel = session?.user?.id
    ? getPrivateUserChannel(session.user.id)
    : undefined;

  useEffect(() => {
    if (!userChannel || !subscribe || !unsubscribe) return;

    const _channel = subscribe<T>(userChannel);
    setChannel(_channel);
    return () => unsubscribe(userChannel);
  }, [userChannel, subscribe, unsubscribe]);

  return channel;
}
