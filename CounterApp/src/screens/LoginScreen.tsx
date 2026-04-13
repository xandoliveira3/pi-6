import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { login } from '../services/authService';

interface LoginScreenProps {
  onLoginSuccess: (tipoUsuario: 'admin' | 'usuario') => void;
  onGoToRegister: () => void;
  onGoToFaceLogin?: () => void;
  zoomLevel?: number;
}

export default function LoginScreen({ onLoginSuccess, onGoToRegister, onGoToFaceLogin, zoomLevel = 1 }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, setPendente] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const senhaInputRef = useRef<TextInput>(null);
  const scale = (base: number) => base * zoomLevel;

  async function handleLogin() {
    setErro(null);
    setPendente(false);
    
    if (!email || !senha) {
      setErro('Preencha email e senha.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErro('Digite um email válido.');
      return;
    }

    if (senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      const result = await login(email.trim(), senha);

      if (result.success && result.usuario) {
        onLoginSuccess(result.usuario.tipo_usuario);
      } else {
        setErro(result.error || 'Erro ao fazer login.');
        setPendente(result.pendente || false);
      }
    } catch (error: any) {
      setErro('Erro ao fazer login. Verifique sua conexão.');
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
        <View style={styles.scrollContent}>
          <View style={[styles.card, { transform: [{ scale: zoomLevel }] }]}>
            {/* Header */}
            <View style={styles.header}>
              <View style={[styles.logoContainer, { width: scale(70), height: scale(70), borderRadius: scale(35) }]}>
                <Text style={[styles.logoIcon, { fontSize: scale(32) }]}>🔐</Text>
              </View>
              <Text style={[styles.title, { fontSize: scale(24) }]}>Bem-vindo</Text>
              <Text style={[styles.subtitle, { fontSize: scale(14) }]}>Digite suas credenciais para acessar</Text>
            </View>

            {/* Mensagem de Erro */}
            {erro && (
              <View style={[styles.errorBox, pendente && styles.errorBoxPendente]}>
                <Text style={[styles.errorIcon, { fontSize: scale(18) }]}>{pendente ? '⏳' : '⚠️'}</Text>
                <Text style={[styles.errorText, { fontSize: scale(13) }]}>{erro}</Text>
                <TouchableOpacity onPress={() => setErro(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={[styles.errorClose, { fontSize: scale(18) }]}>✕</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Formulário */}
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { fontSize: scale(13) }]}>Email</Text>
                <View style={[styles.inputWrapper, erro && !email && styles.inputError]}>
                  <Text style={[styles.inputIcon, { fontSize: scale(18) }]}>📧</Text>
                  <TextInput
                    style={[styles.input, { fontSize: scale(15), paddingVertical: scale(12) }]}
                    placeholder="seu@email.com"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (erro) {
                        setErro(null);
                        setPendente(false);
                      }
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                    returnKeyType="next"
                    onSubmitEditing={() => {
                      senhaInputRef.current?.focus();
                    }}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { fontSize: scale(13) }]}>Senha</Text>
                <View style={[styles.inputWrapper, erro && !senha && styles.inputError]}>
                  <TouchableOpacity
                    onPress={() => setMostrarSenha(!mostrarSenha)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.eyeIcon, { fontSize: scale(18) }]}>
                      {mostrarSenha ? '👁️' : '🙈'}
                    </Text>
                  </TouchableOpacity>
                  <Text style={[styles.inputIcon, { fontSize: scale(18) }]}>🔑</Text>
                  <TextInput
                    ref={senhaInputRef}
                    style={[styles.input, { fontSize: scale(15), paddingVertical: scale(12) }]}
                    placeholder="••••••••"
                    placeholderTextColor="#9CA3AF"
                    value={senha}
                    onChangeText={(text) => {
                      setSenha(text);
                      if (erro) {
                        setErro(null);
                        setPendente(false);
                      }
                    }}
                    secureTextEntry={!mostrarSenha}
                    autoCapitalize="none"
                    editable={!loading}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={[styles.buttonText, { fontSize: scale(16) }]}>Entrar</Text>
                )}
              </TouchableOpacity>

              {/* Botão Login Facial */}
              {onGoToFaceLogin && (
                <TouchableOpacity
                  style={styles.faceLoginButton}
                  onPress={onGoToFaceLogin}
                  disabled={loading}
                >
                  <Text style={styles.faceLoginButtonText}>🧠 Login com Reconhecimento Facial</Text>
                </TouchableOpacity>
              )}

              {/* Botão Criar Conta */}
              <TouchableOpacity
                style={styles.registerButton}
                onPress={onGoToRegister}
                disabled={loading}
              >
                <Text style={[styles.registerButtonText, { fontSize: scale(14) }]}>Criar uma conta →</Text>
              </TouchableOpacity>
            </View>

            {/* Credenciais */}
            <View style={styles.credentials}>
              <Text style={[styles.credentialsTitle, { fontSize: scale(11) }]}>Teste:</Text>
              <View style={styles.badgeRow}>
                <View style={[styles.badge, styles.badgeAdmin]}>
                  <Text style={[styles.badgeLabel, { fontSize: scale(9) }]}>Admin</Text>
                  <Text style={[styles.badgeEmail, { fontSize: scale(12) }]}>admin@exemplo.com</Text>
                  <Text style={[styles.badgePass, { fontSize: scale(11) }]}>admin123</Text>
                </View>
                <View style={[styles.badge, styles.badgeUser]}>
                  <Text style={[styles.badgeLabel, { fontSize: scale(9) }]}>User</Text>
                  <Text style={[styles.badgeEmail, { fontSize: scale(12) }]}>user1@exemplo.com</Text>
                  <Text style={[styles.badgePass, { fontSize: scale(11) }]}>123456</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
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
    backgroundColor: '#667eea',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#667eea',
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
  errorBoxPendente: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  errorIcon: {
    marginRight: 8,
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
  inputError: {
    borderColor: '#F87171',
    backgroundColor: '#FEF2F2',
  },
  inputIcon: {
    marginRight: 10,
  },
  eyeIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: '#1F2937',
  },
  button: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#667eea',
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
  faceLoginButton: {
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
  faceLoginButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  registerButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  registerButtonText: {
    color: '#667eea',
    fontWeight: '600',
  },
  credentials: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  credentialsTitle: {
    fontWeight: '600',
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badgeRow: {
    gap: 10,
  },
  badge: {
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  badgeAdmin: {
    backgroundColor: '#F5F3FF',
    borderColor: '#DDD6FE',
  },
  badgeUser: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  badgeLabel: {
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 4,
  },
  badgeEmail: {
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  badgePass: {
    color: '#9CA3AF',
  },
});
