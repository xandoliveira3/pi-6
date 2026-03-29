/**
 * Script para testar login no Firebase
 * 
 * COMO USAR:
 * node scripts/testar-login.js
 */

const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, getDoc } = require('firebase/firestore');

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBY_Od8OSaWIVr5pqz2mbWyyrjYVoB98BY",
  authDomain: "projeto-pi-5f81b.firebaseapp.com",
  projectId: "projeto-pi-5f81b",
  storageBucket: "projeto-pi-5f81b.firebasestorage.app",
  messagingSenderId: "696371963175",
  appId: "1:696371963175:web:cb76c688487420323bf502"
};

console.log('🔥 Inicializando Firebase...\n');
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function testarLogin(email, senha) {
  console.log('📝 Testando login:', email);
  console.log('=' .repeat(50));
  
  try {
    // 1. Testa Authentication
    console.log('\n[1/3] Tentando Authentication...');
    const userCredential = await signInWithEmailAndPassword(auth, email, senha);
    const { uid } = userCredential.user;
    console.log('   ✅ Authentication OK! UID:', uid);
    
    // 2. Testa Firestore
    console.log('\n[2/3] Buscando dados no Firestore...');
    const usuarioDoc = await getDoc(doc(db, 'usuarios', uid));
    
    if (!usuarioDoc.exists()) {
      console.log('   ❌ Usuário NÃO encontrado no Firestore!');
      return;
    }
    console.log('   ✅ Firestore OK!');
    
    const dados = usuarioDoc.data();
    console.log('\n[3/3] Dados do usuário:');
    console.log('   Nome:', dados.nome);
    console.log('   Email:', dados.email);
    console.log('   Tipo:', dados.tipo_usuario);
    console.log('   Ativo:', dados.ativo);
    
    console.log('\n✅ Login bem-sucedido!\n');
    
  } catch (error) {
    console.log('\n❌ ERRO:', error.message);
    console.log('   Code:', error.code);
    
    if (error.code === 'auth/invalid-credential') {
      console.log('\n💡 Email ou senha incorretos');
    } else if (error.code === 'auth/operation-not-allowed') {
      console.log('\n💡 Email/Password NÃO está habilitado no Firebase!');
      console.log('   Acesse: https://console.firebase.google.com');
      console.log('   > Authentication > Sign-in method > Email/Password > Enable');
    }
  }
}

async function main() {
  console.log('🧪 TESTES DE LOGIN\n');
  
  // Testa admin
  await testarLogin('admin@exemplo.com', 'admin123');
  
  // Testa usuário
  await testarLogin('user1@exemplo.com', '123456');
}

main().catch(console.error);
