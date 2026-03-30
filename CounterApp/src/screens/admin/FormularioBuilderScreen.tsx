import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import type { Formulario, Pergunta } from '../../services/formularioService';
import { criarFormulario, atualizarFormulario } from '../../services/formularioService';
import PerguntaBuilderScreen from './PerguntaBuilderScreen';

interface FormularioBuilderScreenProps {
  zoomLevel?: number;
  formulario?: Formulario | null;
  onVoltar: () => void;
  onSalvar: () => void;
}

type TipoAlternativa = 'estrelas' | 'emoji' | 'numerica' | 'texto';

export default function FormularioBuilderScreen({
  zoomLevel = 1,
  formulario,
  onVoltar,
  onSalvar,
}: FormularioBuilderScreenProps) {
  const scale = (base: number) => base * zoomLevel;

  const [titulo, setTitulo] = useState(formulario?.titulo || '');
  const [descricao, setDescricao] = useState(formulario?.descricao || '');
  const [perguntas, setPerguntas] = useState<Pergunta[]>(formulario?.perguntas || []);
  const [mostrarPerguntaBuilder, setMostrarPerguntaBuilder] = useState(false);
  const [perguntaIndex, setPerguntaIndex] = useState<number>(-1);

  async function handleSalvarFormulario() {
    if (!titulo.trim()) {
      Alert.alert('Atenção', 'Digite um título para o formulário.');
      return;
    }

    console.log('[FormularioBuilder] handleSalvarFormulario chamado');
    console.log('[FormularioBuilder] titulo:', titulo);
    console.log('[FormularioBuilder] descricao:', descricao);
    console.log('[FormularioBuilder] perguntas:', perguntas);
    console.log('[FormularioBuilder] perguntas.length:', perguntas.length);

    try {
      if (formulario) {
        console.log('[FormularioBuilder] Atualizando formulário:', formulario.id);
        // Garante que todos os campos estão definidos
        await atualizarFormulario(formulario.id, { 
          titulo: titulo.trim(), 
          descricao: descricao.trim(), 
          perguntas: perguntas 
        });
      } else {
        console.log('[FormularioBuilder] Criando novo formulário');
        const result = await criarFormulario(titulo.trim(), descricao.trim(), perguntas);
        if (!result.success) {
          Alert.alert('Erro', result.error || 'Não foi possível criar o formulário.');
          return;
        }
        console.log('[FormularioBuilder] Formulário criado com ID:', result.id);
      }
      onSalvar();
    } catch (error) {
      console.error('[FormularioBuilder] Erro:', error);
      Alert.alert('Erro', 'Não foi possível salvar o formulário.');
    }
  }

  function handleNovaPergunta() {
    setPerguntaIndex(-1);
    setMostrarPerguntaBuilder(true);
  }

  function handleEditarPergunta(index: number) {
    setPerguntaIndex(index);
    setMostrarPerguntaBuilder(true);
  }

  function handleVoltarPergunta() {
    setMostrarPerguntaBuilder(false);
    setPerguntaIndex(-1);
  }

  function handleSalvarPergunta(pergunta: Pergunta) {
    console.log('[FormularioBuilder] Salvando pergunta:', pergunta);
    console.log('[FormularioBuilder] perguntaIndex:', perguntaIndex);
    console.log('[FormularioBuilder] perguntas antes:', perguntas.length);
    
    if (perguntaIndex >= 0 && perguntaIndex < perguntas.length) {
      // Editar pergunta existente
      const novas = [...perguntas];
      novas[perguntaIndex] = pergunta;
      setPerguntas(novas);
      console.log('[FormularioBuilder] Pergunta editada, total:', novas.length);
    } else {
      // Adicionar nova pergunta
      const novas = [...perguntas, pergunta];
      setPerguntas(novas);
      console.log('[FormularioBuilder] Pergunta adicionada, total:', novas.length);
    }
    handleVoltarPergunta();
  }

  function handleRemoverPergunta(perguntaId: string) {
    Alert.alert(
      'Remover Pergunta',
      'Tem certeza que deseja remover esta pergunta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            setPerguntas(perguntas.filter(p => p.id !== perguntaId));
          }
        }
      ]
    );
  }

  function getTipoAlternativaLabel(tipo: TipoAlternativa) {
    switch (tipo) {
      case 'estrelas': return '⭐ Estrelas (0-5)';
      case 'emoji': return '😊 Emoji (Bravo a Muito Bom)';
      case 'numerica': return '🔢 Numérica (1-10)';
      case 'texto': return '📝 Texto Aberto';
    }
  }

  // Se estiver mostrando a tela de pergunta, renderiza ela
  if (mostrarPerguntaBuilder) {
    return (
      <PerguntaBuilderScreen
        zoomLevel={zoomLevel}
        perguntaIndex={perguntaIndex >= 0 ? perguntaIndex + 1 : perguntas.length + 1}
        onSalvar={handleSalvarPergunta}
        onCancelar={handleVoltarPergunta}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onVoltar}>
          <Text style={[styles.voltarIcon, { fontSize: scale(24) }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontSize: scale(18) }]}>
          {formulario ? 'Editar Formulário' : 'Novo Formulário'}
        </Text>
        <TouchableOpacity onPress={handleSalvarFormulario}>
          <Text style={[styles.salvarText, { fontSize: scale(14) }]}>💾 Salvar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={true}>
        {/* Título e Descrição */}
        <View style={styles.formSection}>
          <Text style={[styles.label, { fontSize: scale(14) }]}>Título do Formulário *</Text>
          <TextInput
            style={[styles.input, { fontSize: scale(15), paddingVertical: scale(12) }]}
            placeholder="Ex: Avaliação Mensal"
            placeholderTextColor="#9CA3AF"
            value={titulo}
            onChangeText={setTitulo}
          />
        </View>

        <View style={styles.formSection}>
          <Text style={[styles.label, { fontSize: scale(14) }]}>Descrição</Text>
          <TextInput
            style={[styles.input, styles.textarea, { fontSize: scale(15), paddingVertical: scale(12) }]}
            placeholder="Descreva o objetivo deste formulário..."
            placeholderTextColor="#9CA3AF"
            value={descricao}
            onChangeText={setDescricao}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Lista de Perguntas */}
        <View style={styles.perguntasSection}>
          <View style={styles.perguntasHeader}>
            <Text style={[styles.sectionTitle, { fontSize: scale(16) }]}>📝 Perguntas ({perguntas.length})</Text>
            <TouchableOpacity
              style={styles.adicionarPerguntaButton}
              onPress={handleNovaPergunta}
            >
              <Text style={[styles.adicionarPerguntaText, { fontSize: scale(13) }]}>+ Adicionar</Text>
            </TouchableOpacity>
          </View>

          {perguntas.length === 0 ? (
            <View style={styles.emptyPerguntas}>
              <Text style={[styles.emptyPerguntasText, { fontSize: scale(13) }]}>Nenhuma pergunta adicionada</Text>
            </View>
          ) : (
            perguntas.map((pergunta, index) => (
              <TouchableOpacity
                key={pergunta.id}
                style={[styles.perguntaCard, { marginBottom: scale(12) }]}
                onPress={() => handleEditarPergunta(index)}
                activeOpacity={0.7}
              >
                <View style={styles.perguntaHeader}>
                  <View style={styles.perguntaNumero}>
                    <Text style={[styles.perguntaNumeroText, { fontSize: scale(12) }]}>{index + 1}</Text>
                  </View>
                  <View style={styles.perguntaInfo}>
                    <Text style={[styles.perguntaTitulo, { fontSize: scale(14) }]}>
                      {pergunta.titulo}
                      {pergunta.obrigatoria && <Text style={styles.obrigatoriaMarker}> *</Text>}
                    </Text>
                    <Text style={[styles.perguntaTipo, { fontSize: scale(11) }]}>
                      {pergunta.tipo === 'dissertativa' ? '📝 Dissertativa' : getTipoAlternativaLabel(pergunta.tipoAlternativa!)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removerPerguntaButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleRemoverPergunta(pergunta.id);
                    }}
                  >
                    <Text style={[styles.removerPerguntaIcon, { fontSize: scale(18) }]}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
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
  voltarIcon: {
    color: '#667eea',
  },
  headerTitle: {
    fontWeight: '600',
    color: '#1F2937',
  },
  salvarText: {
    color: '#10B981',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  formSection: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 1,
  },
  label: {
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 14,
    color: '#1F2937',
  },
  textarea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  perguntasSection: {
    padding: 16,
  },
  perguntasHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: '700',
    color: '#1F2937',
  },
  adicionarPerguntaButton: {
    backgroundColor: '#667eea',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  adicionarPerguntaText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyPerguntas: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  emptyPerguntasText: {
    color: '#9CA3AF',
  },
  perguntaCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  perguntaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  perguntaNumero: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#667eea',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  perguntaNumeroText: {
    color: '#fff',
    fontWeight: '700',
  },
  perguntaInfo: {
    flex: 1,
  },
  perguntaTitulo: {
    fontWeight: '600',
    color: '#1F2937',
  },
  obrigatoriaMarker: {
    color: '#EF4444',
    fontWeight: '700',
  },
  perguntaTipo: {
    color: '#9CA3AF',
    marginTop: 4,
  },
  removerPerguntaButton: {
    padding: 8,
  },
  removerPerguntaIcon: {
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScrollView: {
    flex: 1,
    width: '100%',
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalTitle: {
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  tipoContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tipoButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tipoButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  tipoButtonText: {
    color: '#6B7280',
    fontWeight: '500',
  },
  tipoButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  alternativasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  alternativasGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
  },
  alternativaButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minWidth: 70,
  },
  alternativaButtonActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  alternativaButtonText: {
    color: '#6B7280',
    fontSize: 20,
    marginBottom: 4,
  },
  alternativaButtonTextActive: {
    color: '#fff',
  },
  alternativaButtonLabel: {
    color: '#6B7280',
    fontWeight: '500',
  },
  alternativaHelp: {
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 4,
  },
  obrigatoriaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  obrigatoriaContainerActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
    borderWidth: 1,
  },
  obrigatoriaCheckboxMarker: {
    fontSize: 18,
    marginRight: 8,
  },
  obrigatoriaCheckboxMarkerActive: {
  },
  obrigatoriaText: {
    color: '#6B7280',
    fontSize: 14,
  },
  obrigatoriaTextActive: {
    color: '#059669',
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#F3F4F6',
  },
  modalButtonConfirm: {
    backgroundColor: '#667eea',
  },
  modalButtonText: {
    fontWeight: '600',
  },
});
