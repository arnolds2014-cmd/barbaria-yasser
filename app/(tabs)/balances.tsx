import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { formatLempira, formatDate } from '@/utils/format';
import BackgroundImage from '@/components/BackgroundImage';

type BalanceTab = 'resultado' | 'general' | 'flujo' | 'patrimonio' | 'inventario';

export default function BalancesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { transactions, accounts, products, getTotalIngresos, getTotalGastos, getSaldoCaja, getInventarioTotal, getTotalActivos, getTotalPasivos, getTotalPatrimonio } = useApp();
  const [activeTab, setActiveTab] = useState<BalanceTab>('resultado');

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const ingresos = getTotalIngresos();
  const gastos = getTotalGastos();
  const utilidad = ingresos - gastos;
  const activos = getTotalActivos();
  const pasivos = getTotalPasivos();
  const patrimonio = getTotalPatrimonio() + utilidad;

  const tabs: { key: BalanceTab; label: string; icon: string }[] = [
    { key: 'resultado', label: 'Resultado', icon: 'trending-up' },
    { key: 'general', label: 'Balance Gral.', icon: 'layers' },
    { key: 'flujo', label: 'Flujo Caja', icon: 'activity' },
    { key: 'patrimonio', label: 'Patrimonio', icon: 'shield' },
    { key: 'inventario', label: 'Inventario', icon: 'package' },
  ];

  const s = makeStyles(colors);

  const renderEstadoResultado = () => (
    <View>
      <Text style={s.balanceTitle}>Estado de Resultado</Text>
      <Text style={s.period}>Al {new Date().toLocaleDateString('es-HN')}</Text>

      <View style={s.section}>
        <Text style={s.sectionLabel}>INGRESOS</Text>
        {transactions.filter(t => t.type === 'ingreso').length === 0 ? (
          <Text style={s.noData}>Sin ingresos registrados</Text>
        ) : (
          <>
            {['Servicios', 'Ventas', 'Otros Ingresos'].map(cat => {
              const total = transactions.filter(t => t.type === 'ingreso' && t.category === cat).reduce((s, t) => s + t.amount, 0);
              if (total === 0) return null;
              return (
                <View key={cat} style={s.lineItem}>
                  <Text style={s.lineLabel}>{cat}</Text>
                  <Text style={[s.lineAmount, { color: colors.positive }]}>{formatLempira(total)}</Text>
                </View>
              );
            })}
            <View style={[s.totalLine, { borderColor: colors.positive }]}>
              <Text style={s.totalLabel}>Total Ingresos</Text>
              <Text style={[s.totalAmount, { color: colors.positive }]}>{formatLempira(ingresos)}</Text>
            </View>
          </>
        )}
      </View>

      <View style={s.section}>
        <Text style={s.sectionLabel}>GASTOS</Text>
        {transactions.filter(t => t.type === 'gasto').length === 0 ? (
          <Text style={s.noData}>Sin gastos registrados</Text>
        ) : (
          <>
            {['Arriendo', 'Sueldos', 'Servicios Básicos', 'Insumos', 'Otros Gastos'].map(cat => {
              const total = transactions.filter(t => t.type === 'gasto' && t.category === cat).reduce((s, t) => s + t.amount, 0);
              if (total === 0) return null;
              return (
                <View key={cat} style={s.lineItem}>
                  <Text style={s.lineLabel}>{cat}</Text>
                  <Text style={[s.lineAmount, { color: colors.negative }]}>{formatLempira(total)}</Text>
                </View>
              );
            })}
            <View style={[s.totalLine, { borderColor: colors.negative }]}>
              <Text style={s.totalLabel}>Total Gastos</Text>
              <Text style={[s.totalAmount, { color: colors.negative }]}>{formatLempira(gastos)}</Text>
            </View>
          </>
        )}
      </View>

      <View style={[s.utilidadCard, { backgroundColor: utilidad >= 0 ? colors.positive + '22' : colors.negative + '22', borderColor: utilidad >= 0 ? colors.positive : colors.negative }]}>
        <Text style={[s.utilidadLabel, { color: colors.mutedForeground }]}>{utilidad >= 0 ? 'UTILIDAD NETA' : 'PÉRDIDA NETA'}</Text>
        <Text style={[s.utilidadAmt, { color: utilidad >= 0 ? colors.positive : colors.negative }]}>{formatLempira(utilidad)}</Text>
      </View>
    </View>
  );

  const renderBalanceGeneral = () => (
    <View>
      <Text style={s.balanceTitle}>Balance General</Text>
      <Text style={s.period}>Al {new Date().toLocaleDateString('es-HN')}</Text>

      <View style={s.section}>
        <Text style={s.sectionLabel}>ACTIVOS</Text>
        {accounts.filter(a => a.type === 'activo').map(acc => (
          <View key={acc.id} style={s.lineItem}>
            <Text style={s.lineLabel}>{acc.code} - {acc.name}</Text>
            <Text style={[s.lineAmount, { color: colors.foreground }]}>{formatLempira(acc.balance)}</Text>
          </View>
        ))}
        <View style={s.totalLine}>
          <Text style={s.totalLabel}>Total Activos</Text>
          <Text style={[s.totalAmount, { color: colors.gold }]}>{formatLempira(activos)}</Text>
        </View>
      </View>

      <View style={s.section}>
        <Text style={s.sectionLabel}>PASIVOS</Text>
        {accounts.filter(a => a.type === 'pasivo').map(acc => (
          <View key={acc.id} style={s.lineItem}>
            <Text style={s.lineLabel}>{acc.code} - {acc.name}</Text>
            <Text style={[s.lineAmount, { color: colors.negative }]}>{formatLempira(acc.balance)}</Text>
          </View>
        ))}
        <View style={s.totalLine}>
          <Text style={s.totalLabel}>Total Pasivos</Text>
          <Text style={[s.totalAmount, { color: colors.negative }]}>{formatLempira(pasivos)}</Text>
        </View>
      </View>

      <View style={s.section}>
        <Text style={s.sectionLabel}>PATRIMONIO</Text>
        {accounts.filter(a => a.type === 'patrimonio').map(acc => (
          <View key={acc.id} style={s.lineItem}>
            <Text style={s.lineLabel}>{acc.code} - {acc.name}</Text>
            <Text style={[s.lineAmount, { color: colors.foreground }]}>{formatLempira(acc.balance)}</Text>
          </View>
        ))}
        <View style={s.lineItem}>
          <Text style={s.lineLabel}>Utilidad del Periodo</Text>
          <Text style={[s.lineAmount, { color: utilidad >= 0 ? colors.positive : colors.negative }]}>{formatLempira(utilidad)}</Text>
        </View>
        <View style={s.totalLine}>
          <Text style={s.totalLabel}>Total Patrimonio</Text>
          <Text style={[s.totalAmount, { color: colors.gold }]}>{formatLempira(patrimonio)}</Text>
        </View>
      </View>

      <View style={[s.utilidadCard, { backgroundColor: 'rgba(201,168,76,0.1)', borderColor: colors.gold }]}>
        <Text style={[s.utilidadLabel, { color: colors.mutedForeground }]}>PASIVO + PATRIMONIO</Text>
        <Text style={[s.utilidadAmt, { color: colors.gold }]}>{formatLempira(pasivos + patrimonio)}</Text>
        <Text style={[s.balanceCheck, { color: Math.abs(activos - (pasivos + patrimonio)) < 0.01 ? colors.positive : colors.negative }]}>
          {Math.abs(activos - (pasivos + patrimonio)) < 0.01 ? 'Balance cuadrado' : 'Balance descuadrado'}
        </Text>
      </View>
    </View>
  );

  const renderFlujoCaja = () => {
    const opIngresos = transactions.filter(t => t.type === 'ingreso');
    const opGastos = transactions.filter(t => t.type === 'gasto');
    const netOp = ingresos - gastos;
    return (
      <View>
        <Text style={s.balanceTitle}>Estado de Flujo de Efectivo</Text>
        <Text style={s.period}>Al {new Date().toLocaleDateString('es-HN')}</Text>
        <View style={s.section}>
          <Text style={s.sectionLabel}>ACTIVIDADES OPERACIONALES</Text>
          <View style={s.lineItem}>
            <Text style={s.lineLabel}>Cobros por servicios/ventas</Text>
            <Text style={[s.lineAmount, { color: colors.positive }]}>{formatLempira(ingresos)}</Text>
          </View>
          <View style={s.lineItem}>
            <Text style={s.lineLabel}>Pagos de gastos operativos</Text>
            <Text style={[s.lineAmount, { color: colors.negative }]}>({formatLempira(gastos)})</Text>
          </View>
          <View style={s.totalLine}>
            <Text style={s.totalLabel}>Flujo Neto Operacional</Text>
            <Text style={[s.totalAmount, { color: netOp >= 0 ? colors.positive : colors.negative }]}>{formatLempira(netOp)}</Text>
          </View>
        </View>
        <View style={s.section}>
          <Text style={s.sectionLabel}>ACTIVIDADES DE INVERSIÓN</Text>
          <Text style={s.noData}>Sin movimientos de inversión</Text>
        </View>
        <View style={s.section}>
          <Text style={s.sectionLabel}>ACTIVIDADES DE FINANCIAMIENTO</Text>
          <Text style={s.noData}>Sin movimientos de financiamiento</Text>
        </View>
        <View style={[s.utilidadCard, { backgroundColor: netOp >= 0 ? colors.positive + '22' : colors.negative + '22', borderColor: netOp >= 0 ? colors.positive : colors.negative }]}>
          <Text style={[s.utilidadLabel, { color: colors.mutedForeground }]}>FLUJO NETO TOTAL</Text>
          <Text style={[s.utilidadAmt, { color: netOp >= 0 ? colors.positive : colors.negative }]}>{formatLempira(netOp)}</Text>
        </View>
      </View>
    );
  };

  const renderPatrimonio = () => {
    const patAccounts = accounts.filter(a => a.type === 'patrimonio');
    const totalPat = patAccounts.reduce((s, a) => s + a.balance, 0);
    return (
      <View>
        <Text style={s.balanceTitle}>Estado de Cambios en el Patrimonio</Text>
        <Text style={s.period}>Al {new Date().toLocaleDateString('es-HN')}</Text>
        <View style={s.section}>
          <Text style={s.sectionLabel}>CUENTAS PATRIMONIALES</Text>
          {patAccounts.map(acc => (
            <View key={acc.id} style={s.lineItem}>
              <Text style={s.lineLabel}>{acc.name}</Text>
              <Text style={[s.lineAmount, { color: colors.foreground }]}>{formatLempira(acc.balance)}</Text>
            </View>
          ))}
        </View>
        <View style={s.section}>
          <Text style={s.sectionLabel}>RESULTADO DEL PERIODO</Text>
          <View style={s.lineItem}>
            <Text style={s.lineLabel}>Utilidad/Pérdida neta</Text>
            <Text style={[s.lineAmount, { color: utilidad >= 0 ? colors.positive : colors.negative }]}>{formatLempira(utilidad)}</Text>
          </View>
        </View>
        <View style={[s.utilidadCard, { backgroundColor: 'rgba(201,168,76,0.1)', borderColor: colors.gold }]}>
          <Text style={[s.utilidadLabel, { color: colors.mutedForeground }]}>TOTAL PATRIMONIO</Text>
          <Text style={[s.utilidadAmt, { color: colors.gold }]}>{formatLempira(totalPat + utilidad)}</Text>
        </View>
      </View>
    );
  };

  const renderInventarioBalance = () => {
    const total = getInventarioTotal();
    const grouped = products.reduce<Record<string, typeof products>>((acc, p) => {
      if (!acc[p.category]) acc[p.category] = [];
      acc[p.category].push(p);
      return acc;
    }, {});
    return (
      <View>
        <Text style={s.balanceTitle}>Balance de Inventario</Text>
        <Text style={s.period}>Al {new Date().toLocaleDateString('es-HN')}</Text>
        {Object.entries(grouped).map(([cat, items]) => (
          <View key={cat} style={s.section}>
            <Text style={s.sectionLabel}>{cat.toUpperCase()}</Text>
            {items.map(p => (
              <View key={p.id} style={s.lineItem}>
                <View style={{ flex: 1 }}>
                  <Text style={s.lineLabel}>{p.name}</Text>
                  <Text style={[s.lineSub, { color: colors.mutedForeground }]}>{p.quantity} unid. x {formatLempira(p.price)}</Text>
                </View>
                <Text style={[s.lineAmount, { color: colors.foreground }]}>{formatLempira(p.price * p.quantity)}</Text>
              </View>
            ))}
          </View>
        ))}
        <View style={[s.utilidadCard, { backgroundColor: 'rgba(201,168,76,0.1)', borderColor: colors.gold }]}>
          <Text style={[s.utilidadLabel, { color: colors.mutedForeground }]}>VALOR TOTAL INVENTARIO</Text>
          <Text style={[s.utilidadAmt, { color: colors.gold }]}>{formatLempira(total)}</Text>
        </View>
      </View>
    );
  };

  return (
    <BackgroundImage>
      <View style={{ flex: 1, paddingTop: topPad + 10 }}>
        <Text style={s.screenTitle}>Balances Financieros</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabScroll} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8 }}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[s.tabBtn, activeTab === tab.key && { backgroundColor: colors.gold + '22', borderColor: colors.gold }]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Feather name={tab.icon as any} size={14} color={activeTab === tab.key ? colors.gold : colors.mutedForeground} />
              <Text style={[s.tabTxt, { color: activeTab === tab.key ? colors.gold : colors.mutedForeground }]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          {activeTab === 'resultado' && renderEstadoResultado()}
          {activeTab === 'general' && renderBalanceGeneral()}
          {activeTab === 'flujo' && renderFlujoCaja()}
          {activeTab === 'patrimonio' && renderPatrimonio()}
          {activeTab === 'inventario' && renderInventarioBalance()}
        </ScrollView>
      </View>
    </BackgroundImage>
  );
}

