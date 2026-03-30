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
import type { Pergunta } from '../../services/formularioService';

interface PerguntaBuilderScreenProps {
  zoomLevel?: number;
  perguntaIndex?: number;
  onSalvar: (pergunta: Pergunta) => void;
  onCancelar: () => void;
}

type TipoAlternativa = 'estrelas' | 'emoji' | 'numerica' | 'texto';

export default function PerguntaBuilderScreen({
  zoomLevel = 1,
  perguntaIndex = 0,
  onSalvar,
  onCancelar,
}: PerguntaBuilderScreenProps) {
  const scale = (base: number) => base * zoomLevel;

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tipo, setTipo] = useState<'dissertativa' | 'alternativa'>('dissertativa');
  const [obrigatoria, setObrigatoria] = useState(true);
  const [tipoAlternativa, setTipoAlternativa] = useState<TipoAlternativa>('estrelas');
  
  // Opções customizadas para tipo 'texto'
  const [opcoesTexto, setOpcoesTexto] = useState<string[]>(['', '']);

  function handleSalvar() {
    if (!titulo.trim()) {
      Alert.alert('Atenção', 'Digite um título para a pergunta.');
      return;
    }

    // Garante que não há campos undefined
    const novaPergunta: Pergunta = {
      id: Date.now().toString(),
      tipo,
      titulo: titulo.trim(),
      descricao: descricao.trim() || undefined,
      obrigatoria,
      tipoAlternativa: tipo === 'alternativa' ? tipoAlternativa : undefined,
      opcoes: tipo === 'alternativa' && tipoAlternativa === 'texto' ? opcoesTexto.filter(o => o.trim()) : undefined,
    };

    // Remove campos undefined
    const perguntaLimpa: any = {};
    Object.keys(novaPergunta).forEach(key => {
      const value = (novaPergunta as any)[key];
      if (value !== undefined) {
        perguntaLimpa[key] = value;
      }
    });

    console.log('[PerguntaBuilder] Salvando pergunta:', perguntaLimpa);

    onSalvar(perguntaLimpa as Pergunta);
  }

  function handleAddOpcao() {
    setOpcoesTexto([...opcoesTexto, '']);
  }

  function handleRemoveOpcao(index: number) {
    if (opcoesTexto.length <= 2) {
      Alert.alert('Atenção', 'Mínimo de 2 opções necessárias.');
      return;
    }
    const novas = opcoesTexto.filter((_, i) => i !== index);
    setOpcoesTexto(novas);
  }

  function handleUpdateOpcao(index: number, valor: string) {
    const novas = [...opcoesTexto];
    novas[index] = valor;
    setOpcoesTexto(novas);
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancelar}>
          <Text style={[styles.voltarIcon, { fontSize: scale(24) }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontSize: scale(18) }]}>
          {perguntaIndex > 0 ? `Editar Pergunta ${perguntaIndex}` : 'Nova Pergunta'}
        </Text>
        <TouchableOpacity onPress={handleSalvar}>
          <Text style={[styles.salvarText, { fontSize: scale(14) }]}>💾 Salvar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={true}>
        {/* Título */}
        <View style={styles.section}>
          <Text style={[styles.label, { fontSize: scale(14) }]}>Título da Pergunta *</Text>
          <TextInput
            style={[styles.input, { fontSize: scale(15), paddingVertical: scale(12) }]}
            placeholder="Ex: Como você avalia o atendimento?"
            placeholderTextColor="#9CA3AF"
            value={titulo}
            onChangeText={setTitulo}
          />
        </View>

        {/* Descrição */}
        <View style={styles.section}>
          <Text style={[styles.label, { fontSize: scale(14) }]}>Descrição (opcional)</Text>
          <TextInput
            style={[styles.input, styles.textarea, { fontSize: scale(15), paddingVertical: scale(12) }]}
            placeholder="Instruções adicionais..."
            placeholderTextColor="#9CA3AF"
            value={descricao}
            onChangeText={setDescricao}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Tipo de Pergunta */}
        <View style={styles.section}>
          <Text style={[styles.label, { fontSize: scale(14) }]}>Tipo de Pergunta</Text>
          <View style={styles.tipoContainer}>
            <TouchableOpacity
              style={[styles.tipoButton, tipo === 'dissertativa' && styles.tipoButtonActive]}
              onPress={() => setTipo('dissertativa')}
            >
              <Text style={[styles.tipoButtonText, tipo === 'dissertativa' && styles.tipoButtonTextActive]}>
                📝 Dissertativa
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tipoButton, tipo === 'alternativa' && styles.tipoButtonActive]}
              onPress={() => setTipo('alternativa')}
            >
              <Text style={[styles.tipoButtonText, tipo === 'alternativa' && styles.tipoButtonTextActive]}>
                ⭐ Alternativa
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tipo de Resposta (apenas para alternativa) */}
        {tipo === 'alternativa' && (
          <>
            <View style={styles.section}>
              <Text style={[styles.label, { fontSize: scale(14) }]}>Tipo de Resposta</Text>
              <View style={styles.respostasGrid}>
                <TouchableOpacity
                  style={[styles.respostaButton, tipoAlternativa === 'estrelas' && styles.respostaButtonActive]}
                  onPress={() => setTipoAlternativa('estrelas')}
                >
                  <Text style={[styles.respostaIcon, { fontSize: scale(24) }]}>⭐</Text>
                  <Text style={[styles.respostaLabel, { fontSize: scale(11) }]}>Estrelas</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.respostaButton, tipoAlternativa === 'emoji' && styles.respostaButtonActive]}
                  onPress={() => setTipoAlternativa('emoji')}
                >
                  <Text style={[styles.respostaIcon, { fontSize: scale(24) }]}>😊</Text>
                  <Text style={[styles.respostaLabel, { fontSize: scale(11) }]}>Emoji</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.respostaButton, tipoAlternativa === 'numerica' && styles.respostaButtonActive]}
                  onPress={() => setTipoAlternativa('numerica')}
                >
                  <Text style={[styles.respostaIcon, { fontSize: scale(24) }]}>🔢</Text>
                  <Text style={[styles.respostaLabel, { fontSize: scale(11) }]}>Nota</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.respostaButton, tipoAlternativa === 'texto' && styles.respostaButtonActive]}
                  onPress={() => setTipoAlternativa('texto')}
                >
                  <Text style={[styles.respostaIcon, { fontSize: scale(24) }]}>📝</Text>
                  <Text style={[styles.respostaLabel, { fontSize: scale(11) }]}>Texto</Text>
                </TouchableOpacity>
              </View>
              <Text style={[styles.helpText, { fontSize: scale(11) }]}>
                {tipoAlternativa === 'estrelas' && '⭐ 0 a 5 estrelas (0, 0.5, 1, 1.5... 5)'}
                {tipoAlternativa === 'emoji' && '😊 Bravo 😠, Chateado 😕, Neutro 😐, Bom 🙂, Muito Bom 😊'}
                {tipoAlternativa === 'numerica' && '🔢 Escala numérica de 1 a 10'}
                {tipoAlternativa === 'texto' && '📝 Opções de texto personalizáveis'}
              </Text>
            </View>

            {/* Opções Customizadas para Texto */}
            {tipoAlternativa === 'texto' && (
              <View style={styles.section}>
                <View style={styles.opcoesHeader}>
                  <Text style={[styles.label, { fontSize: scale(14) }]}>Opções de Resposta</Text>
                  <TouchableOpacity style={styles.addOpcaoButton} onPress={handleAddOpcao}>
                    <Text style={[styles.addOpcaoText, { fontSize: scale(13) }]}>+ Adicionar</Text>
                  </TouchableOpacity>
                </View>
                {opcoesTexto.map((opcao, index) => (
                  <View key={index} style={styles.opcaoRow}>
                    <TextInput
                      style={[styles.opcaoInput, { fontSize: scale(14), paddingVertical: scale(10) }]}
                      placeholder={`Opção ${index + 1}`}
                      placeholderTextColor="#9CA3AF"
                      value={opcao}
                      onChangeText={(valor) => handleUpdateOpcao(index, valor)}
                    />
                    <TouchableOpacity
                      style={styles.removeOpcaoButton}
                      onPress={() => handleRemoveOpcao(index)}
                    >
                      <Text style={[styles.removeOpcaoIcon, { fontSize: scale(18) }]}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                <Text style={[styles.opcoesHelp, { fontSize: scale(10) }]}>
                  Mínimo de 2 opções. O usuário selecionará uma das opções.
                </Text>
              </View>
            )}
          </>
        )}

        {/* Obrigatória */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.obrigatoriaContainer, obrigatoria && styles.obrigatoriaContainerActive]}
            onPress={() => setObrigatoria(!obrigatoria)}
          >
            <Text style={[styles.obrigatoriaCheckbox, { fontSize: scale(18) }]}>
              {obrigatoria ? '✅' : '⬜'}
            </Text>
            <Text style={[styles.obrigatoriaText, { fontSize: scale(14) }]}>
              Pergunta obrigatória
            </Text>
          </TouchableOpacity>
        </View>

        {/* Espaço extra no final */}
        <View style={{ height: scale(40) }} />
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
    fontWeight: '700',
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
  section: {
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
  tipoContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  tipoButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 14,
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
    fontWeight: '600',
  },
  tipoButtonTextActive: {
    color: '#fff',
  },
  respostasGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
  },
  respostaButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  respostaButtonActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  respostaIcon: {
    marginBottom: 4,
  },
  respostaLabel: {
    color: '#6B7280',
    fontWeight: '500',
  },
  ajudaTexto: {
    color: '#9CA3AF',
  },
  helpText: {
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  opcoesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addOpcaoButton: {
    backgroundColor: '#667eea',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  addOpcaoText: {
    color: '#fff',
    fontWeight: '600',
  },
  opcaoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  opcaoInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    color: '#1F2937',
  },
  removeOpcaoButton: {
    padding: 8,
  },
  removeOpcaoIcon: {
  },
  opcoesHelp: {
    color: '#9CA3AF',
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
  obrigatoriaCheckbox: {
    marginRight: 10,
  },
  obrigatoriaText: {
    color: '#6B7280',
  },
});
