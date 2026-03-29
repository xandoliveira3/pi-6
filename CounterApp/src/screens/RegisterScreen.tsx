import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { registrarUsuario } from '../services/registroService';

interface RegisterScreenProps {
  onRegisterSuccess: () => void;
  onBackToLogin: () => void;
  zoomLevel?: number;
}

export default function RegisterScreen({ onRegisterSuccess, onBackToLogin, zoomLevel = 1 }: RegisterScreenProps) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const scale = (base: number) => base * zoomLevel;

  function validarCampos(): string | null {
    if (!nome || !email || !senha || !confirmarSenha) {
      return 'Preencha todos os campos.';
    }

    if (nome.trim().length < 3) {
      return 'O nome deve ter pelo menos 3 caracteres.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Digite um email válido.';
    }

    if (senha.length < 6) {
      return 'A senha deve ter pelo menos 6 caracteres.';
    }

    if (senha !== confirmarSenha) {
      return 'As senhas não coincidem.';
    }

    return null;
  }

  async function handleRegistrar() {
    setErro(null);

    const erroValidacao = validarCampos();
    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }

    setLoading(true);

    try {
      const result = await registrarUsuario(nome.trim(), email.trim(), senha);

      if (result.success && result.usuario) {
        onRegisterSuccess();
      } else {
        setErro(result.error || 'Erro ao criar conta.');
      }
    } catch (error: any) {
      setErro('Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.card, { transform: [{ scale: zoomLevel }] }]}>
            {/* Header */}
            <View style={styles.header}>
              <View style={[styles.logoContainer, { width: scale(70), height: scale(70), borderRadius: scale(35) }]}>
                <Text style={[styles.logoIcon, { fontSize: scale(32) }]}>👤</Text>
              </View>
              <Text style={[styles.title, { fontSize: scale(24) }]}>Criar Conta</Text>
              <Text style={[styles.subtitle, { fontSize: scale(14) }]}>Preencha os dados para se cadastrar</Text>
            </View>

            {/* Mensagem de Erro */}
            {erro && (
              <View style={styles.errorBox}>
                <Text style={[styles.errorText, { fontSize: scale(13) }]}>{erro}</Text>
                <TouchableOpacity onPress={() => setErro(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={[styles.errorClose, { fontSize: scale(18) }]}>✕</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Formulário */}
            <View style={styles.form}>
              {/* Nome */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { fontSize: scale(13) }]}>Nome completo</Text>
                <View style={styles.inputWrapper}>
                  <Text style={[styles.inputIcon, { fontSize: scale(18) }]}>👤</Text>
                  <TextInput
                    style={[styles.input, { fontSize: scale(15), paddingVertical: scale(12) }]}
                    placeholder="Seu nome"
                    placeholderTextColor="#9CA3AF"
                    value={nome}
                    onChangeText={(text) => {
                      setNome(text);
                      if (erro) setErro(null);
                    }}
                    autoCapitalize="words"
                    autoCorrect={false}
                    editable={!loading}
                  />
                </View>
              </View>

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { fontSize: scale(13) }]}>Email</Text>
                <View style={styles.inputWrapper}>
                  <Text style={[styles.inputIcon, { fontSize: scale(18) }]}>📧</Text>
                  <TextInput
                    style={[styles.input, { fontSize: scale(15), paddingVertical: scale(12) }]}
                    placeholder="seu@email.com"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (erro) setErro(null);
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                  />
                </View>
              </View>

              {/* Senha */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { fontSize: scale(13) }]}>Senha</Text>
                <View style={styles.inputWrapper}>
                  <Text style={[styles.inputIcon, { fontSize: scale(18) }]}>🔒</Text>
                  <TextInput
                    style={[styles.input, { fontSize: scale(15), paddingVertical: scale(12) }]}
                    placeholder="Mínimo 6 caracteres"
                    placeholderTextColor="#9CA3AF"
                    value={senha}
                    onChangeText={(text) => {
                      setSenha(text);
                      if (erro) setErro(null);
                    }}
                    secureTextEntry
                    autoCapitalize="none"
                    editable={!loading}
                  />
                </View>
              </View>

              {/* Confirmar Senha */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { fontSize: scale(13) }]}>Confirmar senha</Text>
                <View style={styles.inputWrapper}>
                  <Text style={[styles.inputIcon, { fontSize: scale(18) }]}>🔓</Text>
                  <TextInput
                    style={[styles.input, { fontSize: scale(15), paddingVertical: scale(12) }]}
                    placeholder="Repita a senha"
                    placeholderTextColor="#9CA3AF"
                    value={confirmarSenha}
                    onChangeText={(text) => {
                      setConfirmarSenha(text);
                      if (erro) setErro(null);
                    }}
                    secureTextEntry
                    autoCapitalize="none"
                    editable={!loading}
                  />
                </View>
              </View>

              {/* Botão Cadastrar */}
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleRegistrar}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={[styles.buttonText, { fontSize: scale(16) }]}>Criar Conta</Text>
                )}
              </TouchableOpacity>

              {/* Voltar para Login */}
              <TouchableOpacity
                style={styles.backButton}
                onPress={onBackToLogin}
                disabled={loading}
              >
                <Text style={[styles.backButtonText, { fontSize: scale(14) }]}>← Voltar para o login</Text>
              </TouchableOpacity>
            </View>

            {/* Info Box - Aprovação */}
            <View style={styles.infoBox}>
              <Text style={[styles.infoIcon, { fontSize: scale(20) }]}>⏳</Text>
              <View style={styles.infoContent}>
                <Text style={[styles.infoTitle, { fontSize: scale(13) }]}>Aprovação necessária</Text>
                <Text style={[styles.infoText, { fontSize: scale(12) }]}>
                  Após o cadastro, sua conta será revisada pelo administrador. Você receberá acesso após a aprovação.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#667eea',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  logoIcon: {
  },
  title: {
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 6,
  },
  subtitle: {
    color: '#6B7280',
    textAlign: 'center',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    color: '#DC2626',
    marginRight: 8,
  },
  errorClose: {
    fontWeight: '600',
    color: '#DC2626',
    padding: 4,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontWeight: '600',
    color: '#374151',
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 2,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#1F2937',
  },
  button: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
  backButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  backButtonText: {
    color: '#6B7280',
    fontWeight: '500',
  },
  infoBox: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  infoIcon: {
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
  },
  infoText: {
    color: '#78350F',
    lineHeight: 18,
  },
});
