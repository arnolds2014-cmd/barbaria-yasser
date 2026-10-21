import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal,
  TextInput, Alert, Platform, KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useApp, Account, AccountType } from '@/context/AppContext';
import { formatLempira } from '@/utils/format';
import BackgroundImage from '@/components/BackgroundImage';
import SectionHeader from '@/components/SectionHeader';

const ACCOUNT_TYPES: AccountType[] = ['activo', 'pasivo', 'patrimonio', 'ingreso', 'gasto'];
const TYPE_COLORS: Record<AccountType, string> = {
  activo: '#22c55e',
  pasivo: '#ef4444',
  patrimonio: '#C9A84C',
  ingreso: '#3b82f6',
  gasto: '#f97316',
};

export default function CuentasScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { accounts, addAccount, updateAccount, deleteAccount } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<AccountType>('activo');
  const [balance, setBalance] = useState('');
  const [filter, setFilter] = useState<AccountType | 'all'>('all');

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const openAdd = () => { setEditing(null); setName(''); setCode(''); setType('activo'); setBalance(''); setModalVisible(true); };
  const openEdit = (a: Account) => { setEditing(a); setName(a.name); setCode(a.code); setType(a.type); setBalance(a.balance.toString()); setModalVisible(true); };

  const handleSave = () => {
    if (!name || !code) return;
    const data = { name, code, type, balance: parseFloat(balance) || 0 };
    if (editing) updateAccount(editing.id, data);
    else addAccount(data);
    setModalVisible(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Eliminar', '¿Eliminar esta cuenta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => deleteAccount(id) },
    ]);
  };

  const filtered = filter === 'all' ? accounts : accounts.filter(a => a.type === filter);
  const grouped = ACCOUNT_TYPES.reduce<Record<AccountType, Account[]>>((acc, t) => {
    acc[t] = filtered.filter(a => a.type === t);
    return acc;
  }, { activo: [], pasivo: [], patrimonio: [], ingreso: [], gasto: [] });

  const s = makeStyles(colors);

  return (
    <BackgroundImage>
      <View style={{ flex: 1, paddingTop: topPad + 10 }}>
        <View style={s.header}>
          <SectionHeader title="Plan de Cuentas" subtitle={`${accounts.length} cuentas`} />
          <TouchableOpacity style={[s.addBtn, { backgroundColor: colors.gold }]} onPress={openAdd}>
            <Feather name="plus" size={18} color={colors.background} />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8 }}>
          {[{ key: 'all', label: 'Todas' }, ...ACCOUNT_TYPES.map(t => ({ key: t, label: t.charAt(0).toUpperCase() + t.slice(1) }))].map(f => (
            <TouchableOpacity
              key={f.key}
              style={[s.filterBtn, filter === f.key && { backgroundColor: colors.gold + '22', borderColor: colors.gold }]}
              onPress={() => setFilter(f.key as AccountType | 'all')}
            >
              <Text style={[s.filterTxt, { color: filter === f.key ? colors.gold : colors.mutedForeground }]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          {ACCOUNT_TYPES.map(t => {
            const items = grouped[t];
            if (items.length === 0) return null;
            const total = items.reduce((s, a) => s + a.balance, 0);
            const color = TYPE_COLORS[t];
            return (
              <View key={t}>
                <View style={s.typHeader}>
                  <Text style={[s.typeLabel, { color }]}>{t.toUpperCase()}</Text>
                  <Text style={[s.typeTotal, { color }]}>{formatLempira(total)}</Text>
                </View>
                {items.map(acc => (
                  <View key={acc.id} style={s.accRow}>
                    <View style={[s.codeBadge, { backgroundColor: color + '22', borderColor: color + '55' }]}>
                      <Text style={[s.codeText, { color }]}>{acc.code}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.accName}>{acc.name}</Text>
                    </View>
                    <Text style={[s.accBalance, { color: acc.balance >= 0 ? colors.foreground : colors.negative }]}>{formatLempira(acc.balance)}</Text>
                    <View style={{ flexDirection: 'row', gap: 12, marginLeft: 10 }}>
                      <TouchableOpacity onPress={() => openEdit(acc)}>
                        <Feather name="edit-2" size={14} color={colors.gold} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDelete(acc.id)}>
                        <Feather name="trash-2" size={14} color={colors.negative} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            );
          })}
        </ScrollView>
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView style={s.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={s.modal}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>{editing ? 'Editar Cuenta' : 'Nueva Cuenta'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={22} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
            <Text style={s.label}>Código</Text>
            <TextInput style={s.input} value={code} onChangeText={setCode} placeholder="Ej: 1101" placeholderTextColor={colors.mutedForeground} keyboardType="numeric" />
            <Text style={s.label}>Nombre de la Cuenta</Text>
            <TextInput style={s.input} value={name} onChangeText={setName} placeholder="Nombre de la cuenta" placeholderTextColor={colors.mutedForeground} />
            <Text style={s.label}>Tipo</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
              {ACCOUNT_TYPES.map(t => (
                <TouchableOpacity
                  key={t}
                  style={[s.typeBtn, type === t && { backgroundColor: TYPE_COLORS[t] + '22', borderColor: TYPE_COLORS[t] }]}
                  onPress={() => setType(t)}
                >
                  <Text style={[s.typeBtnTxt, { color: type === t ? TYPE_COLORS[t] : colors.mutedForeground }]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={s.label}>Saldo Inicial (L)</Text>
            <TextInput style={s.input} value={balance} onChangeText={setBalance} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor={colors.mutedForeground} />
            <TouchableOpacity style={[s.saveBtn, { backgroundColor: colors.gold }]} onPress={handleSave}>
              <Text style={[s.saveTxt, { color: colors.background }]}>Guardar Cuenta</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </BackgroundImage>
  );
}

const makeStyles = (colors: ReturnType<typeof import('@/hooks/useColors').useColors>) => StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 4 },
  addBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  filterScroll: { flexGrow: 0 },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16, borderWidth: 1, borderColor: colors.border, marginRight: 8 },
  filterTxt: { fontFamily: 'Inter_500Medium', fontSize: 12 },
  typHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, marginBottom: 8 },
  typeLabel: { fontSize: 11, fontFamily: 'Inter_700Bold', letterSpacing: 1 },
  typeTotal: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  accRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: 'rgba(20,10,5,0.8)', marginBottom: 6 },
  codeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
  codeText: { fontFamily: 'Inter_700Bold', fontSize: 12 },
  accName: { fontFamily: 'Inter_500Medium', fontSize: 13, color: colors.foreground },
  accBalance: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modal: { backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: colors.foreground },
  label: { fontSize: 12, fontFamily: 'Inter_500Medium', color: colors.mutedForeground, marginBottom: 6, marginTop: 12, textTransform: 'uppercase' },
  input: { backgroundColor: colors.muted, borderRadius: 10, padding: 12, color: colors.foreground, fontFamily: 'Inter_400Regular', fontSize: 15, borderWidth: 1, borderColor: colors.border },
  typeBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: colors.border, marginRight: 8 },
  typeBtnTxt: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  saveBtn: { padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 20 },
  saveTxt: { fontFamily: 'Inter_700Bold', fontSize: 15 },
});
