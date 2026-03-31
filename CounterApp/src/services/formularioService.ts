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
  finalizado: boolean; // Novo campo: indica se formulário foi finalizado
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

export async function criarFormulario(
  titulo: string, 
  descricao: string,
  perguntas?: Pergunta[]
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    console.log('[formularioService] criarFormulario:', { titulo, perguntasCount: perguntas?.length || 0 });
    
    const formularioRef = doc(collection(db, 'formularios'));

    // Filtra undefined das perguntas
    const perguntasFiltradas = (perguntas || []).map((pergunta: any) => {
      const perguntaFiltrada: any = {};
      Object.keys(pergunta).forEach(k => {
        if (pergunta[k] !== undefined) {
          perguntaFiltrada[k] = pergunta[k];
        }
      });
      return perguntaFiltrada;
    });

    const dados = {
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      ativo: true,
      finalizado: false,
      perguntas: perguntasFiltradas,
      criado_em: serverTimestamp(),
      atualizado_em: serverTimestamp()
    };
    
    console.log('[formularioService] Dados para salvar:', dados);

    await setDoc(formularioRef, dados);
    
    console.log('[formularioService] Formulário criado com ID:', formularioRef.id);

    return { success: true, id: formularioRef.id };
  } catch (error: any) {
    console.error('[formularioService] Erro ao criar formulário:', error.message);
    return { success: false, error: 'Erro ao criar formulário.' };
  }
}

export async function atualizarFormulario(id: string, dados: Partial<Formulario>): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[formularioService] atualizarFormulario:', { id, dados });
    
    // Filtra valores undefined (updateDoc não aceita undefined)
    const dadosFiltrados: any = {};
    Object.keys(dados).forEach(key => {
      let value = dados[key as keyof typeof dados];
      
      // Se for array de perguntas, filtra undefined de cada pergunta
      if (key === 'perguntas' && Array.isArray(value)) {
        value = value.map((pergunta: any) => {
          const perguntaFiltrada: any = {};
          Object.keys(pergunta).forEach(k => {
            if (pergunta[k] !== undefined) {
              perguntaFiltrada[k] = pergunta[k];
            }
          });
          return perguntaFiltrada;
        });
      }
      
      if (value !== undefined) {
        dadosFiltrados[key] = value;
      }
    });
    
    console.log('[formularioService] dadosFiltrados:', dadosFiltrados);
    
    const formularioRef = doc(db, 'formularios', id);

    await updateDoc(formularioRef, {
      ...dadosFiltrados,
      atualizado_em: serverTimestamp()
    });
    
    console.log('[formularioService] Formulário atualizado com sucesso');

    return { success: true };
  } catch (error: any) {
    console.error('[formularioService] Erro ao atualizar formulário:', error.message);
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

export async function finalizarFormulario(formularioId: string): Promise<{ success: boolean; error?: string }> {
  return atualizarFormulario(formularioId, { finalizado: true });
}

export async function reabrirFormulario(formularioId: string): Promise<{ success: boolean; error?: string }> {
  return atualizarFormulario(formularioId, { finalizado: false });
}

export async function excluirFormulario(formularioId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteDoc(doc(db, 'formularios', formularioId));
    return { success: true };
  } catch (error: any) {
    return { success: false, error: 'Erro ao excluir formulário.' };
  }
}
