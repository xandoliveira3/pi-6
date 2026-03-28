import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { login } from '../services/authService';

interface LoginScreenProps {
  onLoginSuccess: (tipoUsuario: 'admin' | 'usuario') => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  console.log('[LoginScreen] Renderizando... email:', email || '(vazio)');

  async function handleLogin() {
    console.log('[LoginScreen] handleLogin chamado');
    console.log('[LoginScreen] Email:', email);
    console.log('[LoginScreen] Senha:', senha ? '***' : '(vazia)');
    
    if (!email || !senha) {
      console.log('[LoginScreen] ❌ Email ou senha vazios');
      Alert.alert('Erro', 'Preencha email e senha.');
      return;
    }

    setLoading(true);
    console.log('[LoginScreen] Loading = true');

    try {
      console.log('[LoginScreen] Chamando authService.login...');
      const result = await login(email.trim(), senha);
      console.log('[LoginScreen] Resultado do login:', result);

      if (result.success && result.usuario) {
        console.log('[LoginScreen] ✅ Login bem-sucedido! Tipo:', result.usuario.tipo_usuario);
        onLoginSuccess(result.usuario.tipo_usuario);
      } else {
        console.log('[LoginScreen] ❌ Login falhou:', result.error);
        Alert.alert('Erro', result.error);
      }
    } catch (error: any) {
      console.log('[LoginScreen] ❌ Exceção no login:', error);
      Alert.alert('Erro', 'Erro ao fazer login. Tente novamente.');
    } finally {
      console.log('[LoginScreen] Loading = false');
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Reconhecimento Facial</Text>
          <Text style={styles.subtitle}>Faça login para continuar</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="seu@email.com"
              value={email}
              onChangeText={(text) => {
                console.log('[LoginScreen] Email mudado para:', text);
                setEmail(text);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••"
              value={senha}
              onChangeText={(text) => {
                console.log('[LoginScreen] Senha mudada para:', text ? '***' : '(vazia)');
                setSenha(text);
              }}
              secureTextEntry
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Entrar</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Admin: admin@exemplo.com / admin123
          </Text>
          <Text style={styles.footerText}>
            User: user1@exemplo.com / 123456
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});
