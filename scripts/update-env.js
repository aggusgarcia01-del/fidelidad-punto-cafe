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
    console.log(`✅ ${key} configurado exitosamente en production.`);
  } catch (error) {
    console.error(`❌ Error configurando ${key}`);
  }
}

const envFile = fs.readFileSync('.env.local', 'utf8');
const lines = envFile.split('\n');

let adminPin = '';
let supabaseRoleKey = '';

for (const line of lines) {
  if (line.startsWith('ADMIN_PIN=')) adminPin = line.split('=')[1].trim();
  if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) supabaseRoleKey = line.split('=')[1].trim();
}

addEnvVar('ADMIN_PIN', adminPin);
addEnvVar('SUPABASE_SERVICE_ROLE_KEY', supabaseRoleKey);
