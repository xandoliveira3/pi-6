import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface BarChartProps {
  data: {
    label: string;
    value: number;
    percentage: number;
  }[];
  maxValue?: number;
  height?: number;
  showValues?: boolean;
  showPercentages?: boolean;
}

const BarChart: React.FC<BarChartProps> = ({
  data,
  maxValue,
  height = 200,
  showValues = true,
  showPercentages = true,
}) => {
  // Calcula o valor máximo para escala (ou usa o maior valor dos dados)
  const max = maxValue || Math.max(...data.map(d => d.value), 1);
  
  // Cores para as barras (gradiente visual)
  const getBarColor = (index: number, total: number) => {
    const ratio = index / (total - 1 || 1);
    // Gradiente de azul para roxo
    const r = Math.round(102 + (123 - 102) * ratio);
    const g = Math.round(102 + (94 - 102) * ratio);
    const b = Math.round(218 + (238 - 218) * ratio);
    return `rgb(${r}, ${g}, ${b})`;
  };

  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.emptyText}>Sem dados para exibir</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }]}>
      {/* Barras */}
      <View style={styles.barsContainer}>
        {data.map((item, index) => {
          const barHeight = (item.value / max) * (height - 60);
          
          return (
            <View key={index} style={styles.barWrapper}>
              {/* Valor/porcentagem no topo */}
              {(showValues || showPercentages) && (
                <View style={styles.topLabel}>
                  {showValues && showPercentages && (
                    <Text style={styles.topLabelText}>
                      {item.value} ({item.percentage.toFixed(1)}%)
                    </Text>
                  )}
                  {showValues && !showPercentages && (
                    <Text style={styles.topLabelText}>{item.value}</Text>
                  )}
                  {!showValues && showPercentages && (
                    <Text style={styles.topLabelText}>
                      {item.percentage.toFixed(1)}%
                    </Text>
                  )}
                </View>
              )}
              
              {/* Barra */}
              <View style={styles.barBackground}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: Math.max(barHeight, 4), // Altura mínima para visibilidade
                      backgroundColor: getBarColor(index, data.length),
                    },
                  ]}
                />
              </View>
              
              {/* Label embaixo */}
              <Text style={styles.label} numberOfLines={2} adjustsFontSizeToFit>
                {item.label}
              </Text>
            </View>
          );
        })}
      </View>
      
      {/* Linha de base */}
      <View style={styles.baseLine} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 8,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    flex: 1,
    paddingHorizontal: 8,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 4,
    maxWidth: 80,
  },
  topLabel: {
    marginBottom: 8,
    alignItems: 'center',
  },
  topLabelText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1F2937',
  },
  barBackground: {
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
  },
  bar: {
    width: '100%',
    borderRadius: 4,
    minHeight: 4,
  },
  label: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  baseLine: {
    height: 2,
    backgroundColor: '#E5E7EB',
    marginTop: 8,
    borderRadius: 1,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default BarChart;
