import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3';

Deno.serve(async (req) => {
  const respond = (body: object, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return respond({ error: 'Method not allowed' }, 405);
  try {
    const body = z.object({ password: z.string().min(8).max(128) }).safeParse(await req.json());
    const password = Deno.env.get('NEREA_INITIAL_PASSWORD');
    if (!body.success || !password || body.data.password !== password) return respond({ error: 'Unauthorized' }, 401);
    const url = Deno.env.get('SUPABASE_URL');
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !key) return respond({ error: 'Unavailable' }, 503);
    const admin = createClient(url, key, { auth: { persistSession: false } });
    // Fixed, least-privilege account only: no caller-supplied identity or role.
    const { data, error } = await admin.auth.admin.createUser({ email: 'nerea.garcia@staff.laloggia.local', password, email_confirm: true });
    if (error || !data.user) return respond({ error: 'Account creation failed' }, 409);
    const id = data.user.id;
    const profile = await admin.from('profiles').insert({ id, username: 'nerea.garcia', display_name: 'Nerea García' });
    const role = profile.error ? profile : await admin.from('user_roles').insert({ user_id: id, role: 'submissions_reader' });
    if (role.error) {
      await admin.auth.admin.deleteUser(id);
      return respond({ error: 'Account setup failed' }, 500);
    }
    return respond({ created: true });
  } catch {
    return respond({ error: 'Invalid request' }, 400);
  }
});