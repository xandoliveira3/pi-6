import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import SideNav from '../components/SideNav';
import UsuariosScreen from './admin/UsuariosScreen';
import DashboardScreen from './admin/DashboardScreen';
import ConfigScreen from './admin/ConfigScreen';

interface AdminScreenProps {
  onLogout: () => void;
}

export default function AdminScreen({ onLogout }: AdminScreenProps) {
  const [activeTab, setActiveTab] = useState('usuarios');
  const [zoomLevel, setZoomLevel] = useState(1);

  function handleTabPress(tab: string) {
    if (tab === 'logout') {
      onLogout();
      return;
    }
    setActiveTab(tab);
  }

  function handleZoomIn() {
    setZoomLevel(prev => Math.min(prev + 0.1, 1.5));
  }

  function handleZoomOut() {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.8));
  }

  function handleResetZoom() {
    setZoomLevel(1);
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
        {/* Barra de Zoom */}
        <View style={styles.zoomBar}>
          <Text style={styles.zoomLabel}>Acessibilidade:</Text>
          <TouchableOpacity
            style={[styles.zoomButton, zoomLevel <= 0.8 && styles.zoomButtonDisabled]}
            onPress={handleZoomOut}
            disabled={zoomLevel <= 0.8}
            activeOpacity={0.7}
          >
            <Text style={styles.zoomButtonText}>🔍</Text>
            <Text style={[styles.zoomButtonText, { fontSize: 12, marginLeft: 4 }]}>-</Text>
          </TouchableOpacity>
          
          <View style={styles.zoomIndicator}>
            <Text style={styles.zoomIcon}>👁️</Text>
            <Text style={styles.zoomValue}>{Math.round(zoomLevel * 100)}%</Text>
          </View>
          
          <TouchableOpacity
            style={[styles.zoomButton, zoomLevel >= 1.5 && styles.zoomButtonDisabled]}
            onPress={handleZoomIn}
            disabled={zoomLevel >= 1.5}
            activeOpacity={0.7}
          >
            <Text style={styles.zoomButtonText}>🔍</Text>
            <Text style={[styles.zoomButtonText, { fontSize: 12, marginLeft: 4 }]}>+</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.zoomResetButton}
            onPress={handleResetZoom}
            activeOpacity={0.7}
          >
            <Text style={styles.zoomResetText}>Reset</Text>
          </TouchableOpacity>
        </View>
        
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
  zoomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 12,
  },
  zoomLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  zoomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#667eea',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 4,
  },
  zoomButtonDisabled: {
    opacity: 0.4,
  },
  zoomButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  zoomIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 6,
  },
  zoomIcon: {
    fontSize: 14,
  },
  zoomValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    minWidth: 40,
    textAlign: 'center',
  },
  zoomResetButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  zoomResetText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
});
