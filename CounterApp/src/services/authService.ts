import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { Usuario } from '../types/usuario';

export interface LoginResponse {
  success: boolean;
  usuario?: Usuario;
  error?: string;
}

export async function login(email: string, senha: string): Promise<LoginResponse> {
  console.log('🔐 [AuthService] === INICIANDO LOGIN ===');
  console.log('[AuthService] Email:', email);
  console.log('[AuthService] Senha:', senha ? '***' : '(vazia)');
  console.log('[AuthService] auth:', auth ? 'definido' : 'undefined');
  console.log('[AuthService] db:', db ? 'definido' : 'undefined');

  try {
    // 1. Autentica no Firebase Auth
    console.log('[AuthService] [PASSO 1] Chamando signInWithEmailAndPassword...');
    
    const userCredential = await signInWithEmailAndPassword(auth, email, senha);
    
    console.log('[AuthService] [PASSO 1] ✅ Auth bem-sucedida!');
    console.log('[AuthService] UID:', userCredential.user.uid);
    console.log('[AuthService] Email:', userCredential.user.email);

    const { uid } = userCredential.user;

    // 2. Busca dados do usuário no Firestore
    console.log('[AuthService] [PASSO 2] Buscando no Firestore...');
    console.log('[AuthService] Collection: usuarios');
    console.log('[AuthService] Document ID:', uid);
    
    const usuarioDoc = await getDoc(doc(db, 'usuarios', uid));
    
    console.log('[AuthService] [PASSO 2] ✅ Documento encontrado:', usuarioDoc.exists());

    if (!usuarioDoc.exists()) {
      console.log('[AuthService] ❌ Usuário não existe no Firestore');
      console.log('[AuthService] Fazendo logout...');
      await signOut(auth);
      return {
        success: false,
        error: 'Usuário não encontrado no banco de dados.'
      };
    }

    const usuario = usuarioDoc.data() as Usuario;
    console.log('[AuthService] Dados do Firestore:', JSON.stringify(usuario, null, 2));

    // 3. Verifica se o usuário está ativo
    console.log('[AuthService] [PASSO 3] Verificando status...');
    console.log('[AuthService] ativo:', usuario.ativo);
    
    if (!usuario.ativo) {
      console.log('[AuthService] ❌ Usuário inativo');
      await signOut(auth);
      return {
        success: false,
        error: 'Usuário inativo. Contate o administrador.'
      };
    }

    // 4. Retorna sucesso
    console.log('[AuthService] [PASSO 4] ✅ LOGIN COMPLETO!');
    console.log('[AuthService] Tipo:', usuario.tipo_usuario);
    
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
    console.log('[AuthService] Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error)));

    let errorMessage = 'Erro ao fazer login. Tente novamente.';

    if (error?.code === 'auth/invalid-credential') {
      errorMessage = 'Email ou senha incorretos.';
    } else if (error?.code === 'auth/invalid-email') {
      errorMessage = 'Email inválido.';
    } else if (error?.code === 'auth/user-disabled') {
      errorMessage = 'Usuário desativado.';
    } else if (error?.code === 'auth/too-many-requests') {
      errorMessage = 'Muitas tentativas. Tente novamente mais tarde.';
    } else if (error?.code === 'auth/network-request-failed') {
      errorMessage = 'Erro de rede. Verifique sua conexão.';
    } else if (error?.code === 'auth/operation-not-allowed') {
      errorMessage = 'Email/senha não habilitado no Firebase.';
    } else if (error?.code === 'auth/argument-error') {
      errorMessage = 'Erro nos argumentos. Verifique email e senha.';
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
