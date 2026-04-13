import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { Usuario } from '../types/usuario';

export interface FaceRegisterResponse {
  success: boolean;
  usuario?: Usuario;
  error?: string;
}

/**
 * Registra um novo usuário com reconhecimento facial
 * 
 * Fluxo:
 * 1. Cria conta no Firebase Auth (com senha gerada aleatoriamente)
 * 2. Salva dados no Firestore incluindo o faceEmbedding
 * 3. Usuário fica INATIVO até aprovação do admin
 * 
 * NOTA: Não armazenamos imagem, apenas o vetor de características faciais
 */
export async function registrarUsuarioComFace(
  nome: string,
  email: string,
  faceEmbedding: number[]
): Promise<FaceRegisterResponse> {
  console.log('🧠 [FaceRegister] === INICIANDO CADASTRO FACIAL ===');
  console.log('[FaceRegister] Nome:', nome);
  console.log('[FaceRegister] Email:', email);
  console.log('[FaceRegister] Embedding size:', faceEmbedding.length, 'dimensões');

  try {
    // 1. Validar embedding
    if (!faceEmbedding || faceEmbedding.length === 0) {
      console.log('[FaceRegister] ❌ Embedding vazio');
      return {
        success: false,
        error: 'Erro ao processar dados faciais. Tente novamente.'
      };
    }

    // 2. Gerar senha aleatória segura (usuário não precisará digitar)
    const senhaAleatoria = generateSecurePassword();
    console.log('[FaceRegister] [PASSO 1] Criando conta no Firebase Auth...');

    // 3. Criar usuário no Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, senhaAleatoria);
    const { uid } = userCredential.user;

    console.log('[FaceRegister] [PASSO 1] ✅ Auth criado! UID:', uid);

    // 4. Salvar dados no Firestore como INATIVO
    // IMPORTANTE: Salvar a senha aleatória para permitir login facial posterior
    console.log('[FaceRegister] [PASSO 2] Salvando no Firestore (PENDENTE)...');

    await setDoc(doc(db, 'usuarios', uid), {
      nome: nome.trim(),
      email: email.toLowerCase().trim(),
      tipo_usuario: 'usuario',
      ativo: false,  // Pendente de aprovação
      faceEmbedding: faceEmbedding, // Vetor de características faciais
      faceEmbeddingVersion: 1,
      faceAuthPassword: senhaAleatoria, // Senha para login automático após reconhecimento
      criado_em: serverTimestamp(),
      atualizado_em: serverTimestamp()
    });

    console.log('[FaceRegister] [PASSO 2] ✅ Firestore atualizado! (ativo: false, faceEmbedding salvo)');

    // 5. Retornar sucesso
    console.log('[FaceRegister] ✅ CADASTRO FACIAL COMPLETO! (pendente de aprovação)');

    return {
      success: true,
      usuario: {
        uid,
        nome: nome.trim(),
        email: email.toLowerCase().trim(),
        tipo_usuario: 'usuario',
        ativo: false,
        faceEmbedding: faceEmbedding,
        faceEmbeddingVersion: 1
      }
    };

  } catch (error: any) {
    console.log('[FaceRegister] ❌ === ERRO NO CADASTRO FACIAL ===');
    console.log('[FaceRegister] Error code:', error?.code);
    console.log('[FaceRegister] Error message:', error?.message);

    let errorMessage = 'Erro ao criar conta. Tente novamente.';

    if (error?.code === 'auth/email-already-in-use') {
      errorMessage = 'Este email já está cadastrado. Faça login ou use outro email.';
    } else if (error?.code === 'auth/invalid-email') {
      errorMessage = 'Email inválido. Digite um email válido.';
    } else if (error?.code === 'auth/weak-password') {
      errorMessage = 'Erro interno de senha. Tente novamente.';
    } else if (error?.code === 'auth/operation-not-allowed') {
      errorMessage = 'Cadastro não está habilitado no momento.';
    } else if (error?.code === 'auth/network-request-failed') {
      errorMessage = 'Erro de rede. Verifique sua conexão.';
    }

    // Cleanup: fazer logout se criou usuário mas falhou
    if (error?.code && !errorMessage.includes('já está cadastrado')) {
      console.log('[FaceRegister] Tentando cleanup...');
      try {
        await signOut(auth);
      } catch (cleanupError) {
        console.log('[FaceRegister] Cleanup falhou:', cleanupError?.message);
      }
    }

    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Atualiza o faceEmbedding de um usuário existente
 * Útil para quando o usuário quer recadastrar o rosto
 */
export async function atualizarFaceEmbedding(
  uid: string,
  newFaceEmbedding: number[]
): Promise<{ success: boolean; error?: string }> {
  console.log('[FaceRegister] Atualizando faceEmbedding do usuário:', uid);

  try {
    if (!newFaceEmbedding || newFaceEmbedding.length === 0) {
      return {
        success: false,
        error: 'Embedding vazio.'
      };
    }

    const usuarioRef = doc(db, 'usuarios', uid);
    const usuarioDoc = await getDoc(usuarioRef);

    if (!usuarioDoc.exists()) {
      return {
        success: false,
        error: 'Usuário não encontrado.'
      };
    }

    const currentVersion = usuarioDoc.data().faceEmbeddingVersion || 0;

    await setDoc(usuarioRef, {
      faceEmbedding: newFaceEmbedding,
      faceEmbeddingVersion: currentVersion + 1,
      atualizado_em: serverTimestamp()
    }, { merge: true });

    console.log('[FaceRegister] ✅ faceEmbedding atualizado! Versão:', currentVersion + 1);

    return { success: true };

  } catch (error: any) {
    console.log('[FaceRegister] ❌ Erro ao atualizar embedding:', error?.message);
    return {
      success: false,
      error: 'Erro ao atualizar dados faciais.'
    };
  }
}

/**
 * Gera senha aleatória segura
 */
function generateSecurePassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
