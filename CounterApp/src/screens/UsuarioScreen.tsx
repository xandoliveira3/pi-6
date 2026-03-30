import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface UsuarioScreenProps {
  onLogout: () => void;
  zoomLevel?: number;
}

export default function UsuarioScreen({ onLogout, zoomLevel = 1 }: UsuarioScreenProps) {
  const scale = (base: number) => base * zoomLevel;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { fontSize: scale(24) }]}>Área do Usuário</Text>
        <Text style={[styles.subtitle, { fontSize: scale(14) }]}>Bem-vindo ao sistema!</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={[styles.cardIcon, { fontSize: scale(32) }]}>✅</Text>
          <Text style={[styles.cardTitle, { fontSize: scale(16) }]}>Conta Aprovada</Text>
          <Text style={[styles.cardText, { fontSize: scale(14), lineHeight: scale(20) }]}>
            Sua conta foi aprovada pelo administrador. Você já pode acessar todas as funcionalidades.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={[styles.cardIcon, { fontSize: scale(32) }]}>🎯</Text>
          <Text style={[styles.cardTitle, { fontSize: scale(16) }]}>Funcionalidades</Text>
          <Text style={[styles.cardText, { fontSize: scale(14), lineHeight: scale(20) }]}>
            Em desenvolvimento. Em breve você poderá:
          </Text>
          <View style={styles.featureList}>
            <Text style={[styles.featureItem, { fontSize: scale(14), lineHeight: scale(22) }]}>• Fazer reconhecimento facial</Text>
            <Text style={[styles.featureItem, { fontSize: scale(14), lineHeight: scale(22) }]}>• Visualizar seu histórico</Text>
            <Text style={[styles.featureItem, { fontSize: scale(14), lineHeight: scale(22) }]}>• Gerenciar seu perfil</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={[styles.cardIcon, { fontSize: scale(32) }]}>ℹ️</Text>
          <Text style={[styles.cardTitle, { fontSize: scale(16) }]}>Status da Conta</Text>
          <View style={styles.statusRow}>
            <Text style={[styles.statusLabel, { fontSize: scale(14) }]}>Situação:</Text>
            <View style={styles.statusBadge}>
              <Text style={[styles.statusText, { fontSize: scale(12) }]}>Ativa</Text>
            </View>
          </View>
          <Text style={[styles.cardText, { fontSize: scale(14), lineHeight: scale(20) }]}>
            Sua conta está ativa e em bom standing.
          </Text>
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
  },
  featureList: {
    marginTop: 8,
    gap: 6,
  },
  featureItem: {
    color: '#374151',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  statusLabel: {
    color: '#6B7280',
  },
  statusBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontWeight: '600',
    color: '#059669',
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
    marginRight: 8,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
  },
});
