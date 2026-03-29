/**
 * Script para criar a estrutura inicial do Firestore
 * 
 * COMO USAR:
 * 
 * Opção 1 - Firebase Console (mais fácil):
 * 1. Acesse https://console.firebase.google.com
 * 2. Vá em Firestore Database
 * 3. Clique em "Regras" e cole o conteúdo de firestore.rules
 * 4. Clique em "Índices" e crie os índices manualmente
 * 
 * Opção 2 - Firebase CLI:
 * 1. Instale: npm install -g firebase-tools
 * 2. Login: firebase login
 * 3. Init: firebase init firestore
 * 4. Deploy: firebase deploy --only firestore:rules
 * 
 * Opção 3 - Node.js Script (este arquivo):
 * 1. firebase login
 * 2. node scripts/setup-firestore.js
 */

// ============================================
// CONTEÚDO PARA firestore.rules
// ============================================
/*
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Usuários: qualquer autenticado pode ler, só o próprio usuário pode escrever
    match /usuarios/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Vetores faciais: leitura para autenticados, escrita apenas para o próprio usuário ou admin
    match /vetores_faciais/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      (request.auth.uid == userId || 
                       get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.tipo_usuario == 'admin');
    }
    
    // Tentativas de login: qualquer autenticado pode criar, apenas admin pode ler
    match /tentativas_login/{attemptId} {
      allow read: if request.auth != null && 
                     get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.tipo_usuario == 'admin';
      allow create: if request.auth != null;
    }
  }
}
*/

// ============================================
// ÍNDICES PARA firestore.indexes.json
// ============================================
const indexesConfig = {
  "indexes": [
    {
      "collectionGroup": "usuarios",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "email", "order": "ASCENDING" },
        { "fieldPath": "ativo", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "usuarios",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "tipo_usuario", "order": "ASCENDING" },
        { "fieldPath": "ativo", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "tentativas_login",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "usuario_id", "order": "ASCENDING" },
        { "fieldPath": "data_hora", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "tentativas_login",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "sucesso", "order": "ASCENDING" },
        { "fieldPath": "data_hora", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
};

// ============================================
// SCRIPT PARA CRIAR DADOS INICIAIS (Node.js)
// ============================================

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, serverTimestamp } = require('firebase/firestore');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');

// ⚠️ SUBSTITUA PELAS SUAS CREDENCIAIS
const firebaseConfig = {

  apiKey: "AIzaSyBY_Od8OSaWIVr5pqz2mbWyyrjYVoB98BY",

  authDomain: "projeto-pi-5f81b.firebaseapp.com",

  projectId: "projeto-pi-5f81b",

  storageBucket: "projeto-pi-5f81b.firebasestorage.app",

  messagingSenderId: "696371963175",

  appId: "1:696371963175:web:cb76c688487420323bf502"

};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

/**
 * Cria um usuário admin inicial
 */
async function criarAdminInicial(email, senha, nome) {
  try {
    console.log(`📝 Criando admin: ${nome} <${email}>...`);
    
    // Cria usuário na Authentication
    const { user } = await createUserWithEmailAndPassword(auth, email, senha);
    
    // Salva dados no Firestore
    await setDoc(doc(db, 'usuarios', user.uid), {
      nome: nome,
      email: email,
      tipo_usuario: 'admin',
      ativo: true,
      criado_em: serverTimestamp(),
      atualizado_em: serverTimestamp()
    });
    
    console.log('✅ Admin criado com sucesso!');
    console.log(`   UID: ${user.uid}`);
    
    return user;
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('⚠️ Email já cadastrado. Fazendo login...');
      
      const { user } = await signInWithEmailAndPassword(auth, email, senha);
      
      // Atualiza para admin se não for
      await setDoc(doc(db, 'usuarios', user.uid), {
        nome: nome,
        email: email,
        tipo_usuario: 'admin',
        ativo: true,
        atualizado_em: serverTimestamp()
      }, { merge: true });
      
      console.log('✅ Usuário atualizado para admin!');
      return user;
    }
    
    console.error('❌ Erro ao criar admin:', error.message);
    throw error;
  }
}

