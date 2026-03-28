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
  Alert,
} from 'react-native';
import { registrarUsuario } from '../services/registroService';

interface RegisterScreenProps {
  onRegisterSuccess: () => void;
  onBackToLogin: () => void;
}

export default function RegisterScreen({ onRegisterSuccess, onBackToLogin }: RegisterScreenProps) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

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
          <View style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Text style={styles.logoIcon}>👤</Text>
              </View>
              <Text style={styles.title}>Criar Conta</Text>
              <Text style={styles.subtitle}>Preencha os dados para se cadastrar</Text>
            </View>

            {/* Mensagem de Erro */}
            {erro && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{erro}</Text>
                <TouchableOpacity onPress={() => setErro(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={styles.errorClose}>✕</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Formulário */}
            <View style={styles.form}>
              {/* Nome */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nome completo</Text>
                <View style={[styles.inputWrapper, erro && !nome && styles.inputError]}>
                  <Text style={styles.inputIcon}>👤</Text>
                  <TextInput
                    style={styles.input}
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
                <Text style={styles.inputLabel}>Email</Text>
                <View style={[styles.inputWrapper, erro && !email && styles.inputError]}>
                  <Text style={styles.inputIcon}>📧</Text>
                  <TextInput
                    style={styles.input}
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
                <Text style={styles.inputLabel}>Senha</Text>
                <View style={[styles.inputWrapper, erro && !senha && styles.inputError]}>
                  <Text style={styles.inputIcon}>🔒</Text>
                  <TextInput
                    style={styles.input}
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
                <Text style={styles.inputLabel}>Confirmar senha</Text>
                <View style={[styles.inputWrapper, erro && !confirmarSenha && styles.inputError]}>
                  <Text style={styles.inputIcon}>🔓</Text>
                  <TextInput
                    style={styles.input}
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
                  <Text style={styles.buttonText}>Criar Conta</Text>
                )}
              </TouchableOpacity>

              {/* Voltar para Login */}
              <TouchableOpacity
                style={styles.backButton}
                onPress={onBackToLogin}
                disabled={loading}
              >
                <Text style={styles.backButtonText}>← Voltar para o login</Text>
              </TouchableOpacity>
            </View>

            {/* Info */}
            <View style={styles.infoBox}>
              <Text style={styles.infoIcon}>ℹ️</Text>
              <Text style={styles.infoText}>
                Ao criar uma conta, você terá acesso às funcionalidades de usuário.
              </Text>
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
  // Card principal
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
  // Header
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
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
    fontSize: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  // Error box
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
    fontSize: 13,
    color: '#DC2626',
    marginRight: 8,
  },
  errorClose: {
    fontSize: 18,
    color: '#DC2626',
    fontWeight: '600',
    padding: 4,
  },
  // Form
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
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
  inputError: {
    borderColor: '#F87171',
    backgroundColor: '#FEF2F2',
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    paddingVertical: 12,
  },
  // Button
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
    fontSize: 16,
    fontWeight: '700',
  },
  // Back button
  backButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  backButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  // Info box
  infoBox: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  infoIcon: {
    fontSize: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
});
