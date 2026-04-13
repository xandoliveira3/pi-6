import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { faceEmbeddingService } from '../services/faceEmbeddingService';
import {
  atualizarFaceEmbedding,
  removerFaceEmbedding,
  verificarUsuarioTemFace,
} from '../services/faceUserService';
import { getAuth } from 'firebase/auth';

interface FaceDataScreenProps {
  onBack: () => void;
  zoomLevel?: number;
}

export default function FaceDataScreen({ onBack, zoomLevel = 1 }: FaceDataScreenProps) {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'front' | 'back'>('front');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [etapa, setEtapa] = useState<'info' | 'captura' | 'sucesso'>('info');
  const [progress, setProgress] = useState(0);
  const [temFace, setTemFace] = useState<boolean | null>(null);
  const [checkingFace, setCheckingFace] = useState(true);
  const [cameraReady, setCameraReady] = useState(false);

  const cameraRef = useRef<CameraView>(null);
  const auth = getAuth();

  const scale = (base: number) => base * zoomLevel;

  useEffect(() => {
    checkUserFaceStatus();
  }, []);

  useEffect(() => {
    setTemFace(cameraPermission?.granted ?? null);
  }, [cameraPermission]);

  async function checkUserFaceStatus() {
    setCheckingFace(true);
    const user = auth.currentUser;
    
    if (!user) {
      setTemFace(false);
      setCheckingFace(false);
      return;
    }

    try {
      const hasFace = await verificarUsuarioTemFace(user.uid);
      setTemFace(hasFace);
    } catch (error) {
      console.error('[FaceData] Erro ao verificar status facial:', error);
      setTemFace(false);
    } finally {
      setCheckingFace(false);
    }
  }

  async function handleIniciarCadastro() {
    setErro(null);
    setSucesso(null);
    setEtapa('captura');
  }

  async function handleCapturarRosto() {
    setErro(null);
    setSucesso(null);

    if (!cameraReady) {
      setErro('Câmera ainda não está pronta. Aguarde um momento.');
      return;
    }

    setLoading(true);
    setProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 85) {
            clearInterval(progressInterval);
            return 85;
          }
          return prev + 5;
        });
      }, 150);

      const faceEmbedding = await faceEmbeddingService.captureAndGenerateEmbedding(cameraRef, 7);
      clearInterval(progressInterval);

      if (!faceEmbedding) {
        setErro('Não foi possível capturar o rosto. Verifique a câmera.');
        setLoading(false);
        return;
      }

      setProgress(100);

      if (faceEmbedding.quality < 0.3) {
        setErro('Qualidade muito baixa. Capture em ambiente bem iluminado.');
        setLoading(false);
        return;
      }

      const user = auth.currentUser;
      if (!user) {
        setErro('Usuário não autenticado.');
        setLoading(false);
        return;
      }

      const result = await atualizarFaceEmbedding(user.uid, faceEmbedding.vector);

      if (result.success) {
        setEtapa('sucesso');
        setTemFace(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setEtapa('info');
        setSucesso('Rosto cadastrado com sucesso!');
      } else {
        setErro(result.error || 'Erro ao cadastrar rosto.');
      }
    } catch (error: any) {
      console.error('[FaceData] Erro ao capturar rosto:', error);
      setErro('Erro ao processar cadastro facial. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoverFace() {
    Alert.alert(
      'Remover Dados Faciais',
      'Tem certeza que deseja remover seus dados de reconhecimento facial? Você precisará fazer login com email ou recadastrar seu rosto.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            setErro(null);
            setSucesso(null);

            try {
              const user = auth.currentUser;
              if (!user) {
                setErro('Usuário não autenticado.');
                setLoading(false);
                return;
              }

              const result = await removerFaceEmbedding(user.uid);

              if (result.success) {
                setTemFace(false);
                setSucesso('Dados faciais removidos com sucesso!');
                setErro(null);
              } else {
                setErro(result.error || 'Erro ao remover dados faciais.');
              }
            } catch (error: any) {
              setErro('Erro ao remover dados faciais.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  }

  async function handleAtualizarRosto() {
    Alert.alert(
      'Atualizar Rosto',
      'Deseja recadastrar seu rosto? Isso substituirá os dados atuais.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Continuar',
          onPress: () => {
            setErro(null);
            setSucesso(null);
            handleCapturarRosto();
          },
        },
      ]
    );
  }

  if (checkingFace) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Verificando dados faciais...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (etapa === 'captura') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={[styles.cameraContainer, { transform: [{ scale: zoomLevel }] }]}>
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing={facing}
              onCameraReady={() => setCameraReady(true)}
            >
              <View style={styles.overlay}>
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
                      {progress < 100 ? 'Capturando rosto...' : 'Processando...'}
                    </Text>
                    <View style={styles.progressBarContainer}>
                      <View style={[styles.progressBar, { width: `${progress}%` }]} />
                    </View>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={styles.flipButton}
                onPress={() => setFacing(facing === 'front' ? 'back' : 'front')}
              >
                <Text style={styles.flipButtonText}>🔄</Text>
              </TouchableOpacity>
            </CameraView>
          </View>

          {erro && (
            <View style={styles.errorContainer}>
              <View style={styles.errorBoxInline}>
                <Text style={styles.errorIconInline}>⚠️</Text>
                <Text style={styles.errorTextInline}>{erro}</Text>
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
                  setEtapa('info');
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

  if (etapa === 'sucesso') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.successContainer}>
          <Text style={[styles.successIcon, { fontSize: scale(64) }]}>✅</Text>
          <Text style={[styles.successTitle, { fontSize: scale(24) }]}>
            {temFace ? 'Rosto Atualizado!' : 'Rosto Cadastrado!'}
          </Text>
          <Text style={[styles.successText, { fontSize: scale(16) }]}>
            Seus dados faciais foram salvos com sucesso.{'\n'}
            Agora você pode fazer login apenas olhando para a câmera.
          </Text>
          <ActivityIndicator size="large" color="#10B981" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.card, { transform: [{ scale: zoomLevel }] }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.logoContainer, { width: scale(70), height: scale(70), borderRadius: scale(35) }]}>
              <Text style={[styles.logoIcon, { fontSize: scale(32) }]}>🧠</Text>
            </View>
            <Text style={[styles.title, { fontSize: scale(24) }]}>Reconhecimento Facial</Text>
            <Text style={[styles.subtitle, { fontSize: scale(14) }]}>
              Gerencie seus dados de reconhecimento facial
            </Text>
          </View>

          {/* Status Box */}
          <View style={[styles.statusBox, temFace ? styles.statusBoxActive : styles.statusBoxInactive]}>
            <Text style={styles.statusIcon}>{temFace ? '✅' : '❌'}</Text>
            <View style={styles.statusContent}>
              <Text style={[styles.statusTitle, { fontSize: scale(15) }]}>
                {temFace ? 'Rosto Cadastrado' : 'Sem Rosto Cadastrado'}
              </Text>
              <Text style={[styles.statusText, { fontSize: scale(13) }]}>
                {temFace
                  ? 'Você pode fazer login com reconhecimento facial'
                  : 'Cadastre seu rosto para login rápido e seguro'}
              </Text>
            </View>
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Text style={[styles.infoIconBox, { fontSize: scale(20) }]}>ℹ️</Text>
            <View style={styles.infoContent}>
              <Text style={[styles.infoTitle, { fontSize: scale(13) }]}>Como funciona?</Text>
              <Text style={[styles.infoText, { fontSize: scale(12) }]}>
                • Seu rosto é convertido em um vetor numérico{'\n'}
                • <Text style={styles.bold}>Nenhuma imagem é armazenada</Text>{'\n'}
                • Apenas o vetor de características é salvo{'\n'}
                • Você pode remover ou atualizar a qualquer momento
              </Text>
            </View>
          </View>

          {/* Mensagens */}
          {erro && (
            <View style={styles.errorBoxInline}>
              <Text style={styles.errorIconInline}>⚠️</Text>
              <Text style={styles.errorTextInline}>{erro}</Text>
              <TouchableOpacity onPress={() => setErro(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.errorClose}>✕</Text>
              </TouchableOpacity>
            </View>
          )}

          {sucesso && (
            <View style={styles.successBoxInline}>
              <Text style={styles.successIconInline}>✅</Text>
              <Text style={styles.successTextInline}>{sucesso}</Text>
              <TouchableOpacity onPress={() => setSucesso(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.successClose}>✕</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Ações */}
          <View style={styles.actions}>
            {!temFace ? (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleIniciarCadastro}
                disabled={loading}
              >
                <Text style={styles.primaryButtonText}>📸 Cadastrar Meu Rosto</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleAtualizarRosto}
                  disabled={loading}
                >
                  <Text style={styles.primaryButtonText}>🔄 Atualizar Meu Rosto</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dangerButton}
                  onPress={handleRemoverFace}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.dangerButtonText}>🗑️ Remover Dados Faciais</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Botão Voltar */}
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>← Voltar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#667eea',
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
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  statusBoxActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  statusBoxInactive: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  statusIcon: {
    fontSize: 24,
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  statusText: {
    color: '#6B7280',
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
  infoIconBox: {
  },
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
  errorBoxInline: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorIconInline: {
    fontSize: 18,
    marginRight: 8,
  },
  errorTextInline: {
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
  successBoxInline: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  successIconInline: {
    fontSize: 18,
    marginRight: 8,
  },
  successTextInline: {
    flex: 1,
    color: '#059669',
    fontSize: 13,
    marginRight: 8,
  },
  successClose: {
    fontWeight: '600',
    color: '#059669',
    padding: 4,
  },
  actions: {
    gap: 12,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  dangerButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  dangerButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  backButton: {
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
  },
  backButtonText: {
    color: '#6B7280',
    fontWeight: '500',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  container: {
    flex: 1,
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
