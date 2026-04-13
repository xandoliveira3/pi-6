import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../config/firebase';
import { faceEmbeddingService } from './faceEmbeddingService';
import { Usuario } from '../types/usuario';

export interface FaceLoginResult {
  success: boolean;
  usuario?: Usuario;
  error?: string;
  similarity?: number;
}

/**
 * Faz login usando reconhecimento facial
 * 
 * Fluxo:
 * 1. Captura o rosto do usuário pela câmera
 * 2. Gera embedding (vetor de características)
 * 3. Compara com todos os embeddings armazenados no Firestore
 * 4. Se match encontrado, faz login no Firebase Auth com a senha armazenada
 * 5. Retorna o usuário logado
 */
export async function loginWithFace(cameraRef: any): Promise<FaceLoginResult> {
  console.log('🧠 [FaceLogin] === INICIANDO LOGIN FACIAL ===');

  try {
    // 1. Capturar rosto e gerar embedding
    console.log('[FaceLogin] [PASSO 1] Capturando rosto...');
    
    const faceEmbedding = await faceEmbeddingService.captureAndGenerateEmbedding(cameraRef, 5);
    
    if (!faceEmbedding) {
      console.log('[FaceLogin] ❌ Falha ao capturar rosto');
      return {
        success: false,
        error: 'Não foi possível capturar o rosto. Verifique a câmera e tente novamente.'
      };
    }

    console.log('[FaceLogin] [PASSO 1] ✅ Rosto capturado. Qualidade:', faceEmbedding.quality);
    console.log('[FaceLogin] Embedding gerado:', faceEmbedding.vector.length, 'dimensões');

    // 2. Verificar qualidade da captura
    if (faceEmbedding.quality < 0.3) {
      return {
        success: false,
        error: 'Qualidade da imagem muito baixa. Capture em um ambiente bem iluminado.'
      };
    }

    // 3. Buscar todos os usuários com faceEmbedding no Firestore
    console.log('[FaceLogin] [PASSO 2] Buscando usuários registrados...');
    
    const usuariosRef = collection(db, 'usuarios');
    const usuariosSnapshot = await getDocs(usuariosRef);
    
    const usuariosComFace: Array<Usuario & { faceEmbedding: number[]; faceAuthPassword?: string }> = [];
    
    usuariosSnapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (data.faceEmbedding && data.faceEmbedding.length > 0) {
        usuariosComFace.push({
          uid: docSnap.id,
          ...data
        } as Usuario & { faceEmbedding: number[]; faceAuthPassword?: string });
      }
    });

    console.log('[FaceLogin] Usuários com face registrada:', usuariosComFace.length);

    if (usuariosComFace.length === 0) {
      return {
        success: false,
        error: 'Nenhum usuário com reconhecimento facial cadastrado. Crie uma conta primeiro.'
      };
    }

    // 4. Comparar embedding atual com cada usuário
    console.log('[FaceLogin] [PASSO 3] Comparando embeddings...');
    
    let bestMatch: { usuario: Usuario & { faceEmbedding: number[]; faceAuthPassword?: string }; similarity: number } | null = null;

    for (const usuario of usuariosComFace) {
      const similarity = faceEmbeddingService.calculateSimilarity(
        faceEmbedding.vector,
        usuario.faceEmbedding
      );

      console.log(`[FaceLogin] ${usuario.nome}: ${(similarity * 100).toFixed(1)}%`);

      if (!bestMatch || similarity > bestMatch.similarity) {
        bestMatch = { usuario, similarity };
      }
    }

    // 5. Verificar se o match é suficiente
    const threshold = faceEmbeddingService.getMatchThreshold();
    
    if (!bestMatch || bestMatch.similarity < threshold) {
      console.log('[FaceLogin] ❌ Nenhum match suficiente. Melhor:', bestMatch?.similarity);
      
      return {
        success: false,
        error: 'Rosto não reconhecido. Verifique se você já cadastrou seu rosto e tente novamente.'
      };
    }

    // 6. Verificar se o usuário está ativo
    console.log('[FaceLogin] [PASSO 4] Verificando status do usuário...');
    
    const matchedUser = bestMatch.usuario;
    
    if (!matchedUser.ativo) {
      console.log('[FaceLogin] ❌ Usuário pendente de aprovação');
      return {
        success: false,
        error: 'Sua conta ainda não foi aprovada pelo administrador.'
      };
    }

    // 7. Fazer login no Firebase Auth usando a senha armazenada
    console.log('[FaceLogin] [PASSO 5] Fazendo login no Firebase Auth...');

    if (!matchedUser.faceAuthPassword) {
      console.log('[FaceLogin] ❌ faceAuthPassword não encontrado no Firestore');
      return {
        success: false,
        error: 'Seu cadastro facial está desatualizado. Por favor, exclua e refaça seu cadastro facial com reconhecimento.'
      };
    }

    console.log('[FaceLogin] Email para login:', matchedUser.email);
    console.log('[FaceLogin] Senha encontrada:', matchedUser.faceAuthPassword ? 'SIM' : 'NÃO');

    // Sign in com email e senha armazenada
    try {
      await signInWithEmailAndPassword(auth, matchedUser.email, matchedUser.faceAuthPassword);
      console.log('[FaceLogin] [PASSO 5] ✅ Login no Firebase Auth realizado!');
    } catch (authError: any) {
      console.log('[FaceLogin] ❌ Erro ao fazer login no Firebase Auth:', authError.code);
      console.log('[FaceLogin] Erro detalhado:', authError.message);
      
      if (authError.code === 'auth/invalid-credential' || authError.code === 'auth/wrong-password') {
        return {
          success: false,
          error: 'Senha de autenticação inválida. Exclua e refaça seu cadastro facial.'
        };
      } else if (authError.code === 'auth/user-disabled') {
        return {
          success: false,
          error: 'Sua conta foi desativada. Contate o administrador.'
        };
      } else if (authError.code === 'auth/user-not-found') {
        return {
          success: false,
          error: 'Conta de autenticação não encontrada. Refaça seu cadastro facial.'
        };
      }
      
      return {
        success: false,
        error: 'Erro ao autenticar no sistema. Tente fazer login com email e senha.'
      };
    }

    // 8. Sucesso!
    console.log('[FaceLogin] ✅ LOGIN FACIAL COMPLETO!');
    console.log('[FaceLogin] Usuário:', matchedUser.nome);
    console.log('[FaceLogin] Similaridade:', (bestMatch.similarity * 100).toFixed(1) + '%');
    console.log('[FaceLogin] Tipo:', matchedUser.tipo_usuario);

    return {
      success: true,
      usuario: matchedUser,
      similarity: bestMatch.similarity
    };

  } catch (error: any) {
    console.log('[FaceLogin] ❌ === ERRO NO LOGIN FACIAL ===');
    console.log('[FaceLogin] Error:', error?.message);
    
    let errorMessage = 'Erro ao fazer login facial. Tente novamente.';
    
    if (error?.message?.includes('camera')) {
      errorMessage = 'Erro ao acessar câmera. Verifique as permissões.';
    } else if (error?.message?.includes('permission')) {
      errorMessage = 'Permissão de câmera negada. Habilite nas configurações.';
    }

    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Busca um usuário específico pelo UID e compara com o embedding atual
 * Útil para verificação 1:1 (já sabe quem é o usuário)
 */
export async function verifyFaceWithUser(uid: string, currentEmbedding: number[]): Promise<{
  success: boolean;
  usuario?: Usuario;
  similarity?: number;
  error?: string;
}> {
  try {
    const usuariosRef = collection(db, 'usuarios');
    const q = query(usuariosRef, where('__name__', '==', uid));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return { success: false, error: 'Usuário não encontrado.' };
    }

    const docSnap = snapshot.docs[0];
    const data = docSnap.data() as any;

    if (!data.faceEmbedding || data.faceEmbedding.length === 0) {
      return { success: false, error: 'Usuário sem face registrada.' };
    }

    const similarity = faceEmbeddingService.calculateSimilarity(
      currentEmbedding,
      data.faceEmbedding
    );

    const threshold = faceEmbeddingService.getMatchThreshold();

    if (similarity < threshold) {
      return {
        success: false,
        similarity,
        error: `Verificação falhou. Similaridade: ${(similarity * 100).toFixed(1)}%`
      };
    }

    return {
      success: true,
      usuario: { uid: docSnap.id, ...data } as Usuario,
      similarity
    };

  } catch (error: any) {
    return {
      success: false,
      error: 'Erro na verificação facial.'
    };
  }
}
