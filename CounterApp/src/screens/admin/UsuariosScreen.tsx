import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import { listarUsuarios, ativarUsuario, inativarUsuario } from '../../services/adminService';

export interface UsuarioCompleto {
  id: string;
  nome: string;
  email: string;
  tipo_usuario: 'admin' | 'usuario';
  ativo: boolean;
  criado_em?: any;
  atualizado_em?: any;
}

interface UsuariosScreenProps {
  zoomLevel?: number;
}

export default function UsuariosScreen({ zoomLevel = 1 }: UsuariosScreenProps) {
  const [usuarios, setUsuarios] = useState<UsuarioCompleto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuUsuario, setMenuUsuario] = useState<UsuarioCompleto | null>(null);
  const [confirmacaoVisible, setConfirmacaoVisible] = useState(false);
  const [acaoPendente, setAcaoPendente] = useState<'ativar' | 'inativar' | null>(null);
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro', texto: string } | null>(null);
  
  // Filtro e busca
  const [busca, setBusca] = useState('');
  const [filtroAtivo, setFiltroAtivo] = useState<'todos' | 'pendentes' | 'ativos' | 'inativos'>('todos');

  async function carregarUsuarios() {
    setLoading(true);
    const lista = await listarUsuarios();
    setUsuarios(lista);
    setLoading(false);
  }

  useEffect(() => {
    carregarUsuarios();
  }, []);

  // Esconde mensagem após 3 segundos
  useEffect(() => {
    if (mensagem) {
      const timer = setTimeout(() => setMensagem(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [mensagem]);

  function abrirMenu(usuario: UsuarioCompleto) {
    setMenuUsuario(usuario);
    setConfirmacaoVisible(true);
  }

  function fecharMenu() {
    setConfirmacaoVisible(false);
    setMenuUsuario(null);
    setAcaoPendente(null);
  }

  async function confirmarAcao(tipo: 'ativar' | 'inativar') {
    if (!menuUsuario) return;
    
    setAcaoPendente(tipo);
    
    try {
      const result = tipo === 'ativar' 
        ? await ativarUsuario(menuUsuario.id)
        : await inativarUsuario(menuUsuario.id);
      
      if (result.success) {
        await carregarUsuarios();
        setMensagem({
          tipo: 'sucesso',
          texto: `Usuário ${tipo === 'ativar' ? 'ativado' : 'inativado'} com sucesso!`
        });
      } else {
        setMensagem({
          tipo: 'erro',
          texto: result.error || 'Erro na operação.'
        });
      }
    } catch (error: any) {
      setMensagem({
        tipo: 'erro',
        texto: 'Erro ao processar. Tente novamente.'
      });
    } finally {
      setAcaoPendente(null);
      fecharMenu();
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await carregarUsuarios();
    setRefreshing(false);
  }

  // Filtrar usuários
  function filtrarUsuarios() {
    let filtrados = usuarios;

    // Filtro por busca (nome ou email)
    if (busca.trim()) {
      const buscaLower = busca.toLowerCase().trim();
      filtrados = filtrados.filter(u => 
        u.nome.toLowerCase().includes(buscaLower) ||
        u.email.toLowerCase().includes(buscaLower)
      );
    }

    // Filtro por status
    if (filtroAtivo === 'pendentes') {
      filtrados = filtrados.filter(u => !u.ativo && u.tipo_usuario === 'usuario');
    } else if (filtroAtivo === 'ativos') {
      filtrados = filtrados.filter(u => u.ativo && u.tipo_usuario === 'usuario');
    } else if (filtroAtivo === 'inativos') {
      filtrados = filtrados.filter(u => !u.ativo && u.tipo_usuario === 'usuario');
    }
    // 'todos' não filtra nada

    return filtrados;
  }

  const usuariosFiltrados = filtrarUsuarios();
  const pendentes = usuariosFiltrados.filter(u => !u.ativo && u.tipo_usuario === 'usuario');
  const ativos = usuariosFiltrados.filter(u => u.ativo && u.tipo_usuario === 'usuario');
  const inativos = usuariosFiltrados.filter(u => !u.ativo && u.tipo_usuario === 'usuario');
  const admins = usuariosFiltrados.filter(u => u.tipo_usuario === 'admin');

  // Escala de fontes e tamanhos baseada no zoom
  const scale = (base: number) => base * zoomLevel;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={[styles.loadingText, { fontSize: scale(14) }]}>Carregando usuários...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Mensagem de Feedback */}
      {mensagem && (
        <View style={[styles.mensagemBox, mensagem.tipo === 'sucesso' ? styles.mensagemSucesso : styles.mensagemErro]}>
          <Text style={styles.mensagemIcon}>{mensagem.tipo === 'sucesso' ? '✅' : '❌'}</Text>
          <Text style={styles.mensagemTexto}>{mensagem.texto}</Text>
        </View>
      )}

      {/* Barra de Busca e Filtros */}
      <View style={styles.filtroContainer}>
        <View style={styles.buscaWrapper}>
          <Text style={styles.buscaIcon}>🔍</Text>
          <TextInput
            style={styles.buscaInput}
            placeholder="Buscar por nome ou email..."
            placeholderTextColor="#9CA3AF"
            value={busca}
            onChangeText={setBusca}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {busca.length > 0 && (
            <TouchableOpacity onPress={() => setBusca('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.buscaClear}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filtros de Status */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filtrosScroll}
          contentContainerStyle={styles.filtrosContent}
        >
          <TouchableOpacity
            style={[styles.filtroChip, filtroAtivo === 'todos' && styles.filtroChipAtivo]}
            onPress={() => setFiltroAtivo('todos')}
          >
            <Text style={[styles.filtroChipText, filtroAtivo === 'todos' && styles.filtroChipTextAtivo]}>
              Todos ({usuarios.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filtroChip, filtroAtivo === 'pendentes' && styles.filtroChipAtivo]}
            onPress={() => setFiltroAtivo('pendentes')}
          >
            <Text style={[styles.filtroChipText, filtroAtivo === 'pendentes' && styles.filtroChipTextAtivo]}>
              ⏳ Pendentes ({pendentes.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filtroChip, filtroAtivo === 'ativos' && styles.filtroChipAtivo]}
            onPress={() => setFiltroAtivo('ativos')}
          >
            <Text style={[styles.filtroChipText, filtroAtivo === 'ativos' && styles.filtroChipTextAtivo]}>
              ✅ Ativos ({ativos.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filtroChip, filtroAtivo === 'inativos' && styles.filtroChipAtivo]}
            onPress={() => setFiltroAtivo('inativos')}
          >
            <Text style={[styles.filtroChipText, filtroAtivo === 'inativos' && styles.filtroChipTextAtivo]}>
              🚫 Inativos ({inativos.length})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Resumo */}
      <View style={styles.resumoContainer}>
        <View style={styles.resumoCard}>
          <Text style={[styles.resumoNumero, { fontSize: scale(24) }]}>{pendentes.length}</Text>
          <Text style={[styles.resumoLabel, { fontSize: scale(11) }]}>Pendentes</Text>
        </View>
        <View style={[styles.resumoCard, styles.resumoCardAtivo]}>
          <Text style={[styles.resumoNumero, styles.resumoNumeroAtivo, { fontSize: scale(24) }]}>{ativos.length}</Text>
          <Text style={[styles.resumoLabel, styles.resumoLabelAtivo, { fontSize: scale(11) }]}>Ativos</Text>
        </View>
        <View style={[styles.resumoCard, styles.resumoCardInativo]}>
          <Text style={[styles.resumoNumero, styles.resumoNumeroInativo, { fontSize: scale(24) }]}>{inativos.length}</Text>
          <Text style={[styles.resumoLabel, styles.resumoLabelInativo, { fontSize: scale(11) }]}>Inativos</Text>
        </View>
        <View style={[styles.resumoCard, styles.resumoCardAdmin]}>
          <Text style={[styles.resumoNumero, styles.resumoNumeroAdmin, { fontSize: scale(24) }]}>{admins.length}</Text>
          <Text style={[styles.resumoLabel, styles.resumoLabelAdmin, { fontSize: scale(11) }]}>Admins</Text>
        </View>
      </View>

      {/* Administradores (sempre visível) */}
      {admins.length > 0 && filtroAtivo === 'todos' && !busca && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: scale(15) }]}>👑 Administradores</Text>
          {admins.map((usuario) => (
            <View key={usuario.id} style={[styles.card, styles.cardAdmin]}>
              <View style={styles.cardHeader}>
                <View style={[styles.avatar, styles.avatarAdmin, { width: scale(44), height: scale(44), borderRadius: scale(22) }]}>
                  <Text style={[styles.avatarText, { fontSize: scale(18) }]}>{usuario.nome.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={[styles.cardNome, { fontSize: scale(15) }]}>{usuario.nome}</Text>
                  <Text style={[styles.cardEmail, { fontSize: scale(13) }]}>{usuario.email}</Text>
                </View>
                <TouchableOpacity
                  style={styles.menuButton}
                  onPress={() => abrirMenu(usuario)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={[styles.menuButtonIcon, { fontSize: scale(20) }]}>⚙️</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.cardStatus}>
                <View style={styles.statusBadgeAdmin}>
                  <Text style={[styles.statusBadgeText, styles.statusBadgeTextAdmin, { fontSize: scale(11) }]}>Admin</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Pendentes de Aprovação */}
      {(pendentes.length > 0 && (filtroAtivo === 'todos' || filtroAtivo === 'pendentes')) && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: scale(15) }]}>⏳ Pendentes de Aprovação</Text>
          {pendentes.map((usuario) => (
            <View key={usuario.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.avatar, { width: scale(44), height: scale(44), borderRadius: scale(22) }]}>
                  <Text style={[styles.avatarText, { fontSize: scale(18) }]}>
                    {usuario.nome.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={[styles.cardNome, { fontSize: scale(15) }]}>{usuario.nome}</Text>
                  <Text style={[styles.cardEmail, { fontSize: scale(13) }]}>{usuario.email}</Text>
                </View>
                <TouchableOpacity
                  style={styles.menuButton}
                  onPress={() => abrirMenu(usuario)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={[styles.menuButtonIcon, { fontSize: scale(20) }]}>⚙️</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.cardStatus}>
                <View style={styles.statusBadgePendente}>
                  <Text style={[styles.statusBadgeText, { fontSize: scale(11) }]}>Pendente</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Usuários Ativos */}
      {(ativos.length > 0 && (filtroAtivo === 'todos' || filtroAtivo === 'ativos')) && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: scale(15) }]}>✅ Usuários Ativos</Text>
          {ativos.map((usuario) => (
            <View key={usuario.id} style={[styles.card, styles.cardAtivo]}>
              <View style={styles.cardHeader}>
                <View style={[styles.avatar, styles.avatarAtivo, { width: scale(44), height: scale(44), borderRadius: scale(22) }]}>
                  <Text style={[styles.avatarText, { fontSize: scale(18) }]}>{usuario.nome.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={[styles.cardNome, { fontSize: scale(15) }]}>{usuario.nome}</Text>
                  <Text style={[styles.cardEmail, { fontSize: scale(13) }]}>{usuario.email}</Text>
                </View>
                <TouchableOpacity
                  style={styles.menuButton}
                  onPress={() => abrirMenu(usuario)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={[styles.menuButtonIcon, { fontSize: scale(20) }]}>⚙️</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.cardStatus}>
                <View style={styles.statusBadgeAtivo}>
                  <Text style={[styles.statusBadgeText, styles.statusBadgeTextAtivo, { fontSize: scale(11) }]}>Ativo</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Usuários Inativos */}
      {(inativos.length > 0 && (filtroAtivo === 'todos' || filtroAtivo === 'inativos')) && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: scale(15) }]}>🚫 Usuários Inativos</Text>
          {inativos.map((usuario) => (
            <View key={usuario.id} style={[styles.card, styles.cardInativo]}>
              <View style={styles.cardHeader}>
                <View style={[styles.avatar, styles.avatarInativo, { width: scale(44), height: scale(44), borderRadius: scale(22) }]}>
                  <Text style={[styles.avatarText, { fontSize: scale(18) }]}>{usuario.nome.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={[styles.cardNome, { fontSize: scale(15) }]}>{usuario.nome}</Text>
                  <Text style={[styles.cardEmail, { fontSize: scale(13) }]}>{usuario.email}</Text>
                </View>
                <TouchableOpacity
                  style={styles.menuButton}
                  onPress={() => abrirMenu(usuario)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={[styles.menuButtonIcon, { fontSize: scale(20) }]}>⚙️</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.cardStatus}>
                <View style={styles.statusBadgeInativo}>
                  <Text style={[styles.statusBadgeText, styles.statusBadgeTextInativo, { fontSize: scale(11) }]}>Inativo</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Mensagem de nenhum resultado */}
      {usuariosFiltrados.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyIcon, { fontSize: scale(48) }]}>📭</Text>
          <Text style={[styles.emptyText, { fontSize: scale(14) }]}>
            {busca ? `Nenhum usuário encontrado para "${busca}"` : 'Nenhum usuário cadastrado'}
          </Text>
          {busca && (
            <TouchableOpacity onPress={() => { setBusca(''); setFiltroAtivo('todos'); }}>
              <Text style={styles.emptyLink}>Limpar filtros</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Modal de Confirmação */}
      <Modal
        visible={confirmacaoVisible}
        transparent
        animationType="fade"
        onRequestClose={fecharMenu}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { transform: [{ scale: zoomLevel }] }]}>
            {menuUsuario && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { fontSize: scale(18) }]}>Gerenciar Usuário</Text>
                  <Text style={[styles.modalSubtitle, { fontSize: scale(13) }]}>{menuUsuario.nome}</Text>
                  <Text style={[styles.modalEmail, { fontSize: scale(12) }]}>{menuUsuario.email}</Text>
                </View>
                
                <View style={styles.modalStatus}>
                  <Text style={styles.modalStatusLabel}>Status atual:</Text>
                  <View style={[styles.modalStatusBadge, menuUsuario.ativo ? styles.modalStatusAtivo : styles.modalStatusPendente]}>
                    <Text style={[styles.modalStatusText, menuUsuario.ativo ? styles.modalStatusAtivoText : styles.modalStatusPendenteText]}>
                      {menuUsuario.ativo ? '✅ Ativo' : '⏳ Pendente'}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.modalOption, styles.modalOptionAtivar]}
                  onPress={() => confirmarAcao('ativar')}
                  disabled={acaoPendente !== null}
                >
                  <Text style={styles.modalOptionIcon}>✅</Text>
                  <Text style={styles.modalOptionText}>
                    {menuUsuario.ativo ? 'Manter Ativo' : 'Ativar Usuário'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalOption, styles.modalOptionInativar]}
                  onPress={() => confirmarAcao('inativar')}
                  disabled={acaoPendente !== null}
                >
                  <Text style={styles.modalOptionIcon}>🚫</Text>
                  <Text style={styles.modalOptionText}>
                    {menuUsuario.ativo ? 'Inativar Usuário' : 'Manter Inativo'}
                  </Text>
                </TouchableOpacity>

                {acaoPendente && (
                  <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="small" color="#667eea" />
                    <Text style={styles.loadingText}>Processando...</Text>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.modalCancel}
                  onPress={fecharMenu}
                  disabled={acaoPendente !== null}
                >
                  <Text style={styles.modalCancelText}>Cancelar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  loadingText: {
    marginTop: 12,
    color: '#6B7280',
  },
  // Mensagem de feedback
  mensagemBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    margin: 16,
    borderRadius: 10,
    gap: 10,
  },
  mensagemSucesso: {
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#059669',
  },
  mensagemErro: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  mensagemIcon: {
    fontSize: 18,
  },
  mensagemTexto: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  // Filtro e Busca
  filtroContainer: {
    backgroundColor: '#fff',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  buscaWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 2,
  },
  buscaIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  buscaInput: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    paddingVertical: 12,
  },
  buscaClear: {
    fontSize: 18,
    color: '#9CA3AF',
    padding: 4,
  },
  filtrosScroll: {
    maxHeight: 44,
  },
  filtrosContent: {
    gap: 8,
  },
  filtroChip: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filtroChipAtivo: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  filtroChipText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  filtroChipTextAtivo: {
    color: '#fff',
    fontWeight: '600',
  },
  // Resumo
  resumoContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  resumoCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  resumoCardAtivo: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  resumoCardInativo: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  resumoCardAdmin: {
    backgroundColor: '#F5F3FF',
    borderColor: '#DDD6FE',
  },
  resumoNumero: {
    fontWeight: 'bold',
    color: '#6B7280',
  },
  resumoNumeroAtivo: {
    color: '#059669',
  },
  resumoNumeroInativo: {
    color: '#DC2626',
  },
  resumoNumeroAdmin: {
    color: '#7C3AED',
  },
  resumoLabel: {
    color: '#9CA3AF',
    marginTop: 4,
  },
  resumoLabelAtivo: {
    color: '#059669',
  },
  resumoLabelInativo: {
    color: '#DC2626',
  },
  resumoLabelAdmin: {
    color: '#7C3AED',
  },
  // Sections
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardAtivo: {
    borderColor: '#A7F3D0',
    backgroundColor: '#F0FDF4',
  },
  cardInativo: {
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  cardAdmin: {
    borderColor: '#DDD6FE',
    backgroundColor: '#F5F3FF',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#667eea',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarAtivo: {
    backgroundColor: '#10B981',
  },
  avatarInativo: {
    backgroundColor: '#EF4444',
  },
  avatarAdmin: {
    backgroundColor: '#7C3AED',
  },
  avatarText: {
    fontWeight: 'bold',
    color: '#fff',
  },
  cardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cardNome: {
    fontWeight: '600',
    color: '#1F2937',
  },
  cardEmail: {
    color: '#6B7280',
    marginTop: 2,
  },
  menuButton: {
    padding: 8,
  },
  menuButtonIcon: {
  },
  cardStatus: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  statusBadgePendente: {
    backgroundColor: '#FEF3C7',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusBadgeAtivo: {
    backgroundColor: '#D1FAE5',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusBadgeInativo: {
    backgroundColor: '#FEE2E2',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusBadgeAdmin: {
    backgroundColor: '#EDE9FE',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusBadgeText: {
    fontWeight: '600',
  },
  statusBadgeTextAtivo: {
    color: '#059669',
  },
  statusBadgeTextInativo: {
    color: '#DC2626',
  },
  statusBadgeTextAdmin: {
    color: '#7C3AED',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    marginBottom: 12,
  },
  emptyText: {
    color: '#6B7280',
    textAlign: 'center',
  },
  emptyLink: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '85%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    alignItems: 'center',
  },
  modalTitle: {
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
  },
  modalSubtitle: {
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '500',
  },
  modalEmail: {
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 2,
  },
  modalStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
  },
  modalStatusLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  modalStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  modalStatusAtivo: {
    backgroundColor: '#D1FAE5',
  },
  modalStatusPendente: {
    backgroundColor: '#FEF3C7',
  },
  modalStatusText: {
    fontWeight: '600',
    fontSize: 12,
  },
  modalStatusAtivoText: {
    color: '#059669',
  },
  modalStatusPendenteText: {
    color: '#92400E',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  modalOptionAtivar: {
    backgroundColor: '#F0FDF4',
    borderColor: '#A7F3D0',
  },
  modalOptionInativar: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  modalOptionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  modalOptionText: {
    fontWeight: '600',
    fontSize: 15,
    color: '#1F2937',
  },
  loadingOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    marginBottom: 10,
  },
  modalCancel: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  modalCancelText: {
    fontWeight: '600',
    fontSize: 14,
    color: '#6B7280',
  },
});
