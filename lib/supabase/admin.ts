// lib/supabase/admin.ts

import { createClient } from '@supabase/supabase-js';

// ============================================================================
// ENVIRONMENT
// ============================================================================

const supabaseUrl =
  process.env.SUPABASE_URL;

const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

// ============================================================================
// VALIDATION
// ============================================================================

if (!supabaseUrl) {
  throw new Error(
    'SUPABASE_URL belum dikonfigurasi. Tambahkan SUPABASE_URL di .env.local dan Vercel.'
  );
}

if (!supabaseServiceRoleKey) {
  throw new Error(
    'SUPABASE_SERVICE_ROLE_KEY belum dikonfigurasi. Tambahkan key tersebut di .env.local dan Vercel.'
  );
}

// ============================================================================
// SUPABASE ADMIN CLIENT
// ============================================================================
//
// PENTING:
//
// Client ini KHUSUS SERVER.
//
// Jangan pernah:
// - import file ini ke Client Component
// - memakai SUPABASE_SERVICE_ROLE_KEY dengan NEXT_PUBLIC_
// - menaruh service role key langsung di source code
//
// Aman digunakan di:
// - app/api/.../route.ts
// - Server Actions
// - Server Components tertentu
//
// ============================================================================

export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  }
);