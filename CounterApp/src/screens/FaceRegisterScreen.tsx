import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { faceEmbeddingService } from '../services/faceEmbeddingService';
import { registrarUsuarioComFace } from '../services/faceRegisterService';

interface FaceRegisterScreenProps {
  onRegisterSuccess: () => void;
  onBackToLogin: () => void;
  zoomLevel?: number;
}

export default function FaceRegisterScreen({
  onRegisterSuccess,
  onBackToLogin,
  zoomLevel = 1,
}: FaceRegisterScreenProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'front' | 'back'>('front');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [etapa, setEtapa] = useState<'formulario' | 'captura' | 'sucesso'>('formulario');
  const [progress, setProgress] = useState(0);
  const [capturaConcluida, setCapturaConcluida] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  const cameraRef = useRef<CameraView>(null);

  const scale = (base: number) => base * zoomLevel;

  useEffect(() => {
    setHasPermission(cameraPermission?.granted ?? false);
  }, [cameraPermission]);

  useEffect(() => {
    requestCameraPermission();
  }, []);

  function validarCampos(): string | null {
    if (!nome || !email) {
      return 'Preencha nome e email.';
    }

    if (nome.trim().length < 3) {
      return 'O nome deve ter pelo menos 3 caracteres.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Digite um email válido.';
    }

    return null;
  }

  async function handleIniciarCaptura() {
    const erroValidacao = validarCampos();
    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }

    setErro(null);
    setEtapa('captura');
  }

  async function handleCapturarRosto() {
    setErro(null);
    setLoading(true);
    setProgress(0);

    if (!cameraReady) {
      setErro('Câmera ainda não está pronta. Aguarde um momento.');
      setLoading(false);
      return;
    }

    try {
      // Simular progresso visual
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 85) {
            clearInterval(progressInterval);
            return 85;
          }
          return prev + 5;
        });
      }, 150);

      console.log('[FaceRegister] Iniciando captura do rosto para registro...');

      // Capturar rosto e gerar embedding
      const faceEmbedding = await faceEmbeddingService.captureAndGenerateEmbedding(cameraRef, 7);

      clearInterval(progressInterval);

      if (!faceEmbedding) {
        setErro('Não foi possível capturar o rosto. Verifique a câmera.');
        setLoading(false);
        return;
      }

      setProgress(100);
      console.log('[FaceRegister] Captura concluída. Qualidade:', faceEmbedding.quality);
      console.log('[FaceRegister] Embedding gerado:', faceEmbedding.vector.length, 'dimensões');

      // Verificar qualidade
      if (faceEmbedding.quality < 0.3) {
        setErro('Qualidade muito baixa. Capture em ambiente bem iluminado.');
        setLoading(false);
        return;
      }

      // Registrar usuário com face
      const result = await registrarUsuarioComFace(
        nome.trim(),
        email.trim(),
        faceEmbedding.vector
      );

      if (result.success && result.usuario) {
        setEtapa('sucesso');
        await new Promise(resolve => setTimeout(resolve, 1500));
        onRegisterSuccess();
      } else {
        setErro(result.error || 'Erro ao criar conta com reconhecimento facial.');
      }
    } catch (error: any) {
      console.error('[FaceRegister] Erro:', error);
      setErro('Erro ao processar registro facial. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.permissionContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.permissionText}>Solicitando permissão da câmera...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.permissionContainer}>
          <Text style={[styles.permissionIcon, { fontSize: scale(48) }]}>📷</Text>
          <Text style={[styles.permissionTitle, { fontSize: scale(20) }]}>Permissão Negada</Text>
          <Text style={[styles.permissionText, { fontSize: scale(14) }]}>
            O acesso à câmera é necessário para o cadastro facial.
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={onBackToLogin}>
            <Text style={styles.backButtonText}>← Voltar para login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (etapa === 'formulario') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <View style={styles.scrollContent}>
            <View style={[styles.card, { transform: [{ scale: zoomLevel }] }]}>
              {/* Header */}
              <View style={styles.header}>
                <View style={[styles.logoContainer, { width: scale(70), height: scale(70), borderRadius: scale(35) }]}>
                  <Text style={[styles.logoIcon, { fontSize: scale(32) }]}>🧠</Text>
                </View>
                <Text style={[styles.title, { fontSize: scale(24) }]}>Cadastro Facial</Text>
                <Text style={[styles.subtitle, { fontSize: scale(14) }]}>
                  Cadastre seu rosto para login rápido e seguro
                </Text>
              </View>

              {/* Info Box */}
              <View style={styles.infoBox}>
                <Text style={[styles.infoIcon, { fontSize: scale(20) }]}>ℹ️</Text>
                <View style={styles.infoContent}>
                  <Text style={[styles.infoTitle, { fontSize: scale(13) }]}>Como funciona?</Text>
                  <Text style={[styles.infoText, { fontSize: scale(12) }]}>
                    • Seu rosto será convertido em um vetor numérico{'\n'}
                    • <Text style={styles.bold}>Nenhuma imagem é armazenada</Text>{'\n'}
                    • Apenas o vetor de características é salvo{'\n'}
                    • Após o cadastro, você poderá fazer login apenas olhando para a câmera
                  </Text>
                </View>
              </View>

              {/* Mensagem de Erro */}
              {erro && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorIcon}>⚠️</Text>
                  <Text style={styles.errorText}>{erro}</Text>
                  <TouchableOpacity onPress={() => setErro(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={styles.errorClose}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Formulário */}
              <View style={styles.form}>
                {/* Nome */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { fontSize: scale(13) }]}>Nome completo</Text>
                  <View style={styles.inputWrapper}>
                    <Text style={[styles.inputIcon, { fontSize: scale(18) }]}>👤</Text>
                    <TextInput
                      style={[styles.input, { fontSize: scale(15), paddingVertical: scale(12) }]}
                      placeholder="Seu nome"
                      placeholderTextColor="#9CA3AF"
                      value={nome}
                      onChangeText={(text) => {
                        setNome(text);
                        if (erro) setErro(null);
                      }}
                      autoCapitalize="words"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                {/* Email */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { fontSize: scale(13) }]}>Email</Text>
                  <View style={styles.inputWrapper}>
                    <Text style={[styles.inputIcon, { fontSize: scale(18) }]}>📧</Text>
                    <TextInput
                      style={[styles.input, { fontSize: scale(15), paddingVertical: scale(12) }]}
                      placeholder="seu@email.com"
                      placeholderTextColor="#9CA3AF"
                      value={email}
                      onChangeText={(text) => {
                        setEmail(text);
                        if (erro) setErro(null);
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                {/* Botão Iniciar Captura */}
                <TouchableOpacity
                  style={styles.captureButton}
                  onPress={handleIniciarCaptura}
                  activeOpacity={0.8}
                >
                  <Text style={styles.captureButtonText}>Continuar para captura do rosto →</Text>
                </TouchableOpacity>

                {/* Voltar */}
                <TouchableOpacity style={styles.backButtonForm} onPress={onBackToLogin}>
                  <Text style={styles.backButtonTextForm}>← Voltar para login com email</Text>
                </TouchableOpacity>
              </View>

              {/* Aprovação */}
              <View style={styles.infoBoxAprovacao}>
                <Text style={[styles.infoIconAprovacao, { fontSize: scale(20) }]}>⏳</Text>
                <View style={styles.infoContentAprovacao}>
                  <Text style={[styles.infoTitleAprovacao, { fontSize: scale(13) }]}>Aprovação necessária</Text>
                  <Text style={[styles.infoTextAprovacao, { fontSize: scale(12) }]}>
                    Após o cadastro, sua conta será revisada pelo administrador antes de liberar o acesso.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  if (etapa === 'captura') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Câmera */}
          <View style={[styles.cameraContainer, { transform: [{ scale: zoomLevel }] }]}>
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing={facing}
              onCameraReady={() => setCameraReady(true)}
            >
              <View style={styles.overlay}>
                {/* Frame facial */}
                <View style={[styles.faceFrame, loading && styles.faceFrameActive]}>
                  <View style={[styles.corner, styles.topLeft]} />
                  <View style={[styles.corner, styles.topRight]} />
                  <View style={[styles.corner, styles.bottomLeft]} />
                  <View style={[styles.corner, styles.bottomRight]} />
                </View>

                {!loading && (
                  <View style={styles.instructionContainer}>
                    <Text style={styles.instructionText}>Posicione o rosto no centro</Text>
                    <TouchableOpacity style={styles.captureButtonCamera} onPress={handleCapturarRosto}>
                      <View style={styles.captureButtonInner}>
                        <Text style={styles.captureIcon}>📸</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                )}

                {loading && (
                  <View style={styles.capturingContainer}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.capturingText}>
                      {progress < 100 ? 'Capturando rosto...' : 'Processando cadastro...'}
                    </Text>
                    <View style={styles.progressBarContainer}>
                      <View style={[styles.progressBar, { width: `${progress}%` }]} />
                    </View>
                  </View>
                )}
              </View>

              {/* Botão trocar câmera */}
              <TouchableOpacity
                style={styles.flipButton}
                onPress={() => setFacing(facing === 'front' ? 'back' : 'front')}
              >
                <Text style={styles.flipButtonText}>🔄</Text>
              </TouchableOpacity>
            </CameraView>
          </View>

          {/* Mensagem de Erro */}
          {erro && (
            <View style={styles.errorContainer}>
              <View style={styles.errorBox}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>{erro}</Text>
              </View>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => {
                  setErro(null);
                  setProgress(0);
                }}
              >
                <Text style={styles.retryButtonText}>Tentar Novamente</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setEtapa('formulario');
                  setErro(null);
                  setProgress(0);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // Etapa de sucesso
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.successContainer}>
        <Text style={[styles.successIcon, { fontSize: scale(64) }]}>✅</Text>
        <Text style={[styles.successTitle, { fontSize: scale(24) }]}>Cadastro Realizado!</Text>
        <Text style={[styles.successText, { fontSize: scale(16) }]}>
          Seu rosto foi cadastrado com sucesso.{'\n'}
          Aguarde a aprovação do administrador.
        </Text>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#667eea',
  },
  container: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  permissionIcon: {
    marginBottom: 16,
  },
  permissionTitle: {
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  permissionText: {
    color: '#E5E7EB',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#E5E7EB',
    fontWeight: '500',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  logoIcon: {},
  title: {
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 6,
  },
  subtitle: {
    color: '#6B7280',
    textAlign: 'center',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 16,
  },
  infoIcon: {},
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 4,
  },
  infoText: {
    color: '#1E3A8A',
    lineHeight: 20,
  },
  bold: {
    fontWeight: '700',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  errorText: {
    flex: 1,
    color: '#DC2626',
    fontSize: 13,
    marginRight: 8,
  },
  errorClose: {
    fontWeight: '600',
    color: '#DC2626',
    padding: 4,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontWeight: '600',
    color: '#374151',
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 2,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#1F2937',
  },
  captureButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  captureButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  backButtonForm: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  backButtonTextForm: {
    color: '#6B7280',
    fontWeight: '500',
    fontSize: 14,
  },
  infoBoxAprovacao: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  infoIconAprovacao: {},
  infoContentAprovacao: {
    flex: 1,
  },
  infoTitleAprovacao: {
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
  },
  infoTextAprovacao: {
    color: '#78350F',
    lineHeight: 18,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceFrame: {
    width: 250,
    height: 300,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 120,
  },
  faceFrameActive: {
    borderColor: '#10B981',
    borderWidth: 3,
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#10B981',
    borderWidth: 4,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderTopLeftRadius: 20,
  },
  topRight: {
    top: -2,
    right: -2,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderTopRightRadius: 20,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomLeftRadius: 20,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomRightRadius: 20,
  },
  instructionContainer: {
    position: 'absolute',
    bottom: 100,
    alignItems: 'center',
  },
  instructionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  captureButtonCamera: {
    padding: 8,
  },
  captureButtonInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#10B981',
  },
  captureIcon: {
    fontSize: 32,
  },
  capturingContainer: {
    position: 'absolute',
    bottom: 100,
    alignItems: 'center',
  },
  capturingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  progressBarContainer: {
    width: 200,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  flipButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 25,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flipButtonText: {
    fontSize: 24,
  },
  errorContainer: {
    backgroundColor: '#fff',
    padding: 16,
  },
  retryButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButtonText: {
    color: '#6B7280',
    fontWeight: '500',
    fontSize: 14,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  successIcon: {
    marginBottom: 20,
  },
  successTitle: {
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  successText: {
    color: '#E5E7EB',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
});
