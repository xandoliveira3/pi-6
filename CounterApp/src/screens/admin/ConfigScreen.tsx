import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';

interface ConfigScreenProps {
  onLogout: () => void;
  zoomLevel?: number;
}

export default function ConfigScreen({ onLogout, zoomLevel = 1 }: ConfigScreenProps) {
  const scale = (base: number) => base * zoomLevel;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { fontSize: scale(24) }]}>Configurações</Text>
        <Text style={[styles.subtitle, { fontSize: scale(14) }]}>Preferências do administrador</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={[styles.cardIcon, { fontSize: scale(32) }]}>🔐</Text>
          <Text style={[styles.cardTitle, { fontSize: scale(16) }]}>Segurança</Text>
          <Text style={[styles.cardText, { fontSize: scale(14) }]}>
            Sua conta de administrador está protegida pelo Firebase Authentication.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={[styles.cardIcon, { fontSize: scale(32) }]}>📱</Text>
          <Text style={[styles.cardTitle, { fontSize: scale(16) }]}>Sobre o App</Text>
          <Text style={[styles.cardText, { fontSize: scale(14) }]}>
            Sistema de Reconhecimento Facial v1.0
          </Text>
          <Text style={[styles.cardText, { fontSize: scale(14) }]}>
            Desenvolvido com React Native + Expo
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={[styles.cardIcon, { fontSize: scale(32) }]}>🔗</Text>
          <Text style={[styles.cardTitle, { fontSize: scale(16) }]}>Firebase Console</Text>
          <Text style={[styles.cardText, { fontSize: scale(14) }]}>
            Acesse o painel do Firebase para gerenciar usuários e configurações.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => Linking.openURL('https://console.firebase.google.com')}
          >
            <Text style={[styles.buttonText, { fontSize: scale(14) }]}>Abrir Firebase Console</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={[styles.logoutIcon, { fontSize: scale(20) }]}>🚪</Text>
          <Text style={[styles.logoutText, { fontSize: scale(16) }]}>Fazer Logout</Text>
        </TouchableOpacity>
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
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subtitle: {
    color: '#6B7280',
    marginTop: 4,
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardIcon: {
    marginBottom: 12,
  },
  cardTitle: {
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  cardText: {
    color: '#6B7280',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#667eea',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 8,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutIcon: {
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
  },
});
