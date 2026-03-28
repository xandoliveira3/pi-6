import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { logout } from '../services/authService';

interface AdminScreenProps {
  onLogout: () => void;
}

export default function AdminScreen({ onLogout }: AdminScreenProps) {
  console.log('[AdminScreen] Renderizando...');
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Painel do Administrador</Text>
      <Text style={styles.description}>
        Área administrativa - funcionalidades em desenvolvimento
      </Text>
      <Button 
        title="Sair" 
        onPress={() => {
          console.log('[AdminScreen] Botão Sair pressionado');
          onLogout();
        }} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
});
