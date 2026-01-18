## Supabase setup (static-friendly)

1) Create a Supabase project and note the project URL and anon key.  
2) Set env vars in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>

# S3 for edge uploads/downloads
S3_REGION=<aws-region>
S3_BUCKET=<bucket-name>
AWS_ACCESS_KEY_ID=<access-key>
AWS_SECRET_ACCESS_KEY=<secret>
# Optional: bucket name for UI hints
NEXT_PUBLIC_S3_BUCKET_NAME=<bucket-name>
```

3) Apply RLS/policies (in the Supabase SQL editor or with the CLI):
```
supabase db execute --file supabase/migrations/0001_rls.sql
```

4) Deploy edge functions (requires `supabase` CLI and project ref):
```
supabase functions deploy file-upload-url --project-ref <project-ref>
supabase functions deploy file-download-url --project-ref <project-ref>

# Set function secrets (same values as your env)
supabase secrets set SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
  S3_REGION=$S3_REGION S3_BUCKET=$S3_BUCKET AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY \
  --project-ref <project-ref>
```

5) Install deps and run locally:
```
npm install
npm run dev
```

### Expected behavior after migration
- Auth: client uses `supabase.auth.signInWithOAuth` and `/verify` exchanges the code.  
- Data: app pages query Supabase directly; RLS protects per-user data.  
- Files: uploads/download URLs are issued by Supabase Edge Functions; file metadata is written client-side via RLS.  
- No Next.js API routes are used at runtime (static export ready).

## Native build (Capacitor)
- Build web + sync native projects: `npm run build:native` (runs `next build` to `out/` then `npx cap sync`).
- Open platforms: `npm run ios` (Xcode) / `npm run android` (Android Studio).
- Sync only after asset/code changes: `npm run cap:sync`.
- Capacitor reads from `out/`; keep server-side logic in Supabase/Edge Functions so the static export stays valid.

### Optional live reload (dev only)
- Run `npm run dev`.
- Temporarily set `server.url` in `capacitor.config.ts` to `http://<your-local-ip>:3000` and add `cleartext: true` if using HTTP (Android); remove these once done.
- `npx cap sync` then `npm run ios` / `npm run android`; the native shell will proxy to the dev server.

### Static-export caveats
- Next.js is set to `output: "export"` with `images.unoptimized: true`.
- Dynamic expert post paths are pre-rendered via `generateStaticParams`; set `EXPERT_POST_IDS=comma,separated,ids` in your env to include real post IDs. If unset, a placeholder path `/expert/post/example` is generated.
