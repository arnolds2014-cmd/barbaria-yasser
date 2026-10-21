import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { formatLempira } from '@/utils/format';

interface CurrencyCardProps {
  label: string;
  amount: number;
  colorOverride?: string;
  subtitle?: string;
}

export default function CurrencyCard({ label, amount, colorOverride, subtitle }: CurrencyCardProps) {
  const colors = useColors();
  const isNeg = amount < 0;
  const amtColor = colorOverride || (isNeg ? colors.negative : colors.positive);

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.amount, { color: amtColor }]}>{formatLempira(amount)}</Text>
      {subtitle && <Text style={[styles.sub, { color: colors.mutedForeground }]}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  amount: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
  },
  sub: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
});
