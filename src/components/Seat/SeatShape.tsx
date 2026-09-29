import React from 'react';
import {StyleSheet, View} from 'react-native';

interface SeatShapeProps {
  color: string;
  width: number;
}

/** Small cinema-seat icon: rounded body + base line */
export function SeatShape({color, width}: SeatShapeProps) {
  return (
    <View style={styles.shape}>
      <View
        style={{
          width,
          height: width * 0.8,
          borderRadius: width * 0.22,
          backgroundColor: color,
        }}
      />
      <View
        style={{
          width: width * 0.7,
          height: Math.max(1, width * 0.14),
          borderRadius: 1,
          marginTop: width * 0.1,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  shape: {
    alignItems: 'center',
  },
});