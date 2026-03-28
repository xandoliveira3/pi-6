import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './src/config/firebase';
import LoginScreen from './src/screens/LoginScreen';
import AdminScreen from './src/screens/AdminScreen';
import UsuarioScreen from './src/screens/UsuarioScreen';
import { logout } from './src/services/authService';

type TipoUsuario = 'admin' | 'usuario' | null;

export default function App() {
  const [usuarioLogado, setUsuarioLogado] = useState<User | null>(null);
  const [tipoUsuario, setTipoUsuario] = useState<TipoUsuario>(null);
  const [loading, setLoading] = useState(true);

  console.log('[App] Renderizando... usuarioLogado:', usuarioLogado?.email ?? 'null', 'tipoUsuario:', tipoUsuario);

  useEffect(() => {
    console.log('[App] useEffect: Configurando monitor de auth...');
    
    // Monitora estado de autenticação
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('[App] onAuthStateChanged:', user?.email ?? 'null');
      if (user) {
        console.log('[App] UID:', user.uid);
      }
      setUsuarioLogado(user);
      setLoading(false);
    });

    return () => {
      console.log('[App] Cleanup: removendo listener de auth');
      unsubscribe();
    };
  }, []);

  function handleLoginSuccess(tipo: 'admin' | 'usuario') {
    console.log('[App] handleLoginSuccess: tipo =', tipo);
    setTipoUsuario(tipo);
  }

  function handleLogout() {
    console.log('[App] handleLogout chamado');
    setTipoUsuario(null);
    logout();
  }

  if (loading) {
    console.log('[App] Renderizando loading...');
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  console.log('[App] Renderizando tela baseada no estado');

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      {!usuarioLogado || !tipoUsuario ? (
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      ) : tipoUsuario === 'admin' ? (
        <AdminScreen onLogout={handleLogout} />
      ) : (
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
    backgroundColor: '#f5f5f5',
  },
});
