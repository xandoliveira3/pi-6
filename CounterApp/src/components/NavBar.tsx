import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';

interface NavBarProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
}

export default function NavBar({ activeTab, onTabPress }: NavBarProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'usuarios' && styles.tabActive]}
        onPress={() => onTabPress('usuarios')}
        activeOpacity={0.8}
      >
        <Text style={[styles.tabIcon, activeTab === 'usuarios' && styles.tabIconActive]}>
          👥
        </Text>
        <Text style={[styles.tabLabel, activeTab === 'usuarios' && styles.tabLabelActive]}>
          Usuários
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === 'dashboard' && styles.tabActive]}
        onPress={() => onTabPress('dashboard')}
        activeOpacity={0.8}
      >
        <Text style={[styles.tabIcon, activeTab === 'dashboard' && styles.tabIconActive]}>
          📊
        </Text>
        <Text style={[styles.tabLabel, activeTab === 'dashboard' && styles.tabLabelActive]}>
          Dashboard
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === 'config' && styles.tabActive]}
        onPress={() => onTabPress('config')}
        activeOpacity={0.8}
      >
        <Text style={[styles.tabIcon, activeTab === 'config' && styles.tabIconActive]}>
          ⚙️
        </Text>
        <Text style={[styles.tabLabel, activeTab === 'config' && styles.tabLabelActive]}>
          Config
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === 'logout' && styles.tabActive]}
        onPress={() => onTabPress('logout')}
        activeOpacity={0.8}
      >
        <Text style={[styles.tabIcon, activeTab === 'logout' && styles.tabIconActive]}>
          🚪
        </Text>
        <Text style={[styles.tabLabel, activeTab === 'logout' && styles.tabLabelActive]}>
          Sair
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    paddingTop: 12,
    paddingBottom: 8,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#667eea',
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  tabLabelActive: {
    color: '#fff',
    fontWeight: '600',
  },
});
