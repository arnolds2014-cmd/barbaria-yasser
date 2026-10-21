import React, { useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useApp, TransactionType } from '@/context/AppContext';
import { formatLempira } from '@/utils/format';

interface Props {
  visible: boolean;
  onClose: () => void;
  defaultType?: TransactionType;
}

const CATEGORIES_INGRESO = ['Servicios', 'Ventas', 'Otros Ingresos'];
const CATEGORIES_GASTO = ['Arriendo', 'Sueldos', 'Servicios Básicos', 'Insumos', 'Otros Gastos'];

export default function TransactionModal({ visible, onClose, defaultType = 'ingreso' }: Props) {
  const colors = useColors();
  const { addTransaction, accounts } = useApp();
  const [type, setType] = useState<TransactionType>(defaultType);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [account, setAccount] = useState('Caja General');
  const [category, setCategory] = useState('Servicios');

  const categories = type === 'ingreso' ? CATEGORIES_INGRESO : CATEGORIES_GASTO;

  const handleSave = () => {
    const amt = parseFloat(amount);
    if (!amt || !description) return;
    addTransaction({
      type,
      amount: amt,
      description,
      account,
      category,
      date: new Date().toISOString(),
    });
    setAmount('');
    setDescription('');
    onClose();
  };

  const s = makeStyles(colors);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView style={s.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={s.container}>
          <View style={s.header}>
            <Text style={s.title}>Nuevo Movimiento</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={22} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <View style={s.typeRow}>
            <TouchableOpacity
              style={[s.typeBtn, type === 'ingreso' && { backgroundColor: colors.positive + '22', borderColor: colors.positive }]}
              onPress={() => { setType('ingreso'); setCategory('Servicios'); }}
            >
              <Feather name="arrow-down-circle" size={16} color={type === 'ingreso' ? colors.positive : colors.mutedForeground} />
              <Text style={[s.typeTxt, { color: type === 'ingreso' ? colors.positive : colors.mutedForeground }]}>Ingreso</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.typeBtn, type === 'gasto' && { backgroundColor: colors.negative + '22', borderColor: colors.negative }]}
              onPress={() => { setType('gasto'); setCategory('Arriendo'); }}
            >
              <Feather name="arrow-up-circle" size={16} color={type === 'gasto' ? colors.negative : colors.mutedForeground} />
              <Text style={[s.typeTxt, { color: type === 'gasto' ? colors.negative : colors.mutedForeground }]}>Gasto</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={s.label}>Monto (L)</Text>
            <TextInput
              style={s.input}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={colors.mutedForeground}
            />

            <Text style={s.label}>Descripción</Text>
            <TextInput
              style={s.input}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe el movimiento..."
              placeholderTextColor={colors.mutedForeground}
            />

            <Text style={s.label}>Categoría</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.catRow}>
              {categories.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[s.catBtn, category === c && { backgroundColor: colors.gold + '33', borderColor: colors.gold }]}
                  onPress={() => setCategory(c)}
                >
                  <Text style={[s.catTxt, { color: category === c ? colors.gold : colors.mutedForeground }]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={s.label}>Cuenta</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.catRow}>
              {accounts.map(a => (
                <TouchableOpacity
                  key={a.id}
                  style={[s.catBtn, account === a.name && { backgroundColor: colors.primary + '33', borderColor: colors.primary }]}
                  onPress={() => setAccount(a.name)}
                >
                  <Text style={[s.catTxt, { color: account === a.name ? colors.primaryForeground : colors.mutedForeground }]}>{a.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </ScrollView>

          <TouchableOpacity style={[s.saveBtn, { backgroundColor: type === 'ingreso' ? colors.positive : colors.negative }]} onPress={handleSave}>
            <Feather name="check" size={18} color="#fff" />
            <Text style={s.saveTxt}>Guardar Movimiento</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const makeStyles = (colors: ReturnType<typeof import('@/hooks/useColors').useColors>) => StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  container: { backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 18, fontFamily: 'Inter_700Bold', color: colors.foreground },
  typeRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  typeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: colors.border },
  typeTxt: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  label: { fontSize: 12, fontFamily: 'Inter_500Medium', color: colors.mutedForeground, marginBottom: 6, marginTop: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: colors.muted, borderRadius: 10, padding: 12, color: colors.foreground, fontFamily: 'Inter_400Regular', fontSize: 15, borderWidth: 1, borderColor: colors.border },
  catRow: { marginBottom: 4 },
  catBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: colors.border, marginRight: 8 },
  catTxt: { fontFamily: 'Inter_500Medium', fontSize: 13 },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, borderRadius: 14, marginTop: 20 },
  saveTxt: { color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 15 },
});
