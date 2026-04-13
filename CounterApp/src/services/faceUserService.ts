import { doc, getDoc, updateDoc, deleteField, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface FaceUpdateResponse {
  success: boolean;
  error?: string;
}

/**
 * Verifica se o usuário tem faceEmbedding cadastrado
 */
export async function verificarUsuarioTemFace(uid: string): Promise<boolean> {
  try {
    const usuarioRef = doc(db, 'usuarios', uid);
    const usuarioDoc = await getDoc(usuarioRef);

    if (!usuarioDoc.exists()) {
      return false;
    }

    const data = usuarioDoc.data();
    return data.faceEmbedding && data.faceEmbedding.length > 0;
  } catch (error) {
    console.error('[FaceUserService] Erro ao verificar face:', error);
    return false;
  }
}

/**
 * Atualiza o faceEmbedding de um usuário existente
 * Usado tanto para cadastro inicial quanto para atualização
 */
export async function atualizarFaceEmbedding(
  uid: string,
  newFaceEmbedding: number[]
): Promise<FaceUpdateResponse> {
  console.log('[FaceUserService] Atualizando faceEmbedding do usuário:', uid);

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

    await updateDoc(usuarioRef, {
      faceEmbedding: newFaceEmbedding,
      faceEmbeddingVersion: currentVersion + 1,
      atualizado_em: serverTimestamp()
    });

    console.log('[FaceUserService] ✅ faceEmbedding atualizado! Versão:', currentVersion + 1);

    return { success: true };

  } catch (error: any) {
    console.log('[FaceUserService] ❌ Erro ao atualizar embedding:', error?.message);
    return {
      success: false,
      error: 'Erro ao atualizar dados faciais.'
    };
  }
}

/**
 * Remove o faceEmbedding do usuário
 * O usuário não poderá mais fazer login facial até recadastrar
 */
export async function removerFaceEmbedding(uid: string): Promise<FaceUpdateResponse> {
  console.log('[FaceUserService] Removendo faceEmbedding do usuário:', uid);

  try {
    const usuarioRef = doc(db, 'usuarios', uid);
    const usuarioDoc = await getDoc(usuarioRef);

    if (!usuarioDoc.exists()) {
      return {
        success: false,
        error: 'Usuário não encontrado.'
      };
    }

    // Remove os campos de face do documento
    await updateDoc(usuarioRef, {
      faceEmbedding: deleteField(),
      faceEmbeddingVersion: deleteField(),
      atualizado_em: serverTimestamp()
    });

    console.log('[FaceUserService] ✅ faceEmbedding removido!');

    return { success: true };

  } catch (error: any) {
    console.log('[FaceUserService] ❌ Erro ao remover embedding:', error?.message);
    return {
      success: false,
      error: 'Erro ao remover dados faciais.'
    };
  }
}

/**
 * Obtém informações sobre o status facial do usuário
 */
export async function getFaceStatusInfo(uid: string): Promise<{
  hasFace: boolean;
  version: number;
  lastUpdate: any;
}> {
  try {
    const usuarioRef = doc(db, 'usuarios', uid);
    const usuarioDoc = await getDoc(usuarioRef);

    if (!usuarioDoc.exists()) {
      return { hasFace: false, version: 0, lastUpdate: null };
    }

    const data = usuarioDoc.data();
    const hasFace = data.faceEmbedding && data.faceEmbedding.length > 0;

    return {
      hasFace,
      version: data.faceEmbeddingVersion || 0,
      lastUpdate: data.atualizado_em
    };

  } catch (error) {
    console.error('[FaceUserService] Erro ao obter status facial:', error);
    return { hasFace: false, version: 0, lastUpdate: null };
  }
}
