require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  const { data, error } = await supabase.from('bookings').insert({
    name: 'Test',
    email: 'test@example.com',
    program: 'pass-usage'
  });
  console.log('Error:', error);
}

test();
