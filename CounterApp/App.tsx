import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
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
    // Após registrar, volta para login
    setTelaAtual('login');
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {telaAtual === 'login' && (
        <LoginScreen 
          onLoginSuccess={handleLoginSuccess}
          onGoToRegister={handleGoToRegister}
        />
      )}
      
      {telaAtual === 'registro' && (
        <RegisterScreen 
          onRegisterSuccess={handleRegisterSuccess}
          onBackToLogin={handleBackToLogin}
        />
      )}
      
      {telaAtual === 'admin' && (
        <AdminScreen onLogout={handleLogout} />
      )}
      
      {telaAtual === 'usuario' && (
        <UsuarioScreen onLogout={handleLogout} />
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
});
