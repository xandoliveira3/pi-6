import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { listarFormularios } from '@services/formularioService';
import { getEstatisticasFormulario, getListaUsuariosPorFormulario } from '@services/respostasService';
import BarChart from '@components/BarChart';
import PieChart from '@components/PieChart';

interface DashboardScreenProps {
  zoomLevel?: number;
}

interface FormularioStats {
  formulario: any;
  estatisticas: any;
  listaUsuarios: any;
}

export default function DashboardScreen({ zoomLevel = 1 }: DashboardScreenProps) {
  const scale = (base: number) => base * zoomLevel;
  const [loading, setLoading] = useState(true);
  const [formulariosStats, setFormulariosStats] = useState<FormularioStats[]>([]);
  const [modalListaVisible, setModalListaVisible] = useState(false);
  const [modalDadosVisible, setModalDadosVisible] = useState(false);
  const [formularioSelecionado, setFormularioSelecionado] = useState<any | null>(null);
  const [dadosSelecionados, setDadosSelecionados] = useState<any | null>(null);

  async function carregarDashboard() {
    setLoading(true);
    try {
      const formularios = await listarFormularios();
      const formulariosAtivos = formularios.filter((f: any) => f.ativo);

      const statsPromises = formulariosAtivos.map(async (form: any) => {
        const [stats, listaUsuarios] = await Promise.all([
          getEstatisticasFormulario(form.id),
          getListaUsuariosPorFormulario(form.id)
        ]);
        return {
          formulario: form,
          estatisticas: stats,
          listaUsuarios
        };
      });

      const statsResult = await Promise.all(statsPromises);
      setFormulariosStats(statsResult);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarDashboard();
  }, []);

  function abrirListaUsuarios(formulario: any) {
    setFormularioSelecionado(formulario);
    setModalListaVisible(true);
  }

  function abrirDadosDetalhados(formulario: any) {
    const stats = formulariosStats.find(f => f.formulario.id === formulario.id);
    setDadosSelecionados(stats);
    setFormularioSelecionado(formulario);
    setModalDadosVisible(true);
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Carregando dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { fontSize: scale(24) }]}>📊 Dashboard</Text>
        <Text style={[styles.subtitle, { fontSize: scale(14) }]}>Acompanhamento de formulários</Text>
      </View>

      {formulariosStats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>Nenhum formulário ativo</Text>
        </View>
      ) : (
        formulariosStats.map((item, index) => {
          const totalAtivos = item.listaUsuarios.totalAtivos;
          const respondidos = item.listaUsuarios.respondidos.length;
          const faltantes = item.listaUsuarios.faltantes.length;
          const porcentagem = totalAtivos > 0 ? Math.round((respondidos / totalAtivos) * 100) : 0;

          // Dados para gráfico de pizza
          const pieData = [
            { label: 'Respondidos', value: respondidos, color: '#10B981' },
            { label: 'Faltantes', value: faltantes, color: '#EF4444' }
          ];

          return (
            <View key={index} style={styles.formularioCard}>
              {/* Cabeçalho do formulário */}
              <View style={styles.formularioHeader}>
                <View style={styles.formularioInfo}>
                  <Text style={[styles.formularioTitulo, { fontSize: scale(16) }]}>
                    {item.formulario.titulo}
                  </Text>
                  <Text style={[styles.formularioDescricao, { fontSize: scale(12) }]} numberOfLines={2}>
                    {item.formulario.descricao}
                  </Text>
                </View>
                {item.formulario.finalizado && (
                  <View style={styles.badgeFinalizado}>
                    <Text style={styles.badgeText}>✅ Finalizado</Text>
                  </View>
                )}
              </View>

              {/* Progresso */}
              <View style={styles.progressoContainer}>
                <View style={styles.progressoInfo}>
                  <Text style={[styles.progressoTexto, { fontSize: scale(18) }]}>
                    {respondidos}/{totalAtivos}
                  </Text>
                  <Text style={[styles.progressoLabel, { fontSize: scale(12) }]}>
                    {totalAtivos > 1 ? 'pessoas responderam' : 'pessoa respondeu'} ({porcentagem}%)
                  </Text>
                </View>
                
                {/* Barra de progresso */}
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${porcentagem}%`,
                        backgroundColor: porcentagem === 100 ? '#10B981' : '#667eea'
                      }
                    ]}
                  />
                </View>
              </View>

              {/* Gráfico de pizza pequeno */}
              <View style={styles.pieChartSmall}>
                <PieChart
                  data={pieData}
                  size={scale(120)}
                  showLegend={false}
                />
              </View>

              {/* Botões de ação */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.buttonVerLista]}
                  onPress={() => abrirListaUsuarios(item.formulario)}
                >
                  <Text style={styles.actionButtonText}>📋 Ver Lista</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.buttonVerDados,
                    !item.formulario.finalizado && styles.buttonDisabled
                  ]}
                  onPress={() => {
                    if (item.formulario.finalizado) {
                      abrirDadosDetalhados(item.formulario);
                    }
                  }}
                  disabled={!item.formulario.finalizado}
                >
                  <Text style={[
                    styles.actionButtonText,
                    !item.formulario.finalizado && styles.buttonDisabledText
                  ]}>
                    📊 Ver Dados
                  </Text>
                </TouchableOpacity>
              </View>

              {!item.formulario.finalizado && (
                <Text style={[styles.avisoTexto, { fontSize: scale(11) }]}>
                  🔒 Dados detalhados só disponíveis após finalizar o formulário
                </Text>
              )}
            </View>
          );
        })
      )}

      {/* Modal - Lista de Usuários */}
      <Modal
        visible={modalListaVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalListaVisible(false)}
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { width: scale(340), maxHeight: '75%' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { fontSize: scale(16) }]}>
                {formularioSelecionado?.titulo}
              </Text>
              <TouchableOpacity onPress={() => setModalListaVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {/* Respondidos */}
              <View style={styles.listaSection}>
                <Text style={[styles.listaSectionTitle, { fontSize: scale(14), color: '#10B981' }]}>
                  ✅ Respondidos ({formularioSelecionado && 
                    formulariosStats.find(f => f.formulario.id === formularioSelecionado.id)?.listaUsuarios.respondidos.length || 0})
                </Text>
                {formularioSelecionado &&
                  formulariosStats
                    .find(f => f.formulario.id === formularioSelecionado.id)
                    ?.listaUsuarios.respondidos.map((usuario: any, index: number) => (
                      <View key={index} style={styles.usuarioItem}>
                        <Text style={[styles.usuarioNome, { fontSize: scale(13) }]}>
                          {usuario.nome}
                        </Text>
                        <Text style={[styles.usuarioEmail, { fontSize: scale(11) }]}>
                          {usuario.email || 'Sem email'}
                        </Text>
                      </View>
                    ))}
                {formularioSelecionado &&
                  formulariosStats.find(f => f.formulario.id === formularioSelecionado.id)
                    ?.listaUsuarios.respondidos.length === 0 && (
                    <Text style={styles.nenhumUsuario}>Nenhuma pessoa respondeu ainda</Text>
                  )}
              </View>

              {/* Faltantes */}
              <View style={[styles.listaSection, styles.faltantesSection]}>
                <Text style={[styles.listaSectionTitle, { fontSize: scale(14), color: '#EF4444' }]}>
                  ⏳ Faltam Responder ({formularioSelecionado && 
                    formulariosStats.find(f => f.formulario.id === formularioSelecionado.id)?.listaUsuarios.faltantes.length || 0})
                </Text>
                {formularioSelecionado &&
                  formulariosStats
                    .find(f => f.formulario.id === formularioSelecionado.id)
                    ?.listaUsuarios.faltantes.map((usuario: any, index: number) => (
                      <View key={index} style={styles.usuarioItem}>
                        <Text style={[styles.usuarioNome, { fontSize: scale(13) }]}>
                          {usuario.nome}
                        </Text>
                        <Text style={[styles.usuarioEmail, { fontSize: scale(11) }]}>
                          {usuario.email || 'Sem email'}
                        </Text>
                      </View>
                    ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal - Dados Detalhados */}
      <Modal
        visible={modalDadosVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalDadosVisible(false)}
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { width: scale(380), maxHeight: '85%' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { fontSize: scale(16) }]}>
                📊 Dados Detalhados - {formularioSelecionado?.titulo}
              </Text>
              <TouchableOpacity onPress={() => setModalDadosVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {dadosSelecionados?.estatisticas?.perguntas?.map((pergunta: any, qIndex: number) => {
                const chartData = pergunta.alternativas?.map((alt: string) => {
                  const stats = pergunta.estatisticasAlternativa?.[alt] || { count: 0, percentage: 0 };
                  return {
                    label: alt.length > 20 ? alt.substring(0, 20) + '...' : alt,
                    value: stats.count,
                    percentage: stats.percentage
                  };
                }) || [];

                const temGrafico = chartData.length > 0 && pergunta.totalRespostas > 0;

                return (
                  <View key={qIndex} style={styles.dadosPergunta}>
                    <Text style={[styles.dadosPerguntaTitulo, { fontSize: scale(14) }]}>
                      {qIndex + 1}. {pergunta.pergunta}
                    </Text>
                    <Text style={[styles.dadosPerguntaTipo, { fontSize: scale(11) }]}>
                      {pergunta.tipo === 'dissertativa' ? '📝 Dissertativa' : 
                       temGrafico ? '📊 Múltipla Escolha' : `⭐ ${pergunta.tipoAlternativa}`}
                    </Text>
                    
                    {temGrafico && (
                      <BarChart
                        data={chartData}
                        height={scale(160)}
                        showValues={true}
                        showPercentages={true}
                      />
                    )}

                    {!temGrafico && pergunta.tipo !== 'dissertativa' && (
                      <View style={styles.dadosResumo}>
                        <Text style={[styles.dadosResumoLabel, { fontSize: scale(12) }]}>
                          Média das respostas:
                        </Text>
                        <Text style={[styles.dadosResumoValor, { fontSize: scale(16) }]}>
                          {pergunta.media?.toFixed(1) || 0}
                        </Text>
                      </View>
                    )}

                    {pergunta.tipo === 'dissertativa' && (
                      <Text style={[styles.dadosDissertativa, { fontSize: scale(11) }]}>
                        {pergunta.totalRespostas} resposta(s) textual(ais) - ver detalhes completos
                      </Text>
                    )}
                  </View>
                );
              })}
            </ScrollView>
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
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subtitle: {
    color: '#6B7280',
    marginTop: 4,
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
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
  formularioCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  formularioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  formularioInfo: {
    flex: 1,
  },
  formularioTitulo: {
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  formularioDescricao: {
    color: '#6B7280',
  },
  badgeFinalizado: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  badgeText: {
    color: '#065F46',
    fontSize: 11,
    fontWeight: '600',
  },
  progressoContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  progressoInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 8,
  },
  progressoTexto: {
    fontWeight: '700',
    color: '#1F2937',
  },
  progressoLabel: {
    color: '#6B7280',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  pieChartSmall: {
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonVerLista: {
    backgroundColor: '#667eea',
  },
  buttonVerDados: {
    backgroundColor: '#10B981',
  },
  buttonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  buttonDisabledText: {
    color: '#9CA3AF',
  },
  avisoTexto: {
    color: '#9CA3AF',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9998,
    elevation: 1000,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    zIndex: 9999,
    elevation: 1001,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
  },
  modalClose: {
    fontSize: 24,
    color: '#9CA3AF',
    fontWeight: '700',
  },
  modalScroll: {
    padding: 16,
  },
  listaSection: {
    marginBottom: 16,
  },
  listaSectionTitle: {
    fontWeight: '700',
    marginBottom: 8,
  },
  faltantesSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  usuarioItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
    padding: 10,
    marginBottom: 6,
  },
  usuarioNome: {
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  usuarioEmail: {
    color: '#6B7280',
  },
  nenhumUsuario: {
    color: '#9CA3AF',
    fontStyle: 'italic',
    fontSize: 13,
    padding: 8,
  },
  dadosPergunta: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  dadosPerguntaTitulo: {
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  dadosPerguntaTipo: {
    color: '#9CA3AF',
    marginBottom: 8,
  },
  dadosResumo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  dadosResumoLabel: {
    color: '#6B7280',
  },
  dadosResumoValor: {
    fontWeight: '700',
    color: '#667eea',
  },
  dadosDissertativa: {
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
});
