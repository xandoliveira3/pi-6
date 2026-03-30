import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';

interface SideNavProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
}

export default function SideNav({ activeTab, onTabPress }: SideNavProps) {
  const menuItems = [
    { id: 'usuarios', icon: '👥', label: 'Usuários' },
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'config', icon: '⚙️', label: 'Config' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerIcon}>🔐</Text>
        <Text style={styles.headerTitle}>Admin</Text>
      </View>
      
      <View style={styles.menu}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.menuItem,
              activeTab === item.id && styles.menuItemActive
            ]}
            onPress={() => onTabPress(item.id)}
            activeOpacity={0.8}
          >
            <Text style={[styles.menuIcon, activeTab === item.id && styles.menuIconActive]}>
              {item.icon}
            </Text>
            <Text style={[styles.menuLabel, activeTab === item.id && styles.menuLabelActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => onTabPress('logout')}
        activeOpacity={0.8}
      >
        <Text style={styles.logoutIcon}>🚪</Text>
        <Text style={styles.logoutLabel}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 80,
    backgroundColor: '#1F2937',
    paddingTop: 16,
    paddingBottom: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
    marginBottom: 8,
  },
  headerIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  menu: {
    width: '100%',
    paddingBottom: 8,
  },
  menuItem: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginBottom: 4,
    borderRadius: 12,
    marginHorizontal: 8,
  },
  menuItemActive: {
    backgroundColor: '#374151',
  },
  menuIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  menuIconActive: {
    opacity: 1,
  },
  menuLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '500',
    textAlign: 'center',
  },
  menuLabelActive: {
    color: '#fff',
    fontWeight: '600',
  },
  logoutButton: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginHorizontal: 8,
    marginTop: 8,
  },
  logoutIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  logoutLabel: {
    fontSize: 10,
    color: '#EF4444',
    fontWeight: '600',
    textAlign: 'center',
  },
});
