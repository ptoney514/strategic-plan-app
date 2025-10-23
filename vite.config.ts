import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'
import { join } from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Check what's actually in the .env files
  try {
    const envContent = readFileSync(join(process.cwd(), '.env'), 'utf-8')
    const envLocalContent = readFileSync(join(process.cwd(), '.env.local'), 'utf-8')
    console.log('🔧 [Vite Config] .env content:', envContent.substring(0, 200))
    console.log('🔧 [Vite Config] .env.local content:', envLocalContent.substring(0, 200))
  } catch (e) {
    console.log('🔧 [Vite Config] Error reading env files:', e)
  }

  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')

  console.log('🔧 [Vite Config] Loading environment:', mode)
  console.log('🔧 [Vite Config] CWD:', process.cwd())
  console.log('🔧 [Vite Config] VITE_SUPABASE_URL from loadEnv:', env.VITE_SUPABASE_URL)
  console.log('🔧 [Vite Config] process.env.VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL)

  return {
    plugins: [react()],
    server: {
      port: 5174,
      strictPort: true,
    },
  }
})
