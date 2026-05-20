const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const lines = envFile.split('\n');

let supabaseUrl = '';
let supabaseKey = '';

for (const line of lines) {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
  if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) supabaseKey = line.split('=')[1].trim();
}



const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteUser() {
  console.log("Buscando a Agustín García...");
  
  // Buscar en la tabla pública por DNI
  const { data: users, error: searchError } = await supabase
    .from('users')
    .select('id, full_name, email, dni')
    .eq('dni', '43256041');
    
  if (searchError) {
    console.error("Error buscando:", searchError);
    return;
  }
  
  if (!users || users.length === 0) {
    console.log("No se encontró al usuario en public.users");
    return;
  }
  
  for (const user of users) {
    console.log(`Eliminando auth.users para: ${user.full_name} (${user.email}) ID: ${user.id}`);
    
    // Eliminar de auth (esto suele hacer cascade a public.users si está configurado, pero lo eliminamos de ambos por si acaso)
    const { error: authError } = await supabase.auth.admin.deleteUser(user.id);
    if (authError) {
      console.error("Error eliminando de auth.users:", authError.message);
    } else {
      console.log("✅ Eliminado de auth.users");
    }
    
    console.log("Eliminando historial de eventos...");
    // Eliminamos los eventos asociados al user_id
    const { error: eventError } = await supabase
      .from('loyalty_events')
      .delete()
      .eq('user_id', user.id);
      
    if (eventError) {
      console.error("Error eliminando loyalty_events:", eventError.message);
    } else {
      console.log("✅ Eventos eliminados");
    }

    console.log("Eliminando tarjeta de fidelidad asociada...");
    const { error: cardError } = await supabase
      .from('loyalty_cards')
      .delete()
      .eq('user_id', user.id);
      
    if (cardError) {
      console.error("Error eliminando loyalty_cards:", cardError.message);
    } else {
      console.log("✅ Tarjeta eliminada");
    }

    console.log("Eliminando de public.users...");
    const { error: publicError } = await supabase
      .from('users')
      .delete()
      .eq('id', user.id);
      
    if (publicError) {
      console.error("Error eliminando de public.users:", publicError.message);
    } else {
      console.log("✅ Eliminado de public.users");
    }
  }
  
  console.log("Proceso terminado.");
}

deleteUser();
