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
  
  // Barra de zoom arrastável
  const [zoomBarPos, setZoomBarPos] = useState({ x: SCREEN_WIDTH - 80, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const zoomBarPan = useRef<any>(null);
  
  // Inicializar PanResponder da barra de zoom (apenas no handle)
  useEffect(() => {
    zoomBarPan.current = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Só ativa se mover mais que 2px
        return Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2;
      },
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: () => {
        setIsDragging(true);
      },
      onPanResponderMove: (_, gestureState) => {
        // Mover barra com o gesto - limita às bordas da tela
        const newX = Math.max(0, Math.min(SCREEN_WIDTH - 70, gestureState.moveX - 35));
        const newY = Math.max(0, Math.min(SCREEN_HEIGHT - 100, gestureState.moveY - 15));
        setZoomBarPos({ x: newX, y: newY });
      },
      onPanResponderRelease: () => {
        setIsDragging(false);
      },
      onPanResponderTerminate: () => {
        setIsDragging(false);
      },
    });
  }, []);
  
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
      // Reset offset quando zoom volta para 1.0 ou menos
      if (newZoom <= 1.0) {
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

  function handleToggleExpand() {
    setIsExpanded(!isExpanded);
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

      {/* Barra de Zoom - Arrastável (todas as plataformas) */}
      {mostrarZoom && (
        <View
          style={[
            styles.zoomBarContainer,
            {
              left: zoomBarPos.x,
              top: zoomBarPos.y,
            },
          ]}
        >
          {/* Handle de arraste (topo) */}
          <View
            style={[
              styles.zoomDragHandle,
              isDragging && styles.zoomDragHandleActive,
            ]}
            {...zoomBarPan.current?.panHandlers}
            pointerEvents="box-only"
          >
            <Text style={[styles.dragHandleIcon, isDragging && styles.dragHandleIconActive]}>⠿</Text>
          </View>
          
          {/* Botões de zoom (expansível) */}
          {isExpanded && (
            <View style={styles.zoomButtonsContainer}>
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

              {/* Separador */}
              <View style={styles.toggleSeparator} />

              {/* Botão de Expandir/Recolher */}
              <TouchableOpacity
                style={styles.toggleExpandButton}
                onPress={handleToggleExpand}
                activeOpacity={0.7}
              >
                <Text style={styles.toggleExpandText}>
                  {isExpanded ? 'Recolher ▲' : 'Expandir ▼'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Botão de Expandir (quando recolhido) */}
          {!isExpanded && (
            <TouchableOpacity
              style={styles.toggleExpandButtonCollapsed}
              onPress={handleToggleExpand}
              activeOpacity={0.7}
            >
              <Text style={styles.toggleExpandIcon}>▲</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Conteúdo - Todas plataformas com zoom */}
      <ScrollView
        style={styles.contentContainerWithPan}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={true}
        scrollEnabled={true}
        nestedScrollEnabled={true}
        contentOffset={{ x: 0, y: 0 }}
      >
        <View
          style={[
            styles.scaledContent,
            {
              width: Math.max(SCREEN_WIDTH, SCREEN_WIDTH * zoomLevel),
              minHeight: Math.max(SCREEN_HEIGHT, SCREEN_HEIGHT * zoomLevel),
              transform: [
                { translateX: offsetX },
                { translateY: offsetY },
              ],
            },
          ]}
          {...(zoomLevel > 1 ? panResponder.current?.panHandlers : {})}
        >
          <View style={[styles.innerContent, {
            width: Math.max(SCREEN_WIDTH, SCREEN_WIDTH * zoomLevel),
            minHeight: Math.max(SCREEN_HEIGHT, SCREEN_HEIGHT * zoomLevel),
          }]}>
            <View style={{ 
              width: SCREEN_WIDTH, 
              minHeight: SCREEN_HEIGHT,
              flex: zoomLevel <= 1 ? 1 : undefined,
            }}>
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
    overflow: 'hidden',
  },
  scrollContentContainer: {
    flexGrow: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  scaledContent: {
    minWidth: SCREEN_WIDTH,
    minHeight: SCREEN_HEIGHT,
    justifyContent: 'flex-start',
  },
  innerContent: {
    minWidth: SCREEN_WIDTH,
    minHeight: SCREEN_HEIGHT,
  },
  zoomBarContainer: {
    position: 'absolute',
    zIndex: 1000,
  },
  zoomDragHandle: {
    backgroundColor: '#667eea',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 30,
    cursor: 'pointer',
    userSelect: 'none',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  zoomDragHandleActive: {
    backgroundColor: '#5568d3',
    shadowColor: '#5568d3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  dragHandleIcon: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 18,
    userSelect: 'none',
  },
  dragHandleIconActive: {
    color: '#fff',
  },
  zoomButtonsContainer: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
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
    maxWidth: SCREEN_WIDTH - 20,
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
  toggleSeparator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 10,
  },
  toggleExpandButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  toggleExpandButtonCollapsed: {
    backgroundColor: '#667eea',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  toggleExpandText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  toggleExpandIcon: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '700',
  },
});
