import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { formatLempira, formatDate } from '@/utils/format';
import BackgroundImage from '@/components/BackgroundImage';
import TransactionModal from '@/components/TransactionModal';
import { TransactionType } from '@/context/AppContext';

export default function InicioScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { getTotalIngresos, getTotalGastos, getSaldoCaja, transactions } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<TransactionType>('ingreso');

  const saldo = getSaldoCaja();
  const ingresos = getTotalIngresos();
  const gastos = getTotalGastos();
  const recent = transactions.slice(0, 10);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : 0;

  return (
    <BackgroundImage>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: topPad + 10, paddingBottom: bottomPad + 100, paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoRow}>
          <Image source={require('../../assets/images/icon.png')} style={styles.logo} />
          <View>
            <Text style={[styles.businessName, { color: colors.gold }]}>Barbería Yasser</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Sistema Contable</Text>
          </View>
        </View>

        <View style={[styles.saldoCard, { backgroundColor: 'rgba(20,10,5,0.88)', borderColor: colors.gold + '55' }]}>
          <Text style={[styles.saldoLabel, { color: colors.mutedForeground }]}>SALDO REAL EN CAJA</Text>
          <Text style={[styles.saldoAmount, { color: saldo >= 0 ? colors.positive : colors.negative }]}>
            {formatLempira(saldo)}
          </Text>
          <View style={styles.saldoRow}>
            <View style={styles.saldoItem}>
              <Feather name="arrow-down-circle" size={14} color={colors.positive} />
              <Text style={[styles.saldoItemLabel, { color: colors.mutedForeground }]}>Ingresos</Text>
              <Text style={[styles.saldoItemAmt, { color: colors.positive }]}>{formatLempira(ingresos)}</Text>
            </View>
            <View style={[styles.saldoDivider, { backgroundColor: colors.border }]} />
            <View style={styles.saldoItem}>
              <Feather name="arrow-up-circle" size={14} color={colors.negative} />
              <Text style={[styles.saldoItemLabel, { color: colors.mutedForeground }]}>Gastos</Text>
              <Text style={[styles.saldoItemAmt, { color: colors.negative }]}>{formatLempira(gastos)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.btnRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.positive + '22', borderColor: colors.positive }]}
            onPress={() => { setModalType('ingreso'); setModalVisible(true); }}
          >
            <Feather name="plus-circle" size={20} color={colors.positive} />
            <Text style={[styles.actionTxt, { color: colors.positive }]}>Ingreso</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.negative + '22', borderColor: colors.negative }]}
            onPress={() => { setModalType('gasto'); setModalVisible(true); }}
          >
            <Feather name="minus-circle" size={20} color={colors.negative} />
            <Text style={[styles.actionTxt, { color: colors.negative }]}>Gasto</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.gold }]}>Movimientos Recientes</Text>

        {recent.length === 0 ? (
          <View style={[styles.empty, { borderColor: colors.border }]}>
            <Feather name="inbox" size={32} color={colors.mutedForeground} />
            <Text style={[styles.emptyTxt, { color: colors.mutedForeground }]}>No hay movimientos aun</Text>
          </View>
        ) : (
          recent.map(tx => (
            <View key={tx.id} style={[styles.txRow, { backgroundColor: 'rgba(20,10,5,0.8)', borderColor: colors.border }]}>
              <View style={[styles.txIcon, { backgroundColor: tx.type === 'ingreso' ? colors.positive + '22' : colors.negative + '22' }]}>
                <Feather name={tx.type === 'ingreso' ? 'arrow-down' : 'arrow-up'} size={14} color={tx.type === 'ingreso' ? colors.positive : colors.negative} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.txDesc, { color: colors.foreground }]}>{tx.description}</Text>
                <Text style={[styles.txMeta, { color: colors.mutedForeground }]}>{tx.category} • {formatDate(tx.date)}</Text>
              </View>
              <Text style={[styles.txAmt, { color: tx.type === 'ingreso' ? colors.positive : colors.negative }]}>
                {tx.type === 'ingreso' ? '+' : '-'}{formatLempira(tx.amount)}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
      <TransactionModal visible={modalVisible} onClose={() => setModalVisible(false)} defaultType={modalType} />
    </BackgroundImage>
  );
}

const styles = StyleSheet.create({
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 },
  logo: { width: 52, height: 52, borderRadius: 26 },
  businessName: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  subtitle: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  saldoCard: { borderRadius: 18, padding: 20, borderWidth: 1, marginBottom: 16 },
  saldoLabel: { fontSize: 11, fontFamily: 'Inter_500Medium', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  saldoAmount: { fontSize: 36, fontFamily: 'Inter_700Bold', marginBottom: 16 },
  saldoRow: { flexDirection: 'row', alignItems: 'center' },
  saldoItem: { flex: 1, alignItems: 'center', gap: 2 },
  saldoItemLabel: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  saldoItemAmt: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  saldoDivider: { width: 1, height: 32, marginHorizontal: 10 },
  btnRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14, borderWidth: 1 },
  actionTxt: { fontFamily: 'Inter_700Bold', fontSize: 15 },
  sectionTitle: { fontSize: 15, fontFamily: 'Inter_700Bold', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  empty: { alignItems: 'center', justifyContent: 'center', gap: 8, padding: 30, borderRadius: 14, borderWidth: 1, borderStyle: 'dashed' },
  emptyTxt: { fontFamily: 'Inter_400Regular', fontSize: 14 },
  txRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  txIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  txDesc: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  txMeta: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 2 },
  txAmt: { fontFamily: 'Inter_700Bold', fontSize: 14 },
});
