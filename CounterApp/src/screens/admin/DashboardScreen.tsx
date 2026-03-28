import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

interface DashboardScreenProps {
  zoomLevel?: number;
}

export default function DashboardScreen({ zoomLevel = 1 }: DashboardScreenProps) {
  const scale = (base: number) => base * zoomLevel;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { fontSize: scale(24) }]}>Dashboard</Text>
        <Text style={[styles.subtitle, { fontSize: scale(14) }]}>Visão geral do sistema</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={[styles.cardIcon, { fontSize: scale(40) }]}>📊</Text>
          <Text style={[styles.cardTitle, { fontSize: scale(18) }]}>Estatísticas</Text>
          <Text style={[styles.cardText, { fontSize: scale(14) }]}>
            Funcionalidade em desenvolvimento. Em breve você verá gráficos e métricas de uso.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={[styles.cardIcon, { fontSize: scale(40) }]}>👥</Text>
          <Text style={[styles.cardTitle, { fontSize: scale(18) }]}>Usuários</Text>
          <Text style={[styles.cardText, { fontSize: scale(14) }]}>
            Acesse a aba "Usuários" para gerenciar os cadastros pendentes e ativos.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={[styles.cardIcon, { fontSize: scale(40) }]}>🔒</Text>
          <Text style={[styles.cardTitle, { fontSize: scale(18) }]}>Segurança</Text>
          <Text style={[styles.cardText, { fontSize: scale(14) }]}>
            Todos os usuários precisam de aprovação do administrador para acessar o sistema.
          </Text>
        </View>
      </View>
    </ScrollView>
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
    alignItems: 'center',
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
    textAlign: 'center',
    lineHeight: 20,
  },
});
