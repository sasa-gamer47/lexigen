import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/clerk-sdk-node';
import { createUser, deleteUser, updateUser } from '@/lib/actions/user.actions'; // Assuming these are in '@/lib/actions/user.actions'
import { clerkClient } from '@clerk/clerk-sdk-node';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  console.log('Webhook route called'); // More informative log

  const SIGNING_SECRET = process.env.SIGNING_SECRET;
  if (!SIGNING_SECRET) {
    console.error('SIGNING_SECRET is not set in environment variables!'); // Log missing secret
    return new Response('Error: Missing SIGNING_SECRET', { status: 500 }); // Return 500 for server config issue
  }

  // Get the Svix headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // Check for missing Svix headers - return 400 for bad request
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('Missing Svix headers'); // Log missing headers
    return new Response('Error: Missing svix headers', { status: 400 });
  }

  // Get the webhook payload body
  const payload = await req.json();
  const body = JSON.stringify(payload);
  const wh = new Webhook(SIGNING_SECRET);

  let evt: WebhookEvent;
  // Verify the webhook signature - catch and handle verification errors
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Webhook verification error:', err); // Log the verification error for debugging
    return new Response('Error: Webhook verification failed', { status: 400 }); // Return 400 for verification failure
  }

  const eventType = evt.type;

  // User Created Event
  if (eventType === 'user.created') {
    const { id, email_addresses, image_url, first_name, last_name, username } = evt.data;
    console.log('User Created Webhook Data:', evt.data); // Log the user data for debugging

    // Safely get email address and username, provide defaults if necessary
    const email = email_addresses && email_addresses.length > 0 ? email_addresses[0].email_address : ''; // Default email if not present
    const safeUsername = username || 'default_username'; // Default username if not present

    const user = {
      clerkId: id,
      email: email,
      username: safeUsername,
      firstName: first_name,
      lastName: last_name,
      photo: image_url,
    };

    let newUser;
    try {
      newUser = await createUser(user); // Call createUser action
      if (!newUser) {
        console.error('createUser action failed to create user in database.'); // Log if createUser returns null/undefined
        return new NextResponse('Error: User creation failed in database', { status: 500 }); // Return 500 if database creation fails
      }
    } catch (dbError) {
      console.error('Error in createUser action:', dbError); // Log database error
      return new NextResponse('Error: Database error during user creation', { status: 500 }); // Return 500 for database error
    }


    try {
      await clerkClient.users.updateUserMetadata(id, {
        publicMetadata: { userId: newUser._id },
      }); // Update Clerk metadata
    } catch (metadataError) {
      console.error('Error updating user metadata in Clerk:', metadataError); // Log metadata update error
      // Decide how critical metadata update failure is. For now, logging and continuing.
      // You might want to handle this differently based on your app's requirements.
    }

    return NextResponse.json({ message: 'User created successfully', user: newUser }); // Return success response

  }

  // User Updated Event
  if (eventType === 'user.updated') {
    const { id, image_url, first_name, last_name, username } = evt.data;
    console.log('User Updated Webhook Data:', evt.data); // Log updated user data

    // Safely handle potentially missing username
    const safeUsername = username || 'default_username'; // Default username if not present

    const user = {
      firstName: first_name,
      lastName: last_name,
      username: safeUsername,
      photo: image_url,
    };

    let updatedUser;
    try {
      updatedUser = await updateUser({ clerkId: id, user }); // Call updateUser action
      if (!updatedUser) {
        console.error('updateUser action failed or user not found.'); // Log if updateUser fails or user not found
        return new NextResponse('Error: User update failed or user not found in database', { status: 500 }); // Return 500 if update fails
      }
    } catch (dbError) {
      console.error('Error in updateUser action:', dbError); // Log database error
      return new NextResponse('Error: Database error during user update', { status: 500 }); // Return 500 for database error
    }
    return NextResponse.json({ message: 'User updated successfully', user: updatedUser }); // Return success response
  }

  // User Deleted Event
  if (eventType === 'user.deleted') {
    const { id } = evt.data;
    console.log('User Deleted Webhook Data:', evt.data); // Log deleted user data

    let deletedUser;
    try {
      deletedUser = await deleteUser(id!); // Call deleteUser action
      if (!deletedUser) {
        console.error('deleteUser action failed or user not found.'); // Log if deleteUser fails or user not found
        return new NextResponse('Error: User deletion failed or user not found in database', { status: 500 }); // Return 500 if delete fails
      }
    } catch (dbError) {
      console.error('Error in deleteUser action:', dbError); // Log database error
      return new NextResponse('Error: Database error during user deletion', { status: 500 }); // Return 500 for database error
    }
    return NextResponse.json({ message: 'User deleted successfully', user: deletedUser }); // Return success response
  }

  // For other event types, return 200 OK - Clerk expects webhook to handle all event types gracefully
  console.log(`Unhandled webhook event type: ${eventType}`); // Log unhandled event types
  return new Response('Webhook received and processed', { status: 200 }); // Return 200 for processed event
}


// Optionally, add a GET handler so that testing via GET returns a 405.
export async function GET() {
  return new Response('Method Not Allowed', { status: 405 });
}