/**
 * Cria usuários de exemplo
 */
async function criarUsuariosExemplo() {
  const usuarios = [
    { nome: 'João Silva', email: 'user1@exemplo.com', senha: '123456', tipo: 'usuario' },
    { nome: 'Maria Santos', email: 'user1@exemplo.com', senha: '123456', tipo: 'usuario' },
    { nome: 'Pedro Oliveira', email: 'user1@exemplo.com', senha: '123456', tipo: 'usuario' }
  ];
  
  for (const dados of usuarios) {
    try {
      console.log(`📝 Criando usuário: ${dados.nome}...`);
      
      const { user } = await createUserWithEmailAndPassword(auth, dados.email, dados.senha);
      
      await setDoc(doc(db, 'usuarios', user.uid), {
        nome: dados.nome,
        email: dados.email,
        tipo_usuario: dados.tipo,
        ativo: true,
        criado_em: serverTimestamp(),
        atualizado_em: serverTimestamp()
      });
      
      console.log(`✅ ${dados.nome} criado!`);
    } catch (error) {
      console.error(`❌ Erro ao criar ${dados.nome}:`, error.message);
    }
  }
}

/**
 * Cria vetor facial de exemplo
 */
async function criarVetorExemplo(usuarioId) {
  try {
    console.log('📝 Criando vetor facial de exemplo...');
    
    // Vetor fake de 512 dimensões (substitua pelo vetor real do reconhecimento facial)
    const vetorFake = Array(512).fill(0).map((_, i) => Math.random() * 2 - 1);
    
    await setDoc(doc(db, 'vetores_faciais', usuarioId), {
      vetor: vetorFake,
      dimensoes: 512,
      modelo_versao: 'facenet_512_v1',
      ativo: true,
      criado_em: serverTimestamp()
    });
    
    console.log('✅ Vetor facial criado!');
  } catch (error) {
    console.error('❌ Erro ao criar vetor:', error.message);
  }
}

/**
 * Registra tentativa de login de exemplo
 */
async function registrarTentativaExemplo(usuarioId, sucesso = true) {
  try {
    console.log('📝 Registrando tentativa de login de exemplo...');
    
    await setDoc(doc(collection(db, 'tentativas_login')), {
      usuario_id: `usuarios/${usuarioId}`,
      sucesso: sucesso,
      metodo: 'senha',
      ip: '192.168.1.1',
      data_hora: serverTimestamp()
    });
    
    console.log('✅ Tentativa registrada!');
  } catch (error) {
    console.error('❌ Erro ao registrar tentativa:', error.message);
  }
}

// ============================================
// EXECUÇÃO
// ============================================

async function setupCompleto() {
  console.log('🚀 Iniciando setup do Firestore...\n');
  
  // 1. Criar admin inicial
  await criarAdminInicial(
    'admin@exemplo.com',      // ← MUDE AQUI
    'admin123',              // ← MUDE AQUI
    'Administrador'
  );
  
  console.log('\n---\n');
  
  // 2. Criar usuários de exemplo (opcional)
  // await criarUsuariosExemplo();
  
  console.log('\n---\n');
  
  // 3. Criar vetor facial de exemplo (opcional)
  // const adminDoc = await getDoc(doc(db, 'usuarios', 'UID_DO_ADMIN'));
  // await criarVetorExemplo('UID_DO_USUARIO');
  
  console.log('\n✅ Setup completo!');
  console.log('\n📋 Próximos passos:');
  console.log('   1. Acesse Firebase Console → Firestore Database');
  console.log('   2. Verifique as coleções criadas');
  console.log('   3. Configure as regras de segurança (firestore.rules)');
  console.log('   4. Teste o login no app!');
}

// Executa se rodado diretamente
if (require.main === module) {
  setupCompleto().catch(console.error);
}

module.exports = {
  criarAdminInicial,
  criarUsuariosExemplo,
  criarVetorExemplo,
  registrarTentativaExemplo,
  indexesConfig
};
