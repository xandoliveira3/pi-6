import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './src/config/firebase';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import AdminScreen from './src/screens/AdminScreen';
import UsuarioScreen from './src/screens/UsuarioScreen';
import { logout } from './src/services/authService';

type TelaAtual = 'login' | 'registro' | 'admin' | 'usuario';

export default function App() {
  const [usuarioLogado, setUsuarioLogado] = useState<User | null>(null);
  const [tipoUsuario, setTipoUsuario] = useState<'admin' | 'usuario' | null>(null);
  const [telaAtual, setTelaAtual] = useState<TelaAtual>('login');
  const [loading, setLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuarioLogado(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  function handleLoginSuccess(tipo: 'admin' | 'usuario') {
    setTipoUsuario(tipo);
    setTelaAtual(tipo === 'admin' ? 'admin' : 'usuario');
  }

  function handleLogout() {
    setTipoUsuario(null);
    setTelaAtual('login');
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
    setZoomLevel(prev => Math.min(prev + 0.1, 2.0));
  }

  function handleZoomOut() {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.8));
  }

  function handleResetZoom() {
    setZoomLevel(1);
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

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Barra de Zoom - Visível em todas as telas */}
      {mostrarZoom && (
        <View style={styles.zoomBar}>
          <Text style={styles.zoomLabel}>Acessibilidade:</Text>
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
      )}
      
      {telaAtual === 'login' && (
        <LoginScreen
          onLoginSuccess={handleLoginSuccess}
          onGoToRegister={handleGoToRegister}
          zoomLevel={zoomLevel}
        />
      )}

      {telaAtual === 'registro' && (
        <RegisterScreen
          onRegisterSuccess={handleRegisterSuccess}
          onBackToLogin={handleBackToLogin}
          zoomLevel={zoomLevel}
        />
      )}
      
      {telaAtual === 'admin' && (
        <AdminScreen onLogout={handleLogout} zoomLevel={zoomLevel} />
      )}
      
      {telaAtual === 'usuario' && (
        <UsuarioScreen onLogout={handleLogout} zoomLevel={zoomLevel} />
      )}
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
  zoomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  zoomLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  zoomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#667eea',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 4,
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 6,
  },
  zoomIcon: {
    fontSize: 14,
  },
  zoomValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    minWidth: 50,
    textAlign: 'center',
  },
  zoomResetButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  zoomResetText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
});
