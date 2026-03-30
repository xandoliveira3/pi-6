import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { auth } from '@config/firebase';
import { listarFormularios } from '@services/formularioService';
import { verificarSeJaRespondeu } from '@services/respostasService';
import ResponderFormularioScreen from './admin/ResponderFormularioScreen';
import type { Formulario } from '@services/formularioService';

interface UsuarioScreenProps {
  onLogout: () => void;
  zoomLevel?: number;
}

export default function UsuarioScreen({ onLogout, zoomLevel = 1 }: UsuarioScreenProps) {
  const scale = (base: number) => base * zoomLevel;
  const [formularios, setFormularios] = useState<Formulario[]>([]);
  const [loading, setLoading] = useState(true);
  const [formularioResponder, setFormularioResponder] = useState<Formulario | null>(null);
  const [respostasStatus, setRespostasStatus] = useState<{ [key: string]: boolean }>({});
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  async function carregarFormularios() {
    setLoading(true);
    const lista = await listarFormularios();
    const formulariosAtivos = lista.filter(f => f.ativo);
    setFormularios(formulariosAtivos);

    // Verifica quais já foram respondidos
    const usuario = auth.currentUser;
    if (usuario) {
      const status: { [key: string]: boolean } = {};
      for (const form of formulariosAtivos) {
        status[form.id] = await verificarSeJaRespondeu(form.id, usuario.uid);
      }
      setRespostasStatus(status);
    }
    setLoading(false);
  }

  useEffect(() => {
    carregarFormularios();
  }, []);

  function handleResponderFormulario(formulario: Formulario) {
    setFormularioResponder(formulario);
  }

  function handleFormularioRespondido() {
    console.log('[UsuarioScreen] Formulário respondido, recarregando...');
    setMensagemSucesso('Formulário respondido com sucesso! ✅');
    setFormularioResponder(null);
    // Recarrega a lista de formulários e status
    carregarFormularios();
    
    // Remove mensagem após 3 segundos
    setTimeout(() => {
      setMensagemSucesso(null);
    }, 3000);
  }

  if (formularioResponder) {
    return (
      <ResponderFormularioScreen
        zoomLevel={zoomLevel}
        formulario={formularioResponder}
        onVoltar={() => setFormularioResponder(null)}
        onResponder={handleFormularioRespondido}
      />
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Carregando formulários...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { fontSize: scale(24) }]}>📋 Formulários</Text>
        <Text style={[styles.subtitle, { fontSize: scale(14) }]}>
          Responda os formulários abaixo. Cada um pode ser respondido apenas uma vez.
        </Text>
      </View>

      {/* Mensagem de Sucesso */}
      {mensagemSucesso && (
        <View style={styles.mensagemSucessoContainer}>
          <Text style={styles.mensagemSucessoIcon}>✅</Text>
          <Text style={styles.mensagemSucessoTexto}>{mensagemSucesso}</Text>
        </View>
      )}

      <View style={styles.content}>
        {formularios.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>Nenhum formulário disponível no momento</Text>
          </View>
        ) : (
          formularios.map((formulario) => (
            <View key={formulario.id} style={[
              styles.card,
              respostasStatus[formulario.id] ? styles.cardRespondido : styles.cardPendente
            ]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { fontSize: scale(16) }]}>
                  {formulario.titulo}
                </Text>
                {respostasStatus[formulario.id] ? (
                  <View style={styles.statusBadgeRespondido}>
                    <Text style={styles.statusBadgeText}>✅ Respondido</Text>
                  </View>
                ) : (
                  <View style={styles.statusBadgePendente}>
                    <Text style={styles.statusBadgeText}>⏳ Pendente</Text>
                  </View>
                )}
              </View>
              
              <Text style={[styles.cardDescription, { fontSize: scale(13) }]} numberOfLines={3}>
                {formulario.descricao}
              </Text>
              
              <View style={styles.cardFooter}>
                <Text style={[styles.cardInfo, { fontSize: scale(11) }]}>
                  📄 {formulario.perguntas?.length || 0} pergunta(s)
                </Text>
                
                {respostasStatus[formulario.id] ? (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.actionButtonDisabled]}
                    disabled
                  >
                    <Text style={styles.actionButtonTextDisabled}>Já Respondido</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleResponderFormulario(formulario)}
                  >
                    <Text style={styles.actionButtonText}>Responder →</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={[styles.logoutIcon, { fontSize: scale(20) }]}>🚪</Text>
          <Text style={[styles.logoutText, { fontSize: scale(16) }]}>Fazer Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#667eea',
  },
  loadingText: {
    marginTop: 12,
    color: '#fff',
  },
  mensagemSucessoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#059669',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    gap: 10,
  },
  mensagemSucessoIcon: {
    fontSize: 24,
  },
  mensagemSucessoTexto: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#059669',
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
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardPendente: {
    borderColor: '#667eea',
  },
  cardRespondido: {
    borderColor: '#A7F3D0',
    backgroundColor: '#F0FDF4',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cardTitle: {
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  cardDescription: {
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardInfo: {
    color: '#9CA3AF',
  },
  statusBadgePendente: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginLeft: 8,
  },
  statusBadgeRespondido: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginLeft: 8,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  actionButton: {
    backgroundColor: '#667eea',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  actionButtonDisabled: {
    backgroundColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  actionButtonTextDisabled: {
    color: '#6B7280',
    fontSize: 13,
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
