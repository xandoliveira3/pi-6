import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Pergunta {
  id: string;
  tipo: 'dissertativa' | 'alternativa';
  titulo: string;
  descricao?: string;
  obrigatoria: boolean;
  // Para perguntas alternativas
  tipoAlternativa?: 'estrelas' | 'emoji' | 'numerica' | 'texto';
  opcoes?: string[]; // Para múltipla escolha
}

export interface Formulario {
  id: string;
  titulo: string;
  descricao: string;
  ativo: boolean;
  perguntas: Pergunta[];
  criado_em: any;
  atualizado_em: any;
}

export async function listarFormularios(): Promise<Formulario[]> {
  try {
    const formulariosRef = collection(db, 'formularios');
    const snapshot = await getDocs(formulariosRef);

    const formularios: Formulario[] = [];
    snapshot.forEach((doc) => {
      formularios.push({
        id: doc.id,
        ...doc.data()
      } as Formulario);
    });

    return formularios.sort((a, b) => {
      if (a.ativo !== b.ativo) return a.ativo ? -1 : 1;
      return b.criado_em?.toDate() - a.criado_em?.toDate();
    });
  } catch (error: any) {
    console.error('Erro ao listar formulários:', error.message);
    return [];
  }
}

export async function criarFormulario(titulo: string, descricao: string): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const formularioRef = doc(collection(db, 'formularios'));
    
    await setDoc(formularioRef, {
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      ativo: true,
      perguntas: [],
      criado_em: serverTimestamp(),
      atualizado_em: serverTimestamp()
    });

    return { success: true, id: formularioRef.id };
  } catch (error: any) {
    return { success: false, error: 'Erro ao criar formulário.' };
  }
}

export async function atualizarFormulario(id: string, dados: Partial<Formulario>): Promise<{ success: boolean; error?: string }> {
  try {
    const formularioRef = doc(db, 'formularios', id);
    
    await updateDoc(formularioRef, {
      ...dados,
      atualizado_em: serverTimestamp()
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: 'Erro ao atualizar formulário.' };
  }
}

export async function adicionarPergunta(formularioId: string, pergunta: Pergunta): Promise<{ success: boolean; error?: string }> {
  try {
    const formularioRef = doc(db, 'formularios', formularioId);
    const formularioDoc = await getDocs(collection(db, 'formularios'));
    
    let formulario: Formulario | null = null;
    formularioDoc.forEach((doc) => {
      if (doc.id === formularioId) {
        formulario = { id: doc.id, ...doc.data() } as Formulario;
      }
    });

    if (!formulario) {
      return { success: false, error: 'Formulário não encontrado.' };
    }

    const perguntasAtualizadas = [...formulario.perguntas, pergunta];
    
    await updateDoc(formularioRef, {
      perguntas: perguntasAtualizadas,
      atualizado_em: serverTimestamp()
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: 'Erro ao adicionar pergunta.' };
  }
}

export async function removerPergunta(formularioId: string, perguntaId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const formularioRef = doc(db, 'formularios', formularioId);
    const formularioDoc = await getDocs(collection(db, 'formularios'));
    
    let formulario: Formulario | null = null;
    formularioDoc.forEach((doc) => {
      if (doc.id === formularioId) {
        formulario = { id: doc.id, ...doc.data() } as Formulario;
      }
    });

    if (!formulario) {
      return { success: false, error: 'Formulário não encontrado.' };
    }

    const perguntasAtualizadas = formulario.perguntas.filter(p => p.id !== perguntaId);
    
    await updateDoc(formularioRef, {
      perguntas: perguntasAtualizadas,
      atualizado_em: serverTimestamp()
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: 'Erro ao remover pergunta.' };
  }
}

export async function ativarFormulario(formularioId: string): Promise<{ success: boolean; error?: string }> {
  return atualizarFormulario(formularioId, { ativo: true });
}

export async function inativarFormulario(formularioId: string): Promise<{ success: boolean; error?: string }> {
  return atualizarFormulario(formularioId, { ativo: false });
}

export async function excluirFormulario(formularioId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteDoc(doc(db, 'formularios', formularioId));
    return { success: true };
  } catch (error: any) {
    return { success: false, error: 'Erro ao excluir formulário.' };
  }
}
