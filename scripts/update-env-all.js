const { execSync } = require('child_process');
const fs = require('fs');

function addEnvVar(key, value) {
  try {
    console.log(`Configurando ${key} en Vercel...`);
    try {
      execSync(`npx vercel env rm ${key} production --yes`, { stdio: 'ignore' });
    } catch(e) {}
    
    execSync(`npx vercel env add ${key} production`, { 
      input: value, 
      stdio: ['pipe', 'inherit', 'inherit'] 
    });
    console.log(`✅ ${key} configurado exitosamente.`);
  } catch (error) {
    console.error(`❌ Error configurando ${key}`);
  }
}

const envFile = fs.readFileSync('.env.local', 'utf8');
const lines = envFile.split('\n');

let vars = {};

for (const line of lines) {
  if (line.trim() && !line.startsWith('#')) {
    const splitIdx = line.indexOf('=');
    if (splitIdx > 0) {
      const key = line.substring(0, splitIdx).trim();
      const value = line.substring(splitIdx + 1).trim();
      if (value) {
        vars[key] = value;
      }
    }
  }
}

addEnvVar('NEXT_PUBLIC_SUPABASE_URL', vars['NEXT_PUBLIC_SUPABASE_URL']);
addEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY', vars['NEXT_PUBLIC_SUPABASE_ANON_KEY']);
addEnvVar('CUSTOMER_SESSION_SECRET', vars['CUSTOMER_SESSION_SECRET']);
// Aseguramos que la URL en producción apunte a vercel, no a localhost
addEnvVar('NEXT_PUBLIC_APP_URL', 'https://fidelidad-punto-cafe.vercel.app');
