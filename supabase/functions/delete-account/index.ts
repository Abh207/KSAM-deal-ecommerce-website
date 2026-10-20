import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed. Only POST is accepted." }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: "Missing Authorization header." }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

  if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
    return new Response(
      JSON.stringify({ error: "Server configuration error: missing Supabase credentials." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // 1. Verify caller's JWT using anon client + authHeader
  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } }
  });

  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData?.user?.id) {
    return new Response(
      JSON.stringify({ error: "Unauthorized: Invalid or expired session token." }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const userId = userData.user.id;

  try {
    // 2. Initialize admin service-role client for deletion
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // 3. Delete user files in avatars bucket under {userId}/
    try {
      const { data: fileList } = await adminClient.storage
        .from("avatars")
        .list(userId);

      if (fileList && fileList.length > 0) {
        const filePaths = fileList.map((f) => `${userId}/${f.name}`);
        await adminClient.storage.from("avatars").remove(filePaths);
      }
    } catch (storageErr) {
      console.warn(`[delete-account] Storage cleanup note for user ${userId}:`, storageErr);
    }

    // 4. Delete user from auth.users (cascades to public.profiles, addresses, wishlist, etc.)
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error(`[delete-account] Admin deletion failed for user ${userId}:`, deleteError.message);
      return new Response(
        JSON.stringify({ error: `Account deletion failed: ${deleteError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log user ID and outcome only, preserving privacy
    console.log(`[delete-account] Successfully deleted account for user: ${userId}`);

    return new Response(
      JSON.stringify({ ok: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`[delete-account] Unexpected error for user ${userId}:`, errorMsg);
    return new Response(
      JSON.stringify({ error: "Internal server error during account deletion." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
