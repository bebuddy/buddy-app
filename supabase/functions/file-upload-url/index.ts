import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";
import { S3Client, PutObjectCommand } from "npm:@aws-sdk/client-s3";
import { getSignedUrl } from "npm:@aws-sdk/s3-request-presigner";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
const s3Region = Deno.env.get("S3_REGION");
const s3Bucket = Deno.env.get("S3_BUCKET");
const accessKeyId = Deno.env.get("AWS_ACCESS_KEY_ID");
const secretAccessKey = Deno.env.get("AWS_SECRET_ACCESS_KEY");

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    if (!supabaseUrl || !supabaseAnonKey) throw new Error("Missing Supabase env");
    if (!s3Region || !s3Bucket || !accessKeyId || !secretAccessKey) {
      throw new Error("Missing S3 environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { fileName } = await req.json() as { fileName?: string };
    if (!fileName) {
      return new Response(JSON.stringify({ message: "fileName is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const s3 = new S3Client({
      region: s3Region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    const key = `uploads/${crypto.randomUUID()}-${fileName}`;
    const command = new PutObjectCommand({
      Bucket: s3Bucket,
      Key: key,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    return new Response(JSON.stringify({ uploadUrl, key, bucket: s3Bucket }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("file-upload-url error:", error);
    return new Response(JSON.stringify({ message: "Failed to create upload URL" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
