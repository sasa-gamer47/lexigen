import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/clerk-sdk-node';
import { createUser, deleteUser, updateUser } from '@/lib/actions/user.actions';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  console.log('route called');

  const SIGNING_SECRET = process.env.SIGNING_SECRET;
  if (!SIGNING_SECRET) {
    throw new Error('Please add SIGNING_SECRET from Clerk Dashboard to .env or .env.local');
  }

  // Get the headers (do not use await here)
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', { status: 400 });
  }

  // Get the body and verify the payload
  const payload = await req.json();
  const body = JSON.stringify(payload);
  const wh = new Webhook(SIGNING_SECRET);

  let evt: WebhookEvent;
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred', { status: 400 });
  }

  // Get the event type and handle accordingly
  const { id } = evt.data;
  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, image_url, first_name, last_name, username } = evt.data;
    console.log(evt.data);
    const user = {
      clerkId: id,
      email: email_addresses[0].email_address,
      username: username!,
      firstName: first_name,
      lastName: last_name,
      photo: image_url,
    };
    const newUser = await createUser(user);
    if (newUser) {
      await clerkClient.users.updateUserMetadata(id, {
        publicMetadata: { userId: newUser._id },
      });
    }
    return NextResponse.json({ message: 'OK', user: newUser });
  }

  if (eventType === 'user.updated') {
    const { id, image_url, first_name, last_name, username } = evt.data;
    const user = {
      firstName: first_name,
      lastName: last_name,
      username: username!,
      photo: image_url,
    };
    const updatedUser = await updateUser({ clerkId: id, user });
    return NextResponse.json({ message: 'OK', user: updatedUser });
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;
    const deletedUser = await deleteUser(id!);
    return NextResponse.json({ message: 'OK', user: deletedUser });
  }

  return new Response('', { status: 200 });
}

// Optionally, add a GET handler so that testing via GET returns a 405.
export async function GET() {
  return new Response('Method Not Allowed', { status: 405 });
}

// import { NextResponse } from 'next/server';

// console.log('runnnnnnnnnnnnnnnnnnnnnnn');


// export async function POST(req: Request) {
//   console.log('Simplified Webhook Endpoint Hit!');
//   return new NextResponse('Webhook received - simplified endpoint', { status: 200 });
// }

// export async function GET() {
//   return new Response('Method Not Allowed', { status: 405 });
// }