const makeStyles = (colors: ReturnType<typeof import('@/hooks/useColors').useColors>) => StyleSheet.create({
  screenTitle: { fontSize: 20, fontFamily: 'Inter_700Bold', color: colors.gold, paddingHorizontal: 20, marginBottom: 10 },
  tabScroll: { flexGrow: 0 },
  tabBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.border, marginRight: 8 },
  tabTxt: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  balanceTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: colors.foreground, marginBottom: 2 },
  period: { fontSize: 12, fontFamily: 'Inter_400Regular', color: colors.mutedForeground, marginBottom: 16 },
  section: { backgroundColor: 'rgba(20,10,5,0.85)', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  sectionLabel: { fontSize: 11, fontFamily: 'Inter_700Bold', color: colors.gold, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  lineItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border + '55' },
  lineLabel: { fontSize: 13, fontFamily: 'Inter_400Regular', color: colors.foreground, flex: 1 },
  lineSub: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 2 },
  lineAmount: { fontSize: 13, fontFamily: 'Inter_600SemiBold', marginLeft: 8 },
  totalLine: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10, marginTop: 4, borderTopWidth: 1.5, borderColor: colors.border },
  totalLabel: { fontSize: 13, fontFamily: 'Inter_700Bold', color: colors.foreground },
  totalAmount: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  noData: { fontSize: 13, fontFamily: 'Inter_400Regular', color: colors.mutedForeground, fontStyle: 'italic' },
  utilidadCard: { borderRadius: 14, padding: 18, borderWidth: 1, marginTop: 4 },
  utilidadLabel: { fontSize: 11, fontFamily: 'Inter_500Medium', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  utilidadAmt: { fontSize: 28, fontFamily: 'Inter_700Bold' },
  balanceCheck: { fontSize: 12, fontFamily: 'Inter_500Medium', marginTop: 4 },
});
