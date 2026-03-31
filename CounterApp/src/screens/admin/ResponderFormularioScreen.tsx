import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { auth } from '@config/firebase';
import { salvarRespostas, verificarSeJaRespondeu } from '@services/respostasService';
import type { Formulario, Pergunta } from '@services/formularioService';
import StarRating from '@components/StarRating';

interface ResponderFormularioScreenProps {
  zoomLevel?: number;
  formulario: Formulario;
  onVoltar: () => void;
  onResponder: () => void;
}

export default function ResponderFormularioScreen({
  zoomLevel = 1,
  formulario,
  onVoltar,
  onResponder,
}: ResponderFormularioScreenProps) {
  const scale = (base: number) => base * zoomLevel;
  const usuario = auth.currentUser;

  const [respostas, setRespostas] = useState<{ [key: string]: any }>({});
  const [loading, setLoading] = useState(false);
  const [jaRespondeu, setJaRespondeu] = useState(false);
  const [perguntaAtual, setPerguntaAtual] = useState(0);

  useEffect(() => {
    async function verificar() {
      if (usuario) {
        const respondeu = await verificarSeJaRespondeu(formulario.id, usuario.uid);
        setJaRespondeu(respondeu);
      }
    }
    verificar();
  }, []);

  function handleResponder(perguntaId: string, valor: any) {
    console.log('[ResponderFormulario] Resposta:', { perguntaId, valor });
    const novasRespostas = { ...respostas, [perguntaId]: valor };
    console.log('[ResponderFormulario] Todas respostas:', novasRespostas);
    setRespostas(novasRespostas);
  }

  async function handleEnviar() {
    console.log('[ResponderFormulario] handleEnviar chamado');
    console.log('[ResponderFormulario] Usuário:', usuario?.uid);
    console.log('[ResponderFormulario] Formulário ID:', formulario.id);
    console.log('[ResponderFormulario] Total perguntas:', formulario.perguntas.length);
    console.log('[ResponderFormulario] Respostas:', respostas);

    // Verifica se há usuário logado
    if (!usuario) {
      Alert.alert('Erro', 'Usuário não logado. Faça login novamente.');
      return;
    }

    // Verifica se todas as perguntas obrigatórias foram respondidas
    const perguntasObrigatorias = formulario.perguntas.filter(p => p.obrigatoria);
    const faltando = perguntasObrigatorias.some(p => {
      const resposta = respostas[p.id];
      return resposta === undefined || resposta === null || resposta === '';
    });

    console.log('[ResponderFormulario] Perguntas obrigatórias:', perguntasObrigatorias.length);
    console.log('[ResponderFormulario] Faltando:', faltando);

    if (faltando) {
      Alert.alert('Atenção', 'Responda todas as perguntas obrigatórias antes de enviar.');
      return;
    }

    setLoading(true);

    try {
      // Filtra apenas respostas válidas (não undefined)
      const respostasFormatadas = formulario.perguntas
        .filter((pergunta) => respostas[pergunta.id] !== undefined && respostas[pergunta.id] !== null && respostas[pergunta.id] !== '')
        .map((pergunta) => ({
          perguntaId: pergunta.id,
          valor: respostas[pergunta.id]
        }));

      console.log('[ResponderFormulario] Respostas formatadas:', respostasFormatadas);
      console.log('[ResponderFormulario] Enviando para salvarRespostas...');

      const result = await salvarRespostas(
        formulario.id,
        usuario.uid,
        respostasFormatadas
      );

      console.log('[ResponderFormulario] Resultado:', result);

      if (result.success) {
        // Sucesso - chama onResponder para voltar e recarregar
        onResponder();
      } else {
        Alert.alert('Erro', result.error || 'Erro ao salvar respostas.');
      }
    } catch (error: any) {
      console.error('[ResponderFormulario] Erro:', error.message);
      Alert.alert('Erro', 'Não foi possível enviar suas respostas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  function handleProxima() {
    if (perguntaAtual < formulario.perguntas.length - 1) {
      // Verifica se a pergunta atual foi respondida (se for obrigatória)
      const pergunta = formulario.perguntas[perguntaAtual];
      if (pergunta.obrigatoria && (respostas[pergunta.id] === undefined || respostas[pergunta.id] === null || respostas[pergunta.id] === '')) {
        Alert.alert('Atenção', 'Responda esta pergunta obrigatória antes de continuar.');
        return;
      }
      setPerguntaAtual(perguntaAtual + 1);
    }
  }

  function handleAnterior() {
    if (perguntaAtual > 0) {
      setPerguntaAtual(perguntaAtual - 1);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Enviando respostas...</Text>
      </View>
    );
  }

  if (jaRespondeu) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onVoltar}>
            <Text style={styles.voltarIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Formulário</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.jaRespondeuContainer}>
          <Text style={styles.jaRespondeuIcon}>✅</Text>
          <Text style={styles.jaRespondeuTitulo}>Você já respondeu este formulário</Text>
          <Text style={styles.jaRespondeuTexto}>
            Cada usuário pode responder apenas uma vez. Obrigado pela sua participação!
          </Text>
          <TouchableOpacity style={styles.voltarButton} onPress={onVoltar}>
            <Text style={styles.voltarButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const pergunta = formulario.perguntas[perguntaAtual];
  const totalPerguntas = formulario.perguntas.length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onVoltar}>
          <Text style={styles.voltarIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{formulario.titulo}</Text>
        <Text style={styles.perguntaIndicador}>
          {perguntaAtual + 1}/{totalPerguntas}
        </Text>
      </View>

      {/* Barra de Progresso */}
      <View style={styles.progressBarContainer}>
        <View 
          style={[
            styles.progressBar, 
            { width: `${((perguntaAtual + 1) / totalPerguntas) * 100}%` }
          ]} 
        />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={true}>
        {/* Conteúdo da Pergunta */}
        <View style={styles.perguntaContainer}>
          <Text style={styles.perguntaTitulo}>
            {pergunta.titulo}
            {pergunta.obrigatoria && <Text style={styles.obrigatorioMarker}> *</Text>}
          </Text>
          
          {pergunta.descricao ? (
            <Text style={styles.perguntaDescricao}>{pergunta.descricao}</Text>
          ) : null}

          {/* Campo de Resposta */}
          <View style={styles.respostaContainer}>
            {pergunta.tipo === 'dissertativa' && (
              <TextInput
                style={[styles.textInput, { fontSize: scale(15) }]}
                placeholder="Digite sua resposta..."
                placeholderTextColor="#9CA3AF"
                value={respostas[pergunta.id] || ''}
                onChangeText={(valor) => handleResponder(pergunta.id, valor)}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            )}

            {pergunta.tipo === 'alternativa' && pergunta.tipoAlternativa === 'estrelas' && (
              <StarRating
                rating={respostas[pergunta.id] || 0}
                onRatingChange={(valor) => handleResponder(pergunta.id, valor)}
                size={scale(35)}
              />
            )}

            {pergunta.tipo === 'alternativa' && pergunta.tipoAlternativa === 'emoji' && (
              <View style={styles.emojiContainer}>
                {[
                  { valor: 1, emoji: '😠', label: 'Bravo' },
                  { valor: 2, emoji: '😕', label: 'Chateado' },
                  { valor: 3, emoji: '😐', label: 'Neutro' },
                  { valor: 4, emoji: '🙂', label: 'Bom' },
                  { valor: 5, emoji: '😊', label: 'Muito Bom' },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.valor}
                    style={[
                      styles.emojiButton,
                      respostas[pergunta.id] === item.valor && styles.emojiButtonAtivo
                    ]}
                    onPress={() => handleResponder(pergunta.id, item.valor)}
                  >
                    <Text style={styles.emojiText}>{item.emoji}</Text>
                    <Text style={[
                      styles.emojiLabel,
                      respostas[pergunta.id] === item.valor && styles.emojiLabelAtivo
                    ]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {pergunta.tipo === 'alternativa' && pergunta.tipoAlternativa === 'numerica' && (
              <View style={styles.numericaContainer}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((valor) => (
                  <TouchableOpacity
                    key={valor}
                    style={[
                      styles.numericaButton,
                      respostas[pergunta.id] === valor && styles.numericaButtonAtiva
                    ]}
                    onPress={() => handleResponder(pergunta.id, valor)}
                  >
                    <Text style={[
                      styles.numericaText,
                      respostas[pergunta.id] === valor && styles.numericaTextAtivo
                    ]}>
                      {valor}
                    </Text>
                  </TouchableOpacity>
                ))}
                <Text style={styles.numericaValor}>
                  {respostas[pergunta.id] ? `${respostas[pergunta.id]} / 10` : 'Selecione'}
                </Text>
              </View>
            )}

            {pergunta.tipo === 'alternativa' && pergunta.tipoAlternativa === 'texto' && (
              <View style={styles.opcoesContainer}>
                {(pergunta.opcoes || []).map((opcao, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.opcaoButton,
                      respostas[pergunta.id] === opcao && styles.opcaoButtonAtiva
                    ]}
                    onPress={() => handleResponder(pergunta.id, opcao)}
                  >
                    <Text style={[
                      styles.opcaoText,
                      respostas[pergunta.id] === opcao && styles.opcaoTextAtivo
                    ]}>
                      {opcao}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Botões de Navegação */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.navButton, perguntaAtual === 0 && styles.navButtonDisabled]}
          onPress={handleAnterior}
          disabled={perguntaAtual === 0}
        >
          <Text style={[styles.navButtonText, perguntaAtual === 0 && styles.navButtonTextDisabled]}>
            ← Anterior
          </Text>
        </TouchableOpacity>

        {perguntaAtual < totalPerguntas - 1 ? (
          <TouchableOpacity style={styles.navButton} onPress={handleProxima}>
            <Text style={styles.navButtonText}>Próxima →</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.enviarButton} onPress={handleEnviar}>
            <Text style={styles.enviarButtonText}>📤 Enviar Respostas</Text>
          </TouchableOpacity>
        )}
      </View>
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
    fontSize: 24,
    color: '#667eea',
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
  },
  perguntaIndicador: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
    width: 40,
    textAlign: 'right',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#E5E7EB',
    width: '100%',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#667eea',
  },
  scrollView: {
    flex: 1,
  },
  perguntaContainer: {
    padding: 20,
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  perguntaTitulo: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  obrigatorioMarker: {
    color: '#EF4444',
    fontWeight: '700',
  },
  perguntaDescricao: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  respostaContainer: {
    marginTop: 8,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#1F2937',
    minHeight: 100,
  },
  // Emoji
  emojiContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  emojiButton: {
    flex: 1,
    minWidth: 60,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  emojiButtonAtivo: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  emojiText: {
    fontSize: 32,
    marginBottom: 4,
  },
  emojiLabel: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
  emojiLabelAtivo: {
    color: '#059669',
    fontWeight: '600',
  },
  // Numérica
  numericaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  numericaButton: {
    flex: 1,
    minWidth: 40,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  numericaButtonAtiva: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  numericaText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
  },
  numericaTextAtivo: {
    color: '#fff',
  },
  numericaValor: {
    fontSize: 14,
    color: '#6B7280',
    width: '100%',
    textAlign: 'center',
    marginTop: 8,
  },
  // Opções de texto
  opcoesContainer: {
    gap: 10,
  },
  opcaoButton: {
    padding: 14,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  opcaoButtonAtiva: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  opcaoText: {
    fontSize: 15,
    color: '#374151',
  },
  opcaoTextAtivo: {
    color: '#fff',
    fontWeight: '600',
  },
  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  navButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#667eea',
  },
  navButtonTextDisabled: {
    color: '#9CA3AF',
  },
  enviarButton: {
    flex: 1,
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  enviarButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
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
    fontSize: 16,
  },
  jaRespondeuContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  jaRespondeuIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  jaRespondeuTitulo: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  jaRespondeuTexto: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  voltarButton: {
    backgroundColor: '#667eea',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 40,
  },
  voltarButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
