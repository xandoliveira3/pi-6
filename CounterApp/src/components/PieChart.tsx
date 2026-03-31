import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface PieChartProps {
  data: {
    label: string;
    value: number;
    color: string;
  }[];
  size?: number;
  showLegend?: boolean;
}

const PieChart: React.FC<PieChartProps> = ({
  data,
  size = 200,
  showLegend = true,
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  if (total === 0) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Text style={styles.emptyText}>Sem dados</Text>
      </View>
    );
  }

  // Calcula as circunferências para o gráfico de rosca
  const strokeWidth = 30;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let accumulatedOffset = 0;

  return (
    <View style={styles.container}>
      {/* Gráfico de rosca */}
      <Svg width={size} height={size}>
        {/* Círculo de fundo (cinza) */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Segmentos coloridos */}
        {data.map((item, index) => {
          const percentage = item.value / total;
          const strokeDasharray = `${percentage * circumference} ${circumference}`;
          const strokeDashoffset = -accumulatedOffset * circumference;
          
          accumulatedOffset += percentage;
          
          return (
            <Circle
              key={index}
              cx={center}
              cy={center}
              r={radius}
              stroke={item.color}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="butt"
            />
          );
        })}
        
        {/* Texto central */}
        <Text
          style={styles.centerText}
          x={center}
          y={center - 10}
          textAnchor="middle"
        >
          {total}
        </Text>
        <Text
          style={styles.centerTextLabel}
          x={center}
          y={center + 15}
          textAnchor="middle"
        >
          total
        </Text>
      </Svg>
      
      {/* Legenda */}
      {showLegend && (
        <View style={styles.legend}>
          {data.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View
                style={[
                  styles.legendColor,
                  { backgroundColor: item.color }
                ]}
              />
              <Text style={styles.legendLabel}>
                {item.label}: {item.value} ({((item.value / total) * 100).toFixed(1)}%)
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  centerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    position: 'absolute',
  },
  centerTextLabel: {
    fontSize: 14,
    color: '#6B7280',
    position: 'absolute',
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  legend: {
    marginTop: 16,
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 8,
  },
  legendLabel: {
    fontSize: 13,
    color: '#374151',
  },
});

export default PieChart;
