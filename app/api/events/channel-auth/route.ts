import { unauthorized } from 'next/navigation';
import { type NextRequest, NextResponse } from 'next/server';

import { eventServerClient } from '@/lib/events/clients/server';
import { parseQueryString } from '@/lib/strings';
import { getSessionUser } from '@/lib/user';

const POST = async (req: NextRequest) => {
  const user = await getSessionUser();

  if (!user?.id) {
    return unauthorized();
  }

  let channel_name: string;
  let socket_id: string;

  try {
    // Try to get content type
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      // Handle JSON body
      const body = await req.json();
      channel_name = body.channel_name;
      socket_id = body.socket_id;
    } else {
      // Handle form-urlencoded body
      const requestBody = await req.text();
      console.log('Channel auth request body:', requestBody);
      
      const parsed = parseQueryString(requestBody);
      channel_name = parsed.channel_name;
      socket_id = parsed.socket_id;
      
      console.log('Parsed params:', { channel_name, socket_id });
    }
  } catch (error) {
    console.error('Error parsing request body:', error);
    return NextResponse.json(
      { error: 'Invalid request body' }, 
      { status: 400 }
    );
  }

  if (!user.id || typeof user.id !== 'string') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!socket_id || !channel_name) {
    return NextResponse.json(
      { 
        error: 'Missing required parameters: socket_id and channel_name',
        received: { socket_id, channel_name }
      }, 
      { status: 400 }
    );
  }

  const channelAuth = eventServerClient.authorizeChannel(
    socket_id,
    channel_name,
    {
      user_id: user.id,
    },
  );

  return NextResponse.json(channelAuth);
};

export { POST };
