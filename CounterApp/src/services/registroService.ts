import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { Usuario } from '../types/usuario';

export interface RegistroResponse {
  success: boolean;
  usuario?: Usuario;
  error?: string;
}

export async function registrarUsuario(
  nome: string,
  email: string,
  senha: string
): Promise<RegistroResponse> {
  console.log('🔐 [AuthService] === INICIANDO REGISTRO ===');
  console.log('[AuthService] Nome:', nome);
  console.log('[AuthService] Email:', email);

  try {
    // 1. Verifica se email já existe no Firestore
    console.log('[AuthService] [PASSO 1] Verificando email existente...');
    
    // Busca por email no Firestore (índice necessário)
    // Como não temos query direta, tentamos autenticar primeiro
    // A melhor forma é tentar criar e capturar o erro 'email-already-in-use'

    // 2. Cria usuário no Authentication
    console.log('[AuthService] [PASSO 2] Criando no Firebase Auth...');
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
    const { uid } = userCredential.user;
    
    console.log('[AuthService] [PASSO 2] ✅ Auth criado! UID:', uid);

    // 3. Salva dados no Firestore
    console.log('[AuthService] [PASSO 3] Salvando no Firestore...');
    
    await setDoc(doc(db, 'usuarios', uid), {
      nome: nome.trim(),
      email: email.toLowerCase().trim(),
      tipo_usuario: 'usuario',
      ativo: true,
      criado_em: serverTimestamp(),
      atualizado_em: serverTimestamp()
    });

    console.log('[AuthService] [PASSO 3] ✅ Firestore atualizado!');

    // 4. Retorna sucesso
    console.log('[AuthService] ✅ REGISTRO COMPLETO!');
    
    return {
      success: true,
      usuario: {
        uid,
        nome: nome.trim(),
        email: email.toLowerCase().trim(),
        tipo_usuario: 'usuario',
        ativo: true
      }
    };

  } catch (error: any) {
    console.log('[AuthService] ❌ === ERRO NO REGISTRO ===');
    console.log('[AuthService] Error code:', error?.code);
    console.log('[AuthService] Error message:', error?.message);

    let errorMessage = 'Erro ao criar conta. Tente novamente.';

    if (error?.code === 'auth/email-already-in-use') {
      errorMessage = 'Este email já está cadastrado. Faça login ou use outro email.';
    } else if (error?.code === 'auth/invalid-email') {
      errorMessage = 'Email inválido. Digite um email válido.';
    } else if (error?.code === 'auth/weak-password') {
      errorMessage = 'Senha muito fraca. Use pelo menos 6 caracteres.';
    } else if (error?.code === 'auth/operation-not-allowed') {
      errorMessage = 'Cadastro não está habilitado no momento.';
    } else if (error?.code === 'auth/network-request-failed') {
      errorMessage = 'Erro de rede. Verifique sua conexão.';
    }

    // Faz logout se criou usuário mas falhou no Firestore
    if (error?.code && !errorMessage.includes('já está cadastrado')) {
      console.log('[AuthService] Tentando fazer cleanup...');
      try {
        await signOut(auth);
      } catch (cleanupError) {
        console.log('[AuthService] Cleanup falhou:', cleanupError?.message);
      }
    }

    return {
      success: false,
      error: errorMessage
    };
  }
}

export { login, logout, getCurrentUser } from './authService';
