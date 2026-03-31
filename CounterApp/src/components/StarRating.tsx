import React, { useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  size?: number;
  disabled?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating = 0,
  onRatingChange,
  size = 60,
  disabled = false,
}) => {
  const starRefs = useRef<(TouchableOpacity | null)[]>([]);

  const handleStarPress = (starIndex: number, event: any) => {
    if (disabled) return;

    const { nativeEvent } = event;
    const { locationX } = nativeEvent;
    const { width } = nativeEvent.target === starRefs.current[starIndex] ? 
      { width: size } : { width: size };

    // Determina se clicou na metade esquerda (0.5) ou direita (1.0) da estrela
    const isLeftHalf = locationX < width / 2;
    
    // Calcula o rating: estrelas completas anteriores + 0.5 ou 1.0
    const newRating = starIndex + (isLeftHalf ? 0.5 : 1);
    
    onRatingChange(newRating);
  };

  return (
    <View style={styles.container}>
      <View style={styles.starsRow}>
        {[0, 1, 2, 3, 4].map((starIndex) => {
          const fullStars = Math.floor(rating);
          const hasHalfStar = rating % 1 >= 0.5;
          
          // Esta estrela está completamente ativa?
          const isFullActive = starIndex < fullStars;
          // Esta é a estrela meia ativa?
          const isHalfActive = starIndex === fullStars && hasHalfStar;
          
          return (
            <TouchableOpacity
              key={starIndex}
              ref={(ref) => (starRefs.current[starIndex] = ref)}
              style={[
                styles.starButton,
                { width: size, height: size },
                disabled && styles.starButtonDisabled
              ]}
              onPress={(event) => handleStarPress(starIndex, event)}
              disabled={disabled}
              activeOpacity={0.7}
            >
              <View style={styles.starContainer}>
                {/* Estrela de fundo (cinza) */}
                <Text
                  style={[
                    styles.starText,
                    { fontSize: size, color: '#CCCCCC' }
                  ]}
                >
                  ★
                </Text>
                {/* Estrela ativa (amarela) - overlay */}
                {isFullActive && (
                  <Text
                    style={[
                      styles.starText,
                      styles.starActive,
                      { fontSize: size, position: 'absolute' }
                    ]}
                  >
                    ★
                  </Text>
                )}
                {isHalfActive && (
                  <View style={[
                    styles.halfStarOverlay,
                    { width: size / 2 }
                  ]}>
                    <Text
                      style={[
                        styles.starText,
                        styles.starActive,
                        { fontSize: size }
                      ]}
                    >
                      ★
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={styles.ratingValue}>
        {rating > 0 ? `${rating} / 5` : 'Selecione'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  starButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  starButtonDisabled: {
    opacity: 0.5,
  },
  starContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  starText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  starActive: {
    color: '#FFD700',
  },
  halfStarOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingValue: {
    marginTop: 12,
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
  },
});

export default StarRating;
