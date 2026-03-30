import { collection, getDocs, doc, setDoc, updateDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface RespostaFormulario {
  id: string;
  formularioId: string;
  usuarioId: string; // Hash para anonimato
  respostas: {
    perguntaId: string;
    valor: any;
  }[];
  enviado_em: any;
}

// Gera hash anônimo para o usuário
export function gerarHashUsuario(usuarioId: string): string {
  // Hash simples para anonimizar - não reversível
  const salt = 'form-anonimo-salt-2026';
  let hash = 0;
  const str = usuarioId + salt;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

export async function salvarRespostas(
  formularioId: string,
  usuarioId: string,
  respostas: { perguntaId: string; valor: any }[]
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[respostasService] Salvando respostas:', {
      formularioId,
      usuarioId,
      respostasCount: respostas.length
    });

    const hashUsuario = gerarHashUsuario(usuarioId);
    console.log('[respostasService] Hash gerado:', hashUsuario);

    // Verifica se usuário já respondeu
    const respostasRef = collection(db, 'respostas_formularios');
    const q = query(
      respostasRef,
      where('formularioId', '==', formularioId),
      where('usuarioHash', '==', hashUsuario)
    );
    const snapshot = await getDocs(q);

    console.log('[respostasService] Respostas existentes:', snapshot.size);

    if (!snapshot.empty) {
      return { success: false, error: 'Você já respondeu este formulário.' };
    }

    // Salva resposta anônima
    const respostaDoc = doc(respostasRef);
    console.log('[respostasService] Salvando no documento:', respostaDoc.id);
    
    await setDoc(respostaDoc, {
      formularioId,
      usuarioHash: hashUsuario, // Hash anônimo, não o ID real
      respostas,
      enviado_em: serverTimestamp()
    });

    console.log('[respostasService] Respostas salvas com sucesso!');

    return { success: true };
  } catch (error: any) {
    console.error('[respostasService] Erro ao salvar respostas:', error.message);
    return { success: false, error: 'Erro ao enviar respostas.' };
  }
}

export async function verificarSeJaRespondeu(
  formularioId: string,
  usuarioId: string
): Promise<boolean> {
  try {
    const hashUsuario = gerarHashUsuario(usuarioId);
    const respostasRef = collection(db, 'respostas_formularios');
    const q = query(
      respostasRef,
      where('formularioId', '==', formularioId),
      where('usuarioHash', '==', hashUsuario)
    );
    const snapshot = await getDocs(q);
    
    return !snapshot.empty;
  } catch (error: any) {
    console.error('Erro ao verificar respostas:', error.message);
    return false;
  }
}

export async function listarRespostasFormulario(formularioId: string): Promise<any[]> {
  try {
    const respostasRef = collection(db, 'respostas_formularios');
    const q = query(
      respostasRef,
      where('formularioId', '==', formularioId)
    );
    const snapshot = await getDocs(q);
    
    const respostas: any[] = [];
    snapshot.forEach((doc) => {
      respostas.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return respostas;
  } catch (error: any) {
    console.error('Erro ao listar respostas:', error.message);
    return [];
  }
}

export async function getEstatisticasFormulario(formularioId: string): Promise<{
  totalRespostas: number;
  perguntas: any[];
}> {
  try {
    const respostas = await listarRespostasFormulario(formularioId);
    
    // Busca o formulário para pegar as perguntas
    const formRef = doc(db, 'formularios', formularioId);
    const formSnap = await getDocs(collection(db, 'formularios'));
    
    let formulario: any = null;
    formSnap.forEach((doc) => {
      if (doc.id === formularioId) {
        formulario = { id: doc.id, ...doc.data() };
      }
    });
    
    if (!formulario) {
      return { totalRespostas: 0, perguntas: [] };
    }
    
    // Processa estatísticas por pergunta
    const perguntasEstatisticas = formulario.perguntas?.map((pergunta: any) => {
      const respostasPergunta = respostas.map((r: any) => {
        const resp = r.respostas?.find((p: any) => p.perguntaId === pergunta.id);
        return resp?.valor;
      }).filter((v: any) => v !== undefined);
      
      return {
        pergunta: pergunta.titulo,
        tipo: pergunta.tipo,
        tipoAlternativa: pergunta.tipoAlternativa,
        totalRespostas: respostasPergunta.length,
        respostas: respostasPergunta
      };
    }) || [];
    
    return {
      totalRespostas: respostas.length,
      perguntas: perguntasEstatisticas
    };
  } catch (error: any) {
    console.error('Erro ao get estatísticas:', error.message);
    return { totalRespostas: 0, perguntas: [] };
  }
}
