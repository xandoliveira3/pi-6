import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import SideNav from '../components/SideNav';
import UsuariosScreen from './admin/UsuariosScreen';
import DashboardScreen from './admin/DashboardScreen';
import ConfigScreen from './admin/ConfigScreen';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

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
      <ScrollView 
        style={styles.contentWrapper}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {renderScreen()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
  },
  contentWrapper: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: SCREEN_HEIGHT,
  },
});
