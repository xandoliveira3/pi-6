import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { listarFormularios } from '../../services/formularioService';
import { getEstatisticasFormulario, listarRespostasFormulario } from '../../services/respostasService';
import type { Formulario } from '../../services/formularioService';
import BarChart from '@components/BarChart';

interface RespostasScreenProps {
  zoomLevel?: number;
}

export default function RespostasScreen({ zoomLevel = 1 }: RespostasScreenProps) {
  const scale = (base: number) => base * zoomLevel;
  const [formularios, setFormularios] = useState<Formulario[]>([]);
  const [loading, setLoading] = useState(true);
  const [formularioSelecionado, setFormularioSelecionado] = useState<Formulario | null>(null);
  const [estatisticas, setEstatisticas] = useState<any>(null);
  const [respostas, setRespostas] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  async function carregarFormularios() {
    setLoading(true);
    const lista = await listarFormularios();
    setFormularios(lista.filter(f => f.ativo));
    setLoading(false);
  }

  useEffect(() => {
    carregarFormularios();
  }, []);

  async function handleSelecionarFormulario(formulario: Formulario) {
    setFormularioSelecionado(formulario);
    setModalVisible(true);
    
    const stats = await getEstatisticasFormulario(formulario.id);
    setEstatisticas(stats);
    
    const respostasLista = await listarRespostasFormulario(formulario.id);
    setRespostas(respostasLista);
  }

  function getTipoRespostaLabel(tipo: string, valor: any): string {
    if (tipo === 'estrelas') return `${valor} ⭐`;
    if (tipo === 'emoji') {
      const emojis = ['😠', '😕', '😐', '🙂', '😊'];
      return emojis[valor - 1] || valor;
    }
    if (tipo === 'numerica') return `${valor} / 10`;
    return valor;
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Carregando formulários...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { fontSize: scale(18) }]}>📊 Respostas dos Formulários</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {formularios.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>Nenhum formulário ativo</Text>
          </View>
        ) : (
          formularios.map((formulario) => (
            <TouchableOpacity
              key={formulario.id}
              style={styles.card}
              onPress={() => handleSelecionarFormulario(formulario)}
              activeOpacity={0.7}
            >
              <Text style={[styles.cardTitulo, { fontSize: scale(16) }]}>
                {formulario.titulo}
              </Text>
              <Text style={[styles.cardDescricao, { fontSize: scale(12) }]} numberOfLines={2}>
                {formulario.descricao}
              </Text>
              <View style={styles.cardInfo}>
                <Text style={[styles.cardInfoText, { fontSize: scale(11) }]}>
                  📄 {formulario.perguntas?.length || 0} pergunta(s)
                </Text>
                <TouchableOpacity
                  style={styles.verButton}
                  onPress={() => handleSelecionarFormulario(formulario)}
                >
                  <Text style={styles.verButtonText}>Ver Respostas →</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Modal de Detalhes */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { width: scale(360), maxHeight: '80%', zIndex: 9999 }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { fontSize: scale(16) }]}>
                {formularioSelecionado?.titulo}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {/* Estatísticas */}
              <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                  <Text style={[styles.statNumero, { fontSize: scale(24) }]}>
                    {estatisticas?.totalRespostas || 0}
                  </Text>
                  <Text style={[styles.statLabel, { fontSize: scale(11) }]}>Respostas</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={[styles.statNumero, { fontSize: scale(24) }]}>
                    {estatisticas?.perguntas?.length || 0}
                  </Text>
                  <Text style={[styles.statLabel, { fontSize: scale(11) }]}>Perguntas</Text>
                </View>
              </View>

              {/* Perguntas e Respostas */}
              {estatisticas?.perguntas?.map((pergunta: any, index: number) => {
                // Prepara dados para o gráfico (apenas para múltipla escolha)
                const chartData = pergunta.alternativas?.map((alt: string) => {
                  const stats = pergunta.estatisticasAlternativa?.[alt] || { count: 0, percentage: 0 };
                  return {
                    label: alt.length > 15 ? alt.substring(0, 15) + '...' : alt,
                    value: stats.count,
                    percentage: stats.percentage
                  };
                }) || [];

                const isMultiplaEscolha = pergunta.tipo === 'alternativa' && pergunta.alternativas;

                return (
                  <View key={index} style={styles.perguntaCard}>
                    <Text style={[styles.perguntaTitulo, { fontSize: scale(14) }]}>
                      {index + 1}. {pergunta.pergunta}
                    </Text>
                    <Text style={[styles.perguntaTipo, { fontSize: scale(11) }]}>
                      {pergunta.tipo === 'dissertativa' ? '📝 Dissertativa' : 
                       isMultiplaEscolha ? '📊 Múltipla Escolha' : `⭐ ${pergunta.tipoAlternativa}`}
                    </Text>
                    <View style={styles.respostasResumo}>
                      <Text style={[styles.resumoLabel, { fontSize: scale(11) }]}>
                        {pergunta.totalRespostas} resposta(s)
                      </Text>
                      {pergunta.tipo === 'dissertativa' ? (
                        <Text style={[styles.resumoDissertativa, { fontSize: scale(11) }]}>
                          (Respostas textuais - ver detalhes)
                        </Text>
                      ) : isMultiplaEscolha ? (
                        <Text style={[styles.resumoAlternativa, { fontSize: scale(11) }]}>
                          Mais votada: {chartData.sort((a, b) => b.value - a.value)[0]?.label || 'N/A'}
                        </Text>
                      ) : (
                        <Text style={[styles.resumoAlternativa, { fontSize: scale(11) }]}>
                          Média: {pergunta.media?.toFixed(1) || 0}
                        </Text>
                      )}
                    </View>
                    
                    {/* Gráfico de barras para múltipla escolha */}
                    {isMultiplaEscolha && pergunta.totalRespostas > 0 && (
                      <View style={styles.chartContainer}>
                        <Text style={[styles.chartTitle, { fontSize: scale(12) }]}>
                          📊 Distribuição das Respostas
                        </Text>
                        <BarChart
                          data={chartData}
                          height={scale(180)}
                          showValues={true}
                          showPercentages={true}
                        />
                      </View>
                    )}
                  </View>
                );
              })}

              {/* Lista de Respostas (anônimas) */}
              {respostas.length > 0 && (
                <View style={styles.respostasSection}>
                  <Text style={[styles.respostasSectionTitle, { fontSize: scale(13) }]}>
                    🔒 Respostas (Anônimas)
                  </Text>
                  {respostas.map((resposta: any, index: number) => (
                    <View key={index} style={styles.respostaItem}>
                      <Text style={[styles.respostaId, { fontSize: scale(10) }]}>
                        #{index + 1} • {new Date(resposta.enviado_em?.toDate()).toLocaleDateString('pt-BR')}
                      </Text>
                      {resposta.respostas?.map((r: any, i: number) => {
                        const pergunta = formularioSelecionado?.perguntas?.find((p: any) => p.id === r.perguntaId);
                        return (
                          <View key={i} style={styles.respostaDetalhe}>
                            <Text style={[styles.respostaPergunta, { fontSize: scale(10) }]}>
                              {pergunta?.titulo?.substring(0, 50)}...
                            </Text>
                            <Text style={[styles.respostaValor, { fontSize: scale(11) }]}>
                              {getTipoRespostaLabel(pergunta?.tipoAlternativa || '', r.valor)}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontWeight: '700',
    color: '#1F2937',
  },
  scrollView: {
    flex: 1,
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardTitulo: {
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  cardDescricao: {
    color: '#6B7280',
    marginBottom: 10,
  },
  cardInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardInfoText: {
    color: '#9CA3AF',
  },
  verButton: {
    backgroundColor: '#667eea',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  verButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
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
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statNumero: {
    fontWeight: '700',
    color: '#667eea',
    marginBottom: 4,
  },
  statLabel: {
    color: '#9CA3AF',
    fontWeight: '500',
  },
  perguntaCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  perguntaTitulo: {
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  perguntaTipo: {
    color: '#9CA3AF',
    marginBottom: 8,
  },
  respostasResumo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resumoLabel: {
    color: '#6B7280',
    fontWeight: '500',
  },
  resumoDissertativa: {
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  resumoAlternativa: {
    color: '#667eea',
    fontWeight: '600',
  },
  chartContainer: {
    marginTop: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
  },
  chartTitle: {
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  respostasSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  respostasSectionTitle: {
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  respostaItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  respostaId: {
    color: '#9CA3AF',
    fontWeight: '600',
    marginBottom: 8,
  },
  respostaDetalhe: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  respostaPergunta: {
    color: '#6B7280',
    flex: 1,
  },
  respostaValor: {
    color: '#1F2937',
    fontWeight: '600',
  },
});
