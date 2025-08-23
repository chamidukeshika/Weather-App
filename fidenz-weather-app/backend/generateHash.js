const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = '123';
  const hash = await bcrypt.hash(password, 10);
  console.log('Password:', password);
  console.log('Generated Hash:', hash);
  
  // Verify the hash
  const isValid = await bcrypt.compare(password, hash);
  console.log('Verification result:', isValid);
}

generateHash();