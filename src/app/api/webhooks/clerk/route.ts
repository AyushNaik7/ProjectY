import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET to .env');
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing svix headers', { status: 400 });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return new Response('Error: Invalid JSON payload', { status: 400 });
  }
  const body = JSON.stringify(payload);

  // Verify webhook signature
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error: Verification failed', { status: 400 });
  }

  const eventType = evt.type;
  const userId = evt.data.id;

  console.log(`Webhook received: ${eventType} for user ${userId}`);

  // Handle user.created event
  if (eventType === 'user.created') {
    const email = evt.data.email_addresses?.[0]?.email_address;
    const role = evt.data.public_metadata?.role as 'creator' | 'brand' | undefined;

    // Only create profile if role is set
    if (role && email) {
      const tableName = role === 'creator' ? 'creators' : 'brands';
      
      try {
        const { data: existing } = await supabaseAdmin
          .from(tableName)
          .select('id')
          .eq('clerk_user_id', userId)
          .maybeSingle();

        const profilePayload = {
          clerk_user_id: userId,
          email,
          name: evt.data.first_name || evt.data.username || 'User',
          updated_at: new Date().toISOString(),
        };

        const { error } = existing?.id
          ? await supabaseAdmin
              .from(tableName)
              .update(profilePayload)
              .eq('id', existing.id)
          : await supabaseAdmin
              .from(tableName)
              .insert({
                id: crypto.randomUUID(),
                ...profilePayload,
                created_at: new Date().toISOString(),
              });

        if (error) {
          console.error(`Error creating ${role} profile:`, error);
        } else {
          console.log(`Created ${role} profile for user ${userId}`);
        }
      } catch (err) {
        console.error('Error in webhook handler:', err);
      }
    }
  }

  // Handle user.updated event
  if (eventType === 'user.updated') {
    const role = evt.data.public_metadata?.role as 'creator' | 'brand' | undefined;
    const email = evt.data.email_addresses?.[0]?.email_address;

    if (role && email) {
      const tableName = role === 'creator' ? 'creators' : 'brands';
      
      try {
        const { data: existing } = await supabaseAdmin
          .from(tableName)
          .select('id')
          .eq('clerk_user_id', userId)
          .maybeSingle();

        const profilePayload = {
          clerk_user_id: userId,
          email,
          name: evt.data.first_name || evt.data.username || 'User',
          updated_at: new Date().toISOString(),
        };

        const { error } = existing?.id
          ? await supabaseAdmin
              .from(tableName)
              .update(profilePayload)
              .eq('id', existing.id)
          : await supabaseAdmin
              .from(tableName)
              .insert({
                id: crypto.randomUUID(),
                ...profilePayload,
                created_at: new Date().toISOString(),
              });

        if (error) {
          console.error(`Error updating ${role} profile:`, error);
        }
      } catch (err) {
        console.error('Error in webhook handler:', err);
      }
    }
  }

  // Handle user.deleted event
  if (eventType === 'user.deleted') {
    try {
      // Delete from both tables (one will succeed, one will fail - that's ok)
      await supabaseAdmin.from('creators').delete().eq('clerk_user_id', userId);
      await supabaseAdmin.from('brands').delete().eq('clerk_user_id', userId);
      console.log(`Deleted user ${userId} from database`);
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  }

  return NextResponse.json({ success: true });
}
