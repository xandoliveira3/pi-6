import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet, Text, TouchableOpacity, Dimensions, PanResponder, ScrollView, Platform } from 'react-native';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './src/config/firebase';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import AdminScreen from './src/screens/AdminScreen';
import UsuarioScreen from './src/screens/UsuarioScreen';
import { logout } from './src/services/authService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

type TelaAtual = 'login' | 'registro' | 'admin' | 'usuario';

export default function App() {
  const [usuarioLogado, setUsuarioLogado] = useState<User | null>(null);
  const [tipoUsuario, setTipoUsuario] = useState<'admin' | 'usuario' | null>(null);
  const [telaAtual, setTelaAtual] = useState<TelaAtual>('login');
  const [loading, setLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const panResponder = useRef<any>(null);
  const offsetRef = useRef({ x: 0, y: 0 });
  
  // Suavização do movimento - 1 = sem suavização, controle total
  const smoothingFactor = 1.0; // Controle total do usuário

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuarioLogado(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // PanResponder para movimento com zoom - Web: horizontal, Mobile: todas direções
  useEffect(() => {
    panResponder.current = PanResponder.create({
      // Não capturar toque inicial - deixa os TextInput funcionarem
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      // Web: captura apenas movimento horizontal (permite scroll vertical)
      // Mobile: captura movimento em qualquer direção
      onMoveShouldSetPanResponder: (_, gestureState) => {
        if (zoomLevel <= 1) return false;
        if (isWeb) {
          // Web: só captura se movimento horizontal for maior que vertical
          return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 5;
        }
        return Math.abs(gestureState.dx) > 3 || Math.abs(gestureState.dy) > 3;
      },
      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
        if (zoomLevel <= 1) return false;
        if (isWeb) {
          return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 5;
        }
        return Math.abs(gestureState.dx) > 3 || Math.abs(gestureState.dy) > 3;
      },
      onPanResponderGrant: () => {
        // Início do pan
      },
      onPanResponderMove: (_, gestureState) => {
        if (zoomLevel > 1) {
          // Calcular limites corretamente baseado no zoom
          const maxOffsetX = (SCREEN_WIDTH * zoomLevel) - SCREEN_WIDTH;
          const maxOffsetY = (SCREEN_HEIGHT * zoomLevel) - SCREEN_HEIGHT;

          // Movimento 1:1 com o usuário
          let newX = offsetRef.current.x + gestureState.dx;
          let newY = offsetRef.current.y + gestureState.dy;

          // Limitar para não mostrar área em branco
          newX = Math.max(-maxOffsetX, Math.min(0, newX));
          newY = Math.max(-maxOffsetY, Math.min(0, newY));

          // Atualiza estado E ref simultaneamente
          setOffsetX(newX);
          setOffsetY(newY);
          offsetRef.current = { x: newX, y: newY };
        }
      },
      onPanResponderRelease: () => {
        // Fim do pan
      },
      onPanResponderTerminate: () => {
        // Terminado
      },
    });

    return () => {
      panResponder.current = null;
    };
  }, [zoomLevel, isWeb]);

  function handleLoginSuccess(tipo: 'admin' | 'usuario') {
    setTipoUsuario(tipo);
    setTelaAtual(tipo === 'admin' ? 'admin' : 'usuario');
  }

  function handleLogout() {
    setTipoUsuario(null);
    setTelaAtual('login');
    setOffsetX(0);
    setOffsetY(0);
    offsetRef.current = { x: 0, y: 0 };
    logout();
  }

  function handleGoToRegister() {
    setTelaAtual('registro');
  }

  function handleBackToLogin() {
    setTelaAtual('login');
  }

  function handleRegisterSuccess() {
    setTelaAtual('login');
  }

  function handleZoomIn() {
    setZoomLevel(prev => {
      const newZoom = Math.min(prev + 0.1, 2.0);
      if (newZoom <= 1.01) {
        setOffsetX(0);
        setOffsetY(0);
        offsetRef.current = { x: 0, y: 0 };
      }
      return newZoom;
    });
  }

  function handleZoomOut() {
    setZoomLevel(prev => {
      const newZoom = Math.max(prev - 0.1, 0.8);
      if (newZoom <= 1.01) {
        setOffsetX(0);
        setOffsetY(0);
        offsetRef.current = { x: 0, y: 0 };
      }
      return newZoom;
    });
  }

  function handleResetZoom() {
    setZoomLevel(1);
    setOffsetX(0);
    setOffsetY(0);
    offsetRef.current = { x: 0, y: 0 };
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  // Barra de zoom aparece em todas as telas
  const mostrarZoom = true;

  // Conteúdo renderizado baseado na tela atual
  const renderScreen = () => {
    if (telaAtual === 'login') {
      return (
        <LoginScreen
          onLoginSuccess={handleLoginSuccess}
          onGoToRegister={handleGoToRegister}
          zoomLevel={zoomLevel}
        />
      );
    }

    if (telaAtual === 'registro') {
      return (
        <RegisterScreen
          onRegisterSuccess={handleRegisterSuccess}
          onBackToLogin={handleBackToLogin}
          zoomLevel={zoomLevel}
        />
      );
    }

    if (telaAtual === 'admin') {
      return <AdminScreen onLogout={handleLogout} zoomLevel={zoomLevel} />;
    }

    if (telaAtual === 'usuario') {
      return <UsuarioScreen onLogout={handleLogout} zoomLevel={zoomLevel} />;
    }

    return null;
  };

  // Calcular limites de scroll baseado no zoom
  const maxOffsetX = zoomLevel > 1 ? (SCREEN_WIDTH * zoomLevel) - SCREEN_WIDTH : 0;
  const maxOffsetY = zoomLevel > 1 ? (SCREEN_HEIGHT * zoomLevel) - SCREEN_HEIGHT : 0;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Barra de Zoom - Lado Direito (todas as plataformas) */}
      {mostrarZoom && (
        <View style={styles.zoomBarContainer}>
          <View style={styles.zoomBar}>
            <TouchableOpacity
              style={[styles.zoomButton, zoomLevel <= 0.8 && styles.zoomButtonDisabled]}
              onPress={handleZoomOut}
              disabled={zoomLevel <= 0.8}
              activeOpacity={0.7}
            >
              <Text style={styles.zoomButtonText}>🔍</Text>
              <Text style={[styles.zoomButtonText, { fontSize: 12, marginLeft: 4 }]}>-</Text>
            </TouchableOpacity>

            <View style={styles.zoomIndicator}>
              <Text style={styles.zoomIcon}>👁️</Text>
              <Text style={styles.zoomValue}>{Math.round(zoomLevel * 100)}%</Text>
            </View>

            <TouchableOpacity
              style={[styles.zoomButton, zoomLevel >= 2.0 && styles.zoomButtonDisabled]}
              onPress={handleZoomIn}
              disabled={zoomLevel >= 2.0}
              activeOpacity={0.7}
            >
              <Text style={styles.zoomButtonText}>🔍</Text>
              <Text style={[styles.zoomButtonText, { fontSize: 12, marginLeft: 4 }]}>+</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.zoomResetButton}
              onPress={handleResetZoom}
              activeOpacity={0.7}
            >
              <Text style={styles.zoomResetText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Conteúdo - Todas plataformas com zoom */}
      <ScrollView
        style={styles.contentContainerWithPan}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={true}
        scrollEnabled={true}
        nestedScrollEnabled={true}
      >
        <View
          style={[
            styles.scaledContent,
            {
              width: SCREEN_WIDTH * zoomLevel,
              minHeight: SCREEN_HEIGHT * zoomLevel,
              transform: [
                { translateX: offsetX },
                { translateY: offsetY },
              ],
            },
          ]}
          {...(zoomLevel > 1 ? panResponder.current?.panHandlers : {})}
        >
          <View style={[styles.innerContent, {
            width: SCREEN_WIDTH * zoomLevel,
            minHeight: SCREEN_HEIGHT * zoomLevel,
          }]}>
            <View style={{ width: SCREEN_WIDTH * zoomLevel, minHeight: SCREEN_HEIGHT * zoomLevel }}>
              {renderScreen()}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#667eea',
  },
  contentContainer: {
    flex: 1,
    overflow: 'visible',
    minHeight: SCREEN_HEIGHT,
  },
  contentContainerWithPan: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContentContainer: {
    flexGrow: 1,
    backgroundColor: 'transparent',
  },
  scaledContent: {
    minWidth: SCREEN_WIDTH,
    minHeight: SCREEN_HEIGHT,
  },
  innerContent: {
    minWidth: SCREEN_WIDTH,
    minHeight: SCREEN_HEIGHT,
  },
  zoomBarContainer: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -70 }],
    zIndex: 1000,
  },
  zoomBar: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  zoomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#667eea',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 10,
    gap: 4,
    minWidth: 50,
  },
  zoomButtonDisabled: {
    opacity: 0.4,
  },
  zoomButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  zoomIndicator: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 8,
    gap: 4,
  },
  zoomIcon: {
    fontSize: 16,
  },
  zoomValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  zoomResetButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  zoomResetText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
});
