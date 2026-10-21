import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';

interface BackgroundImageProps {
  children: React.ReactNode;
}

export default function BackgroundImage({ children }: BackgroundImageProps) {
  return (
    <ImageBackground
      source={require('../assets/images/barbershop-bg.png')}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.overlay}>{children}</View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
  },
});
