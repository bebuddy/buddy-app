import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";
import { S3Client, GetObjectCommand } from "npm:@aws-sdk/client-s3";
import { getSignedUrl } from "npm:@aws-sdk/s3-request-presigner";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
const s3Region = Deno.env.get("S3_REGION");
const defaultBucket = Deno.env.get("S3_BUCKET");
const accessKeyId = Deno.env.get("AWS_ACCESS_KEY_ID");
const secretAccessKey = Deno.env.get("AWS_SECRET_ACCESS_KEY");

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    if (!supabaseUrl || !supabaseAnonKey) throw new Error("Missing Supabase env");
    if (!s3Region || !accessKeyId || !secretAccessKey) throw new Error("Missing S3 environment variables");

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

    const { key } = await req.json() as { key?: string };
    if (!key) {
      return new Response(JSON.stringify({ message: "key is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { data: fileRow, error: fileError } = await supabase
      .from("file")
      .select("bucket, original_file_name")
      .eq("key", key)
      .single();

    if (fileError || !fileRow) {
      return new Response(JSON.stringify({ message: "파일을 찾을 수 없습니다." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const bucket = (fileRow as { bucket?: string | null }).bucket ?? defaultBucket;
    if (!bucket) {
      return new Response(JSON.stringify({ message: "No bucket configured" }), {
        status: 500,
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

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const downloadUrl = await getSignedUrl(s3, command, { expiresIn: 900 });

    return new Response(
      JSON.stringify({
        downloadUrl,
        fileName: (fileRow as { original_file_name?: string }).original_file_name,
        bucket,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("file-download-url error:", error);
    return new Response(JSON.stringify({ message: "Failed to create download URL" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
