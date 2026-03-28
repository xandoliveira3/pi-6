import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { Usuario } from '../types/usuario';

export interface LoginResponse {
  success: boolean;
  usuario?: Usuario;
  error?: string;
  pendente?: boolean;
}

export async function login(email: string, senha: string): Promise<LoginResponse> {
  console.log('🔐 [AuthService] === INICIANDO LOGIN ===');
  console.log('[AuthService] Email:', email);

  try {
    // 1. Autentica no Firebase Auth
    console.log('[AuthService] [PASSO 1] Autenticando...');
    
    const userCredential = await signInWithEmailAndPassword(auth, email, senha);
    const { uid } = userCredential.user;
    
    console.log('[AuthService] [PASSO 1] ✅ Auth OK! UID:', uid);

    // 2. Busca dados no Firestore
    console.log('[AuthService] [PASSO 2] Buscando no Firestore...');
    
    const usuarioDoc = await getDoc(doc(db, 'usuarios', uid));

    if (!usuarioDoc.exists()) {
      console.log('[AuthService] ❌ Usuário não existe no Firestore');
      await signOut(auth);
      return {
        success: false,
        error: 'Usuário não encontrado no banco de dados.'
      };
    }

    const usuario = usuarioDoc.data() as Usuario;
    console.log('[AuthService] Dados:', JSON.stringify(usuario, null, 2));

    // 3. Verifica se está ativo
    console.log('[AuthService] [PASSO 3] Verificando status... ativo =', usuario.ativo);
    
    if (!usuario.ativo) {
      console.log('[AuthService] ❌ Usuário PENDENTE de aprovação');
      await signOut(auth);
      return {
        success: false,
        pendente: true,
        error: 'Conta precisa ser ativada pelo administrador.'
      };
    }

    // 4. Sucesso
    console.log('[AuthService] ✅ LOGIN COMPLETO! Tipo:', usuario.tipo_usuario);
    
    return {
      success: true,
      usuario: {
        uid,
        ...usuario
      }
    };

  } catch (error: any) {
    console.log('[AuthService] ❌ === ERRO NO LOGIN ===');
    console.log('[AuthService] Error code:', error?.code);
    console.log('[AuthService] Error message:', error?.message);

    let errorMessage = 'Erro ao fazer login. Tente novamente.';

    if (error?.code === 'auth/invalid-credential') {
      errorMessage = 'Email ou senha incorretos.';
    } else if (error?.code === 'auth/invalid-email') {
      errorMessage = 'Email inválido.';
    } else if (error?.code === 'auth/user-disabled') {
      errorMessage = 'Usuário desativado.';
    } else if (error?.code === 'auth/too-many-requests') {
      errorMessage = 'Muitas tentativas. Tente mais tarde.';
    } else if (error?.code === 'auth/network-request-failed') {
      errorMessage = 'Erro de rede. Verifique sua conexão.';
    }

    return {
      success: false,
      error: errorMessage
    };
  }
}

export async function logout(): Promise<void> {
  console.log('[AuthService] Fazendo logout...');
  try {
    await signOut(auth);
    console.log('[AuthService] ✅ Logout bem-sucedido');
  } catch (error: any) {
    console.log('[AuthService] ❌ Erro no logout:', error?.message);
  }
}

export function getCurrentUser() {
  const user = auth.currentUser;
  console.log('[AuthService] getCurrentUser:', user?.email ?? 'null');
  return user;
}
