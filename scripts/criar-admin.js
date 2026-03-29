/**
 * Script para criar/atualizar o usuário admin no Firebase
 * 
 * COMO USAR:
 * node scripts/criar-admin.js
 */

const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBY_Od8OSaWIVr5pqz2mbWyyrjYVoB98BY",
  authDomain: "projeto-pi-5f81b.firebaseapp.com",
  projectId: "projeto-pi-5f81b",
  storageBucket: "projeto-pi-5f81b.firebasestorage.app",
  messagingSenderId: "696371963175",
  appId: "1:696371963175:web:cb76c688487420323bf502"
};

console.log('🔥 Inicializando Firebase...');
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
console.log('✅ Firebase inicializado!\n');

async function garantirAdmin() {
  const email = 'admin@exemplo.com';
  const senha = 'admin123';
  
  console.log('📝 Verificando admin: ' + email + '...\n');
  
  try {
    // 1. Faz login com o admin
    console.log('[1/2] Fazendo login no Firebase Authentication...');
    const userCredential = await signInWithEmailAndPassword(auth, email, senha);
    const { uid } = userCredential.user;
    console.log('   ✅ Login realizado! UID:', uid);
    
    // 2. Atualiza/cria dados no Firestore
    console.log('[2/2] Atualizando dados no Firestore...');
    await setDoc(doc(db, 'usuarios', uid), {
      nome: 'Administrador',
      email: email,
      tipo_usuario: 'admin',
      ativo: true,
      criado_em: serverTimestamp(),
      atualizado_em: serverTimestamp()
    }, { merge: true }); // merge: true atualiza sem sobrescrever tudo
    console.log('   ✅ Firestore atualizado!');
    
    console.log('\n✅ Admin garantido no banco de dados!\n');
    console.log('📋 Dados do admin:');
    console.log('   UID:', uid);
    console.log('   Email:', email);
    console.log('   Senha:', senha);
    console.log('   Tipo: admin');
    console.log('   Ativo: true\n');
    
  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    
    if (error.code === 'auth/invalid-credential') {
      console.log('\n💡 Email ou senha incorretos.');
      console.log('   Verifique se o usuário admin@exemplo.com existe no Firebase Console.');
    } else if (error.code === 'auth/operation-not-allowed') {
      console.log('\n💡 Email/Password não está habilitado no Firebase.');
      console.log('   Acesse: Firebase Console > Authentication > Sign-in method > Email/Password > Enable');
    }
  }
}

garantirAdmin().catch(console.error);
