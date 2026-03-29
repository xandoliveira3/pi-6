import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import SideNav from '../components/SideNav';
import UsuariosScreen from './admin/UsuariosScreen';
import DashboardScreen from './admin/DashboardScreen';
import ConfigScreen from './admin/ConfigScreen';

interface AdminScreenProps {
  onLogout: () => void;
  zoomLevel?: number;
}

export default function AdminScreen({ onLogout, zoomLevel = 1 }: AdminScreenProps) {
  const [activeTab, setActiveTab] = useState('usuarios');

  function handleTabPress(tab: string) {
    if (tab === 'logout') {
      onLogout();
      return;
    }
    setActiveTab(tab);
  }

  function renderScreen() {
    switch (activeTab) {
      case 'usuarios':
        return <UsuariosScreen zoomLevel={zoomLevel} />;
      case 'dashboard':
        return <DashboardScreen zoomLevel={zoomLevel} />;
      case 'config':
        return <ConfigScreen onLogout={onLogout} zoomLevel={zoomLevel} />;
      default:
        return <UsuariosScreen zoomLevel={zoomLevel} />;
    }
  }

  return (
    <View style={styles.container}>
      <SideNav activeTab={activeTab} onTabPress={handleTabPress} />
      <View style={styles.content}>
        {renderScreen()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
  },
  content: {
    flex: 1,
  },
});
