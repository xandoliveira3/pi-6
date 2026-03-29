/**
 * Script para criar usuários no Firebase (Authentication + Firestore)
 * 
 * COMO USAR:
 * 1. npm install firebase
 * 2. node scripts/criar-usuarios.js
 */

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
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

// Inicializa Firebase
console.log('🔥 Inicializando Firebase...');
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
console.log('✅ Firebase inicializado!\n');

/**
 * Cria um usuário no Authentication e salva os dados no Firestore
 */
async function criarUsuario(nome, email, senha, tipoUsuario) {
  console.log(`📝 Criando ${tipoUsuario}: ${nome} <${email}>...`);
  
  try {
    // 1. Cria usuário no Authentication
    console.log('   [1/2] Criando no Firebase Authentication...');
    const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
    const { uid } = userCredential.user;
    console.log('   ✅ Authentication criado! UID:', uid);
    
    // 2. Salva dados no Firestore
    console.log('   [2/2] Salvando dados no Firestore...');
    await setDoc(doc(db, 'usuarios', uid), {
      nome: nome,
      email: email,
      tipo_usuario: tipoUsuario,
      ativo: true,
      criado_em: serverTimestamp(),
      atualizado_em: serverTimestamp()
    });
    console.log('   ✅ Firestore atualizado!');
    
    console.log(`✅ ${tipoUsuario} criado com sucesso!\n`);
    return { uid, nome, email, tipo_usuario: tipoUsuario };
    
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log(`   ⚠️ Email já cadastrado: ${email}`);
      console.log(`   💡 Dica: Delete o usuário no Firebase Console ou use outro email\n`);
    } else if (error.code === 'auth/weak-password') {
      console.log(`   ❌ Senha muito fraca. Use pelo menos 6 caracteres.\n`);
    } else if (error.code === 'auth/operation-not-allowed') {
      console.log(`   ❌ Email/Password não está habilitado no Firebase Authentication.`);
      console.log(`   💡 Acesse: Firebase Console > Authentication > Sign-in method > Email/Password > Enable\n`);
    } else {
      console.log(`   ❌ Erro: ${error.message}\n`);
    }
    return null;
  }
}

/**
 * Função principal - cria todos os usuários
 */
async function main() {
  console.log('🚀 Criando usuários para o projeto...\n');
  console.log('=' .repeat(50));
  console.log('');
  
  // Lista de usuários para criar
  const usuarios = [
    // Administrador
    { 
      nome: 'Administrador', 
      email: 'admin@exemplo.com', 
      senha: 'admin123', 
      tipo: 'admin' 
    },
    // Usuários comuns
    { 
      nome: 'User 1', 
      email: 'user1@exemplo.com', 
      senha: '123456', 
      tipo: 'usuario' 
    },
    { 
      nome: 'User 2', 
      email: 'user2@exemplo.com', 
      senha: '123456', 
      tipo: 'usuario' 
    },
    { 
      nome: 'User 3', 
      email: 'user3@exemplo.com', 
      senha: '123456', 
      tipo: 'usuario' 
    }
  ];
  
  const resultados = [];
  
  // Cria cada usuário
  for (const dados of usuarios) {
    const resultado = await criarUsuario(
      dados.nome,
      dados.email,
      dados.senha,
      dados.tipo
    );
    resultados.push(resultado);
    
    // Aguarda 500ms entre cada criação para evitar rate limit
    if (resultado) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  // Resumo final
  console.log('=' .repeat(50));
  console.log('\n📊 RESUMO:\n');
  
  const criados = resultados.filter(r => r !== null);
  const falharam = resultados.filter(r => r === null);
  
  console.log(`✅ Criados: ${criados.length}`);
  criados.forEach(u => {
    console.log(`   - ${u.nome} (${u.email}) - ${u.tipo_usuario}`);
  });
  
  if (falharam.length > 0) {
    console.log(`⚠️ Falharam: ${falharam.length} (já existem ou erro)`);
  }
  
  console.log('\n📋 Credenciais para teste:\n');
  console.log('   ADMIN:');
  console.log('   Email: admin@exemplo.com');
  console.log('   Senha: admin123');
  console.log('');
  console.log('   USUÁRIOS:');
  console.log('   Email: user1@exemplo.com | Senha: 123456');
  console.log('   Email: user2@exemplo.com | Senha: 123456');
  console.log('   Email: user3@exemplo.com | Senha: 123456');
  console.log('');
  console.log('✅ Script finalizado!\n');
}

// Executa o script
main().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
