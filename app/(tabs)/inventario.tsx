import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal,
  TextInput, Alert, Platform, KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useApp, Product } from '@/context/AppContext';
import { formatLempira } from '@/utils/format';
import BackgroundImage from '@/components/BackgroundImage';
import SectionHeader from '@/components/SectionHeader';

export default function InventarioScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { products, addProduct, updateProduct, deleteProduct, getInventarioTotal } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState('Servicios');

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const openAdd = () => { setEditing(null); setName(''); setPrice(''); setQuantity(''); setCategory('Servicios'); setModalVisible(true); };
  const openEdit = (p: Product) => { setEditing(p); setName(p.name); setPrice(p.price.toString()); setQuantity(p.quantity.toString()); setCategory(p.category); setModalVisible(true); };

  const handleSave = () => {
    if (!name || !price) return;
    const data = { name, price: parseFloat(price), quantity: parseInt(quantity) || 0, category };
    if (editing) updateProduct(editing.id, data);
    else addProduct(data);
    setModalVisible(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Eliminar', '¿Eliminar este producto?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => deleteProduct(id) },
    ]);
  };

  const grouped = products.reduce<Record<string, Product[]>>((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {});

  const s = makeStyles(colors);

  return (
    <BackgroundImage>
      <View style={{ flex: 1, paddingTop: topPad + 10 }}>
        <View style={s.header}>
          <SectionHeader title="Inventario" subtitle={`Total: ${formatLempira(getInventarioTotal())}`} />
          <TouchableOpacity style={[s.addBtn, { backgroundColor: colors.gold }]} onPress={openAdd}>
            <Feather name="plus" size={18} color={colors.background} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          {Object.entries(grouped).map(([cat, items]) => (
            <View key={cat}>
              <Text style={s.catTitle}>{cat}</Text>
              {items.map(p => {
                const val = p.price * p.quantity;
                return (
                  <View key={p.id} style={s.productRow}>
                    <View style={[s.productIcon, { backgroundColor: colors.gold + '22' }]}>
                      <Feather name={cat === 'Servicios' ? 'scissors' : 'package'} size={16} color={colors.gold} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.productName}>{p.name}</Text>
                      <Text style={s.productMeta}>{formatLempira(p.price)} x {p.quantity} unid.</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={[s.productVal, { color: colors.positive }]}>{formatLempira(val)}</Text>
                      <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                        <TouchableOpacity onPress={() => openEdit(p)}>
                          <Feather name="edit-2" size={14} color={colors.gold} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDelete(p.id)}>
                          <Feather name="trash-2" size={14} color={colors.negative} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          ))}
        </ScrollView>
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView style={s.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={s.modal}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>{editing ? 'Editar Producto' : 'Nuevo Producto'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={22} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
            <Text style={s.label}>Nombre</Text>
            <TextInput style={s.input} value={name} onChangeText={setName} placeholder="Nombre del producto" placeholderTextColor={colors.mutedForeground} />
            <Text style={s.label}>Precio (L)</Text>
            <TextInput style={s.input} value={price} onChangeText={setPrice} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor={colors.mutedForeground} />
            <Text style={s.label}>Cantidad</Text>
            <TextInput style={s.input} value={quantity} onChangeText={setQuantity} keyboardType="numeric" placeholder="0" placeholderTextColor={colors.mutedForeground} />
            <Text style={s.label}>Categoría</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
              {['Servicios', 'Productos'].map(c => (
                <TouchableOpacity key={c} style={[s.catBtn, category === c && { backgroundColor: colors.gold + '33', borderColor: colors.gold }]} onPress={() => setCategory(c)}>
                  <Text style={[s.catBtnTxt, { color: category === c ? colors.gold : colors.mutedForeground }]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={[s.saveBtn, { backgroundColor: colors.gold }]} onPress={handleSave}>
              <Text style={[s.saveTxt, { color: colors.background }]}>Guardar</Text>
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
  catTitle: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: colors.gold, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginTop: 12 },
  productRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: 'rgba(20,10,5,0.8)', marginBottom: 8 },
  productIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  productName: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.foreground },
  productMeta: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.mutedForeground, marginTop: 2 },
  productVal: { fontFamily: 'Inter_700Bold', fontSize: 14 },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modal: { backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: colors.foreground },
  label: { fontSize: 12, fontFamily: 'Inter_500Medium', color: colors.mutedForeground, marginBottom: 6, marginTop: 12, textTransform: 'uppercase' },
  input: { backgroundColor: colors.muted, borderRadius: 10, padding: 12, color: colors.foreground, fontFamily: 'Inter_400Regular', fontSize: 15, borderWidth: 1, borderColor: colors.border },
  catBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  catBtnTxt: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  saveBtn: { padding: 16, borderRadius: 14, alignItems: 'center' },
  saveTxt: { fontFamily: 'Inter_700Bold', fontSize: 15 },
});
