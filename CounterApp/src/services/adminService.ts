import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Usuario } from '../types/usuario';

export interface UsuarioCompleto extends Usuario {
  id: string;
}

export async function listarUsuarios(): Promise<UsuarioCompleto[]> {
  console.log('[AdminService] Listando usuários...');
  
  try {
    const usuariosRef = collection(db, 'usuarios');
    const snapshot = await getDocs(usuariosRef);
    
    const usuarios: UsuarioCompleto[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data() as Usuario;
      usuarios.push({
        id: doc.id,
        ...data
      });
    });
    
    console.log('[AdminService] Usuários encontrados:', usuarios.length);
    
    // Ordena: pendentes primeiro, depois por nome
    usuarios.sort((a, b) => {
      if (a.ativo !== b.ativo) {
        return a.ativo ? 1 : -1; // Inativos (pendentes) primeiro
      }
      return a.nome.localeCompare(b.nome);
    });
    
    return usuarios;
  } catch (error: any) {
    console.log('[AdminService] Erro ao listar usuários:', error.message);
    return [];
  }
}

export async function ativarUsuario(usuarioId: string): Promise<{ success: boolean; error?: string }> {
  console.log('[AdminService] Ativando usuário:', usuarioId);
  
  try {
    const usuarioRef = doc(db, 'usuarios', usuarioId);
    
    await updateDoc(usuarioRef, {
      ativo: true,
      atualizado_em: new Date()
    });
    
    console.log('[AdminService] ✅ Usuário ativado!');
    
    return { success: true };
  } catch (error: any) {
    console.log('[AdminService] ❌ Erro ao ativar:', error.message);
    return { 
      success: false, 
      error: 'Erro ao ativar usuário. Tente novamente.' 
    };
  }
}

export async function inativarUsuario(usuarioId: string): Promise<{ success: boolean; error?: string }> {
  console.log('[AdminService] Inativando usuário:', usuarioId);
  
  try {
    const usuarioRef = doc(db, 'usuarios', usuarioId);
    
    await updateDoc(usuarioRef, {
      ativo: false,
      atualizado_em: new Date()
    });
    
    console.log('[AdminService] ✅ Usuário inativado!');
    
    return { success: true };
  } catch (error: any) {
    console.log('[AdminService] ❌ Erro ao inativar:', error.message);
    return { 
      success: false, 
      error: 'Erro ao inativar usuário. Tente novamente.' 
    };
  }
}

export async function removerUsuario(usuarioId: string): Promise<{ success: boolean; error?: string }> {
  console.log('[AdminService] Removendo usuário:', usuarioId);
  
  try {
    const usuarioRef = doc(db, 'usuarios', usuarioId);
    
    await updateDoc(usuarioRef, {
      ativo: false,
      atualizado_em: new Date()
    });
    
    console.log('[AdminService] ✅ Usuário removido (marcado como inativo)!');
    
    return { success: true };
  } catch (error: any) {
    console.log('[AdminService] ❌ Erro ao remover:', error.message);
    return { 
      success: false, 
      error: 'Erro ao remover usuário. Tente novamente.' 
    };
  }
}
