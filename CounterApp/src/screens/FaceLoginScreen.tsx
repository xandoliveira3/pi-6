import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { faceEmbeddingService } from '../services/faceEmbeddingService';
import { loginWithFace, FaceLoginResult } from '../services/faceLoginService';

interface FaceLoginScreenProps {
  onLoginSuccess: (tipoUsuario: 'admin' | 'usuario') => void;
  onGoToEmailLogin: () => void;
  onGoToFaceRegister: () => void;
  zoomLevel?: number;
}

export default function FaceLoginScreen({
  onLoginSuccess,
  onGoToEmailLogin,
  onGoToFaceRegister,
  zoomLevel = 1,
}: FaceLoginScreenProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'front' | 'back'>('front');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [cameraReady, setCameraReady] = useState(false);

  const cameraRef = useRef<CameraView>(null);

  const scale = (base: number) => base * zoomLevel;

  useEffect(() => {
    setHasPermission(cameraPermission?.granted ?? false);
  }, [cameraPermission]);

  useEffect(() => {
    requestCameraPermission();
  }, []);

  async function handleFaceLogin() {
    setErro(null);
    setLoading(true);
    setCapturing(true);
    setProgress(0);

    if (!cameraReady) {
      setErro('Câmera ainda não está pronta. Aguarde um momento.');
      setLoading(false);
      setCapturing(false);
      return;
    }

    try {
      // Simular progresso visual
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result: FaceLoginResult = await loginWithFace(cameraRef);

      clearInterval(progressInterval);
      setProgress(100);

      if (result.success && result.usuario) {
        // Pequeno delay para UX
        await new Promise(resolve => setTimeout(resolve, 300));
        onLoginSuccess(result.usuario.tipo_usuario);
      } else {
        console.log('[FaceLoginScreen] Login falhou:', result.error);
        setErro(result.error || 'Não foi possível reconhecer o rosto.');
      }
    } catch (error: any) {
      console.error('[FaceLoginScreen] Exceção:', error.message);
      setErro('Erro ao acessar câmera. Tente novamente.');
    } finally {
      setLoading(false);
      setCapturing(false);
    }
  }

  function handleRetry() {
    setErro(null);
    setProgress(0);
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
            O acesso à câmera é necessário para o reconhecimento facial.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={() => Alert.alert('Permissão', 'Habilite a câmera nas configurações do app.')}
          >
            <Text style={styles.permissionButtonText}>Abrir Configurações</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={onGoToEmailLogin}>
            <Text style={styles.backButtonText}>← Voltar para login com email</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
            {/* Overlay de orientação */}
            <View style={styles.overlay}>
              {/* Frame facial */}
              <View style={[styles.faceFrame, capturing && styles.faceFrameActive]}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
              </View>

              {!capturing && (
                <View style={styles.instructionContainer}>
                  <Text style={styles.instructionText}>Posicione o rosto no centro</Text>
                  <TouchableOpacity style={styles.captureButton} onPress={handleFaceLogin}>
                    <View style={styles.captureButtonInner}>
                      <Text style={styles.captureIcon}>📸</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}

              {capturing && (
                <View style={styles.capturingContainer}>
                  <ActivityIndicator size="large" color="#fff" />
                  <Text style={styles.capturingText}>
                    {progress < 100 ? 'Capturando rosto...' : 'Verificando identidade...'}
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
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryButtonText}>Tentar Novamente</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Ações inferiores */}
        {!capturing && (
          <View style={styles.bottomActions}>
            <TouchableOpacity style={styles.emailLoginButton} onPress={onGoToEmailLogin}>
              <Text style={styles.emailLoginButtonText}>📧 Login com Email</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.registerButton} onPress={onGoToFaceRegister}>
              <Text style={styles.registerButtonText}>👤 Criar conta com reconhecimento facial</Text>
            </TouchableOpacity>
          </View>
        )}
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
  permissionButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  permissionButtonText: {
    color: '#667eea',
    fontWeight: '600',
  },
  backButton: {
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#E5E7EB',
    fontWeight: '500',
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
    position: 'relative',
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
  captureButton: {
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
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  errorIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  errorText: {
    flex: 1,
    color: '#DC2626',
    fontSize: 13,
  },
  retryButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  bottomActions: {
    backgroundColor: '#fff',
    padding: 16,
    gap: 12,
  },
  emailLoginButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  emailLoginButtonText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 14,
  },
  registerButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
