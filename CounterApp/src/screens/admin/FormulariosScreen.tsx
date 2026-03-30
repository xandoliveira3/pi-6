import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { listarFormularios, ativarFormulario, inativarFormulario, excluirFormulario } from '../../services/formularioService';
import type { Formulario } from '../../services/formularioService';

interface FormulariosScreenProps {
  zoomLevel?: number;
  onCriarFormulario?: () => void;
  onEditarFormulario?: (formulario: Formulario) => void;
}

export default function FormulariosScreen({ zoomLevel = 1, onCriarFormulario, onEditarFormulario }: FormulariosScreenProps) {
  const [formularios, setFormularios] = useState<Formulario[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState<string | null>(null);

  const scale = (base: number) => base * zoomLevel;

  async function carregarFormularios() {
    setLoading(true);
    const lista = await listarFormularios();
    setFormularios(lista);
    setLoading(false);
  }

  useEffect(() => {
    carregarFormularios();
  }, []);

  async function handleAtivar(formulario: Formulario) {
    const result = await ativarFormulario(formulario.id);
    if (result.success) {
      carregarFormularios();
    } else {
      Alert.alert('Erro', result.error);
    }
  }

  async function handleInativar(formulario: Formulario) {
    const result = await inativarFormulario(formulario.id);
    if (result.success) {
      carregarFormularios();
    } else {
      Alert.alert('Erro', result.error);
    }
  }

  async function handleExcluir(formulario: Formulario) {
    Alert.alert(
      'Excluir Formulário',
      `Tem certeza que deseja excluir "${formulario.titulo}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            const result = await excluirFormulario(formulario.id);
            if (result.success) {
              carregarFormularios();
            } else {
              Alert.alert('Erro', result.error);
            }
          }
        }
      ]
    );
  }

  function abrirMenu(formularioId: string) {
    setMenuVisible(formularioId === menuVisible ? null : formularioId);
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={[styles.loadingText, { fontSize: scale(14) }]}>Carregando formulários...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header com botão de criar */}
      <View style={styles.header}>
        <Text style={[styles.title, { fontSize: scale(20) }]}>📋 Formulários</Text>
        <TouchableOpacity
          style={styles.criarButton}
          onPress={onCriarFormulario}
        >
          <Text style={[styles.criarButtonText, { fontSize: scale(14) }]}>+ Novo</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de formulários */}
      {formularios.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyIcon, { fontSize: scale(48) }]}>📝</Text>
          <Text style={[styles.emptyText, { fontSize: scale(14) }]}>Nenhum formulário criado</Text>
          <Text style={[styles.emptySubtext, { fontSize: scale(12) }]}>Toque em "+ Novo" para criar seu primeiro formulário</Text>
        </View>
      ) : (
        <View style={styles.lista}>
          {formularios.map((formulario) => (
            <View key={formulario.id} style={[styles.card, formulario.ativo ? styles.cardAtivo : styles.cardInativo]}>
              <View style={styles.cardHeader}>
                <View style={styles.cardInfo}>
                  <Text style={[styles.cardTitulo, { fontSize: scale(16) }]}>{formulario.titulo}</Text>
                  <Text style={[styles.cardDescricao, { fontSize: scale(12) }]} numberOfLines={2}>
                    {formulario.descricao}
                  </Text>
                  <View style={styles.cardMeta}>
                    <Text style={[styles.metaItem, { fontSize: scale(11) }]}>
                      📄 {formulario.perguntas?.length || 0} pergunta(s)
                    </Text>
                    <View style={[styles.statusBadge, formulario.ativo ? styles.statusAtivo : styles.statusInativo]}>
                      <Text style={[styles.statusText, { fontSize: scale(10) }]}>
                        {formulario.ativo ? '✅ Ativo' : '🚫 Inativo'}
                      </Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.menuContainer}>
                  <TouchableOpacity
                    style={styles.menuButton}
                    onPress={() => abrirMenu(formulario.id)}
                  >
                    <Text style={[styles.menuButtonIcon, { fontSize: scale(20) }]}>⚙️</Text>
                  </TouchableOpacity>

                  {menuVisible === formulario.id && (
                    <View style={styles.menu}>
                      <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => {
                          abrirMenu(null);
                          onEditarFormulario?.(formulario);
                        }}
                      >
                        <Text style={[styles.menuItemText, { fontSize: scale(13) }]}>✏️ Editar</Text>
                      </TouchableOpacity>
                      
                      {formulario.ativo ? (
                        <TouchableOpacity
                          style={styles.menuItem}
                          onPress={() => {
                            abrirMenu(null);
                            handleInativar(formulario);
                          }}
                        >
                          <Text style={[styles.menuItemText, { fontSize: scale(13) }]}>🚫 Inativar</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={styles.menuItem}
                          onPress={() => {
                            abrirMenu(null);
                            handleAtivar(formulario);
                          }}
                        >
                          <Text style={[styles.menuItemText, { fontSize: scale(13) }]}>✅ Ativar</Text>
                        </TouchableOpacity>
                      )}
                      
                      <TouchableOpacity
                        style={[styles.menuItem, styles.menuItemDelete]}
                        onPress={() => {
                          abrirMenu(null);
                          handleExcluir(formulario);
                        }}
                      >
                        <Text style={[styles.menuItemText, { fontSize: scale(13) }]}>🗑️ Excluir</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontWeight: 'bold',
    color: '#1F2937',
  },
  criarButton: {
    backgroundColor: '#667eea',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  criarButtonText: {
    color: '#fff',
    fontWeight: '600',
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#9CA3AF',
    textAlign: 'center',
  },
  lista: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitulo: {
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  cardDescricao: {
    color: '#6B7280',
    marginBottom: 8,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaItem: {
    color: '#9CA3AF',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusAtivo: {
    backgroundColor: '#D1FAE5',
  },
  statusInativo: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontWeight: '600',
  },
  menuContainer: {
    position: 'relative',
  },
  menuButton: {
    padding: 8,
  },
  menuButtonIcon: {
  },
  menu: {
    position: 'absolute',
    right: 0,
    top: 40,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 140,
    overflow: 'hidden',
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemDelete: {
    borderBottomWidth: 0,
  },
  menuItemText: {
    color: '#374151',
  },
});
