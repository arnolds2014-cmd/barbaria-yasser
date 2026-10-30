import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal,
  TextInput, Alert, Platform, KeyboardAvoidingView, FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useApp, Product } from '@/context/AppContext';
import { formatLempira, formatDateTime } from '@/utils/format';
import BackgroundImage from '@/components/BackgroundImage';

type POSView = 'main' | 'venta' | 'gasto' | 'arqueo' | 'historial';

interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

export default function POSScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { products, currentSession, openCashSession, closeCashSession, addPOSSale, addPOSExpense, cashSessions } = useApp();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [view, setView] = useState<POSView>('main');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [openingAmt, setOpeningAmt] = useState('');
  const [closingAmt, setClosingAmt] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [closeModal, setCloseModal] = useState(false);
  const [gastoDesc, setGastoDesc] = useState('');
  const [gastoAmt, setGastoAmt] = useState('');
  const [gastocat, setGastoCat] = useState('Compra');

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const modalBottomPadding = Platform.OS === 'web'
    ? 0
    : Platform.OS === 'android'
      ? Math.max(insets.bottom, 48)
      : insets.bottom;

  const addToCart = (p: Product) => {
    setCart(prev => {
      const existing = prev.find(c => c.productId === p.id);
      if (existing) return prev.map(c => c.productId === p.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { productId: p.id, productName: p.name, price: p.price, quantity: 1 }];
    });
  };

  const addProductByBarcode = (barcode: string) => {
    const code = barcode.trim();
    if (!code) return;
    const product = products.find(p => p.barcode?.trim() === code);
    if (!product) {
      Alert.alert('Producto no encontrado', 'Agrega este código de barras al producto desde Inventario.');
      return;
    }
    addToCart(product);
    setManualBarcode('');
  };

  const startScanner = async () => {
    if (!cameraPermission?.granted) {
      const permission = await requestCameraPermission();
      if (!permission.granted) {
        Alert.alert('Permiso de cámara', 'Permite el acceso a la cámara para escanear códigos de barras.');
        return;
      }
    }
    setScannerVisible(true);
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(c => c.productId !== id));
  const cartTotal = cart.reduce((s, c) => s + c.price * c.quantity, 0);
  const sessionSalesTotal = currentSession?.sales.reduce((s, sale) => s + sale.total, 0) ?? 0;
  const sessionExpensesTotal = currentSession?.expenses.reduce((s, e) => s + e.amount, 0) ?? 0;
  const sessionCash = (currentSession?.openingBalance ?? 0) + sessionSalesTotal - sessionExpensesTotal;

  const handleSale = () => {
    if (cart.length === 0) return;
    addPOSSale({ items: cart, total: cartTotal, date: new Date().toISOString(), paymentMethod: 'Efectivo' });
    setCart([]);
    Alert.alert('Venta registrada', `Total: ${formatLempira(cartTotal)}`);
  };

  const handleGasto = () => {
    if (!gastoDesc || !gastoAmt) return;
    addPOSExpense({ description: gastoDesc, amount: parseFloat(gastoAmt), date: new Date().toISOString(), category: gastocat });
    setGastoDesc(''); setGastoAmt('');
    setView('main');
    Alert.alert('Gasto registrado');
  };

  const handleOpen = () => {
    const amt = parseFloat(openingAmt);
    if (isNaN(amt)) return;
    openCashSession(amt);
    setOpenModal(false);
    setOpeningAmt('');
  };

  const handleClose = () => {
    const amt = parseFloat(closingAmt);
    if (isNaN(amt)) return;
    closeCashSession(amt);
    setCloseModal(false);
    setClosingAmt('');
  };

  const s = makeStyles(colors);

  if (!currentSession) {
    return (
      <BackgroundImage>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 }}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Feather name="arrow-left" size={20} color={colors.gold} />
          </TouchableOpacity>
          <View style={[s.closedCard, { borderColor: colors.border }]}>
            <Feather name="lock" size={48} color={colors.gold} />
            <Text style={[s.closedTitle, { color: colors.gold }]}>Caja Cerrada</Text>
            <Text style={[s.closedSub, { color: colors.mutedForeground }]}>Abre la caja para comenzar a registrar ventas</Text>
            <TouchableOpacity style={[s.openBtn, { backgroundColor: colors.positive }]} onPress={() => setOpenModal(true)}>
              <Feather name="unlock" size={18} color="#fff" />
              <Text style={s.openBtnTxt}>Apertura de Caja</Text>
            </TouchableOpacity>
            {cashSessions.length > 0 && (
              <TouchableOpacity style={[s.histBtn, { borderColor: colors.border }]} onPress={() => setView('historial')}>
                <Text style={[s.histBtnTxt, { color: colors.mutedForeground }]}>Ver historial de cajas</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Modal visible={openModal} animationType="slide" transparent>
          <KeyboardAvoidingView
            style={[s.overlay, s.openCashOverlay]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={[s.modal, s.openCashModal]}>
              <Text style={s.modalTitle}>Apertura de Caja</Text>
              <Text style={s.label}>Monto de Apertura (L)</Text>
              <TextInput style={s.input} value={openingAmt} onChangeText={setOpeningAmt} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor={colors.mutedForeground} />
              <TouchableOpacity style={[s.modalBtn, s.openCashButton, { backgroundColor: colors.positive }]} onPress={handleOpen}>
                <Text style={s.modalBtnTxt}>Abrir Caja</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {view === 'historial' && (
          <Modal visible animationType="slide" transparent>
            <View style={[s.overlay, { justifyContent: 'flex-end', paddingBottom: modalBottomPadding }]}>
              <View style={[s.modal, { maxHeight: '80%' }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                  <Text style={s.modalTitle}>Historial de Cajas</Text>
                  <TouchableOpacity onPress={() => setView('main')}><Feather name="x" size={20} color={colors.mutedForeground} /></TouchableOpacity>
                </View>
                <ScrollView>
                  {cashSessions.map(sess => {
                    const st = sess.sales.reduce((s, v) => s + v.total, 0);
                    const et = sess.expenses.reduce((s, e) => s + e.amount, 0);
                    return (
                      <View key={sess.id} style={[s.sessRow, { borderColor: colors.border }]}>
                        <Text style={[s.sessDate, { color: colors.foreground }]}>{formatDateTime(sess.openedAt)}</Text>
                        <Text style={[s.sessStatus, { color: sess.isOpen ? colors.positive : colors.mutedForeground }]}>{sess.isOpen ? 'Abierta' : 'Cerrada'}</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          <Text style={[s.sessMeta, { color: colors.mutedForeground }]}>Apertura: {formatLempira(sess.openingBalance)}</Text>
                          <Text style={[s.sessMeta, { color: colors.positive }]}>Ventas: {formatLempira(st)}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          <Text style={[s.sessMeta, { color: colors.negative }]}>Gastos: {formatLempira(et)}</Text>
                          <Text style={[s.sessMeta, { color: sess.isOpen ? colors.foreground : colors.mutedForeground }]}>
                            Cierre: {sess.closingBalance !== undefined ? formatLempira(sess.closingBalance) : 'Pendiente'}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </ScrollView>
              </View>
            </View>
          </Modal>
        )}
      </BackgroundImage>
    );
  }

  return (
    <BackgroundImage>
      <View style={{ flex: 1, paddingTop: topPad + 10 }}>
        <View style={s.posHeader}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={20} color={colors.gold} />
          </TouchableOpacity>
          <Text style={s.posTitle}>POS - Barbería Yasser</Text>
          <TouchableOpacity style={[s.closeBtn, { borderColor: colors.negative }]} onPress={() => setCloseModal(true)}>
            <Feather name="lock" size={14} color={colors.negative} />
            <Text style={[s.closeBtnTxt, { color: colors.negative }]}>Cerrar</Text>
          </TouchableOpacity>
        </View>

        <View style={[s.sessionBar, { backgroundColor: 'rgba(20,10,5,0.85)', borderColor: colors.border }]}>
          <View style={s.sessItem}>
            <Text style={[s.sessItemLabel, { color: colors.mutedForeground }]}>Apertura</Text>
            <Text style={[s.sessItemVal, { color: colors.foreground }]}>{formatLempira(currentSession.openingBalance)}</Text>
          </View>
          <View style={s.sessItem}>
            <Text style={[s.sessItemLabel, { color: colors.mutedForeground }]}>Ventas</Text>
            <Text style={[s.sessItemVal, { color: colors.positive }]}>{formatLempira(sessionSalesTotal)}</Text>
          </View>
          <View style={s.sessItem}>
            <Text style={[s.sessItemLabel, { color: colors.mutedForeground }]}>Gastos</Text>
            <Text style={[s.sessItemVal, { color: colors.negative }]}>{formatLempira(sessionExpensesTotal)}</Text>
          </View>
          <View style={s.sessItem}>
            <Text style={[s.sessItemLabel, { color: colors.mutedForeground }]}>En Caja</Text>
            <Text style={[s.sessItemVal, { color: sessionCash >= 0 ? colors.positive : colors.negative }]}>{formatLempira(sessionCash)}</Text>
          </View>
        </View>

        <View style={s.viewTabs}>
          {([['venta', 'Ventas', 'shopping-cart'], ['gasto', 'Gasto', 'minus-circle'], ['arqueo', 'Arqueo', 'clipboard']] as const).map(([key, label, icon]) => (
            <TouchableOpacity key={key} style={[s.viewTab, view === key && { borderBottomColor: colors.gold, borderBottomWidth: 2 }]} onPress={() => setView(key)}>
              <Feather name={icon} size={15} color={view === key ? colors.gold : colors.mutedForeground} />
              <Text style={[s.viewTabTxt, { color: view === key ? colors.gold : colors.mutedForeground }]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {view === 'venta' && (
          <View style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 200 }} showsVerticalScrollIndicator={false}>
              <Text style={s.sectionLabel}>Productos y Servicios</Text>
              <TouchableOpacity style={[s.scanBtn, { borderColor: colors.gold }]} onPress={startScanner}>
                <Feather name="camera" size={18} color={colors.gold} />
                <Text style={[s.scanBtnTxt, { color: colors.gold }]}>Escanear código de barras</Text>
              </TouchableOpacity>
              <View style={s.barcodeRow}>
                <TextInput
                  style={[s.input, s.barcodeInput]}
                  value={manualBarcode}
                  onChangeText={setManualBarcode}
                  autoCapitalize="characters"
                  placeholder="O escribe el código"
                  placeholderTextColor={colors.mutedForeground}
                  returnKeyType="done"
                  onSubmitEditing={() => addProductByBarcode(manualBarcode)}
                />
                <TouchableOpacity style={[s.barcodeAddBtn, { backgroundColor: colors.gold }]} onPress={() => addProductByBarcode(manualBarcode)}>
                  <Text style={[s.barcodeAddTxt, { color: colors.background }]}>Agregar</Text>
                </TouchableOpacity>
              </View>
              <View style={s.productsGrid}>
                {products.map(p => (
                  <TouchableOpacity key={p.id} style={[s.productCard, { backgroundColor: 'rgba(20,10,5,0.85)', borderColor: colors.border }]} onPress={() => addToCart(p)}>
                    <Feather name={p.category === 'Servicios' ? 'scissors' : 'package'} size={20} color={colors.gold} />
                    <Text style={s.productCardName}>{p.name}</Text>
                    <Text style={[s.productCardPrice, { color: colors.positive }]}>{formatLempira(p.price)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {cart.length > 0 && (
              <View style={[s.cartBar, { backgroundColor: 'rgba(10,5,2,0.95)', borderColor: colors.border }]}>
                <Text style={[s.cartTitle, { color: colors.gold }]}>Carrito ({cart.length})</Text>
                {cart.map(c => (
                  <View key={c.productId} style={s.cartItem}>
                    <Text style={[s.cartItemName, { color: colors.foreground }]}>{c.quantity}x {c.productName}</Text>
                    <Text style={[s.cartItemPrice, { color: colors.positive }]}>{formatLempira(c.price * c.quantity)}</Text>
                    <TouchableOpacity onPress={() => removeFromCart(c.productId)}>
                      <Feather name="x" size={14} color={colors.negative} />
                    </TouchableOpacity>
                  </View>
                ))}
                <View style={s.cartTotal}>
                  <Text style={[s.cartTotalLabel, { color: colors.foreground }]}>TOTAL</Text>
                  <Text style={[s.cartTotalAmt, { color: colors.gold }]}>{formatLempira(cartTotal)}</Text>
                </View>
                <TouchableOpacity style={[s.saleBtn, { backgroundColor: colors.positive }]} onPress={handleSale}>
                  <Feather name="check-circle" size={18} color="#fff" />
                  <Text style={s.saleBtnTxt}>Registrar Venta</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {view === 'gasto' && (
          <View style={{ padding: 20 }}>
            <Text style={s.sectionLabel}>Registrar Gasto de Caja</Text>
            <Text style={s.label}>Descripción</Text>
            <TextInput style={s.input} value={gastoDesc} onChangeText={setGastoDesc} placeholder="Describe el gasto..." placeholderTextColor={colors.mutedForeground} />
            <Text style={s.label}>Monto (L)</Text>
            <TextInput style={s.input} value={gastoAmt} onChangeText={setGastoAmt} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor={colors.mutedForeground} />
            <Text style={s.label}>Categoría</Text>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
              {['Compra', 'Servicios', 'Sueldos', 'Otros'].map(cat => (
                <TouchableOpacity key={cat} style={[s.catBtn, gastocat === cat && { backgroundColor: colors.gold + '22', borderColor: colors.gold }]} onPress={() => setGastoCat(cat)}>
                  <Text style={[s.catBtnTxt, { color: gastocat === cat ? colors.gold : colors.mutedForeground }]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={[s.saleBtn, { backgroundColor: colors.negative }]} onPress={handleGasto}>
              <Feather name="minus-circle" size={18} color="#fff" />
              <Text style={s.saleBtnTxt}>Registrar Gasto</Text>
            </TouchableOpacity>
          </View>
        )}

        {view === 'arqueo' && (
          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
            <Text style={s.sectionLabel}>Arqueo de Caja</Text>
            <View style={[s.arqueoCard, { borderColor: colors.border }]}>
              <Text style={[s.arqueoRow, { color: colors.foreground }]}>Saldo Apertura: <Text style={{ color: colors.gold }}>{formatLempira(currentSession.openingBalance)}</Text></Text>
              <Text style={[s.arqueoRow, { color: colors.foreground }]}>Total Ventas: <Text style={{ color: colors.positive }}>+{formatLempira(sessionSalesTotal)}</Text></Text>
              <Text style={[s.arqueoRow, { color: colors.foreground }]}>Total Gastos: <Text style={{ color: colors.negative }}>-{formatLempira(sessionExpensesTotal)}</Text></Text>
              <View style={[s.arqueoTotal, { borderColor: colors.gold }]}>
                <Text style={[s.arqueoTotalLabel, { color: colors.mutedForeground }]}>SALDO ESPERADO EN CAJA</Text>
                <Text style={[s.arqueoTotalAmt, { color: sessionCash >= 0 ? colors.positive : colors.negative }]}>{formatLempira(sessionCash)}</Text>
              </View>
            </View>
            <Text style={s.sectionLabel}>Ventas de esta sesión ({currentSession.sales.length})</Text>
            {currentSession.sales.map(sale => (
              <View key={sale.id} style={[s.sessRow, { borderColor: colors.border }]}>
                <Text style={[s.sessMeta, { color: colors.foreground }]}>{sale.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}</Text>
                <Text style={[s.sessMeta, { color: colors.positive }]}>{formatLempira(sale.total)} • {formatDateTime(sale.date)}</Text>
              </View>
            ))}
            {currentSession.sales.length === 0 && <Text style={[s.noData, { color: colors.mutedForeground }]}>Sin ventas en esta sesion</Text>}
            <Text style={s.sectionLabel}>Gastos de esta sesión ({currentSession.expenses.length})</Text>
            {currentSession.expenses.map(exp => (
              <View key={exp.id} style={[s.sessRow, { borderColor: colors.border }]}>
                <Text style={[s.sessMeta, { color: colors.foreground }]}>{exp.description} ({exp.category})</Text>
                <Text style={[s.sessMeta, { color: colors.negative }]}>{formatLempira(exp.amount)} • {formatDateTime(exp.date)}</Text>
              </View>
            ))}
            {currentSession.expenses.length === 0 && <Text style={[s.noData, { color: colors.mutedForeground }]}>Sin gastos en esta sesion</Text>}
          </ScrollView>
        )}
      </View>

      <Modal visible={closeModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={[s.overlay, { paddingBottom: modalBottomPadding }]}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={s.modal}>
            <Text style={s.modalTitle}>Cierre de Caja</Text>
            <Text style={[s.closeSummary, { color: colors.mutedForeground }]}>Saldo esperado: {formatLempira(sessionCash)}</Text>
            <Text style={s.label}>Efectivo contado (L)</Text>
            <TextInput style={s.input} value={closingAmt} onChangeText={setClosingAmt} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor={colors.mutedForeground} />
            {closingAmt !== '' && (
              <Text style={[s.diffText, { color: parseFloat(closingAmt) - sessionCash >= 0 ? colors.positive : colors.negative }]}>
                Diferencia: {formatLempira(parseFloat(closingAmt) - sessionCash)}
              </Text>
            )}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <TouchableOpacity style={[s.cancelBtn, { borderColor: colors.border }]} onPress={() => setCloseModal(false)}>
                <Text style={[s.cancelTxt, { color: colors.mutedForeground }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.modalBtn, { backgroundColor: colors.negative, flex: 1 }]} onPress={handleClose}>
                <Text style={s.modalBtnTxt}>Cerrar Caja</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      <Modal visible={scannerVisible} animationType="slide" onRequestClose={() => setScannerVisible(false)}>
        <View style={[s.scannerScreen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39', 'itf14'],
            }}
            onBarcodeScanned={({ data }) => {
              setScannerVisible(false);
              addProductByBarcode(data);
            }}
          />
          <View style={[s.scannerHeader, { top: insets.top }]}>
            <Text style={s.scannerTitle}>Escanear producto</Text>
            <TouchableOpacity style={s.scannerClose} onPress={() => setScannerVisible(false)}>
              <Feather name="x" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={s.scanTarget} />
          <Text style={s.scannerHint}>Centra el código de barras dentro del recuadro</Text>
        </View>
      </Modal>
    </BackgroundImage>
  );
}

const makeStyles = (colors: ReturnType<typeof import('@/hooks/useColors').useColors>) => StyleSheet.create({
  backBtn: { position: 'absolute', top: 60, left: 20, zIndex: 10 },
  closedCard: { backgroundColor: 'rgba(20,10,5,0.9)', borderRadius: 20, padding: 30, alignItems: 'center', borderWidth: 1, gap: 12, marginTop: 60 },
  closedTitle: { fontSize: 24, fontFamily: 'Inter_700Bold' },
  closedSub: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  openBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14, marginTop: 8 },
  openBtnTxt: { color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 16 },
  histBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10, borderWidth: 1, marginTop: 4 },
  histBtnTxt: { fontFamily: 'Inter_400Regular', fontSize: 13 },
  posHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 12 },
  posTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', color: colors.gold },
  closeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  closeBtnTxt: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  sessionBar: { flexDirection: 'row', marginHorizontal: 16, borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 8 },
  sessItem: { flex: 1, alignItems: 'center' },
  sessItemLabel: { fontSize: 10, fontFamily: 'Inter_400Regular', textTransform: 'uppercase' },
  sessItemVal: { fontSize: 13, fontFamily: 'Inter_700Bold', marginTop: 2 },
  viewTabs: { flexDirection: 'row', marginHorizontal: 16, borderRadius: 10, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', marginBottom: 12 },
  viewTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10 },
  viewTabTxt: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  sectionLabel: { fontSize: 12, fontFamily: 'Inter_700Bold', color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 },
  scanBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, borderWidth: 1, borderRadius: 10, marginBottom: 8 },
  scanBtnTxt: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  barcodeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  barcodeInput: { flex: 1, marginTop: 0 },
  barcodeAddBtn: { paddingHorizontal: 14, paddingVertical: 13, borderRadius: 10 },
  barcodeAddTxt: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  productsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  productCard: { width: '47%', padding: 14, borderRadius: 12, borderWidth: 1, alignItems: 'center', gap: 6 },
  productCardName: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: colors.foreground, textAlign: 'center' },
  productCardPrice: { fontFamily: 'Inter_700Bold', fontSize: 14 },
  cartBar: { position: 'absolute', bottom: Platform.OS === 'web' ? 34 : 0, left: 0, right: 0, padding: 16, borderTopWidth: 1, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  cartTitle: { fontFamily: 'Inter_700Bold', fontSize: 14, marginBottom: 8 },
  cartItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  cartItemName: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 13 },
  cartItemPrice: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  cartTotal: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8, marginTop: 4, borderTopWidth: 1, borderTopColor: colors.border + '55' },
  cartTotalLabel: { fontFamily: 'Inter_700Bold', fontSize: 14 },
  cartTotalAmt: { fontFamily: 'Inter_700Bold', fontSize: 18 },
  saleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: 12, marginTop: 10 },
  saleBtnTxt: { color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 15 },
  label: { fontSize: 11, fontFamily: 'Inter_500Medium', color: colors.mutedForeground, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: colors.muted, borderRadius: 10, padding: 12, color: colors.foreground, fontFamily: 'Inter_400Regular', fontSize: 15, borderWidth: 1, borderColor: colors.border },
  catBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
  catBtnTxt: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  arqueoCard: { backgroundColor: 'rgba(20,10,5,0.85)', borderRadius: 14, padding: 16, borderWidth: 1, marginBottom: 16 },
  arqueoRow: { fontFamily: 'Inter_400Regular', fontSize: 14, marginBottom: 8 },
  arqueoTotal: { borderTopWidth: 1.5, paddingTop: 12, marginTop: 8 },
  arqueoTotalLabel: { fontSize: 10, fontFamily: 'Inter_500Medium', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  arqueoTotalAmt: { fontSize: 26, fontFamily: 'Inter_700Bold' },
  sessRow: { backgroundColor: 'rgba(20,10,5,0.75)', borderRadius: 10, padding: 12, borderWidth: 1, marginBottom: 8 },
  sessDate: { fontFamily: 'Inter_600SemiBold', fontSize: 13, marginBottom: 4 },
  sessStatus: { fontFamily: 'Inter_500Medium', fontSize: 11, marginBottom: 6 },
  sessMeta: { fontFamily: 'Inter_400Regular', fontSize: 12, marginBottom: 2 },
  noData: { fontFamily: 'Inter_400Regular', fontSize: 13, fontStyle: 'italic', marginBottom: 16 },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  openCashOverlay: { justifyContent: 'center', paddingHorizontal: 20 },
  openCashModal: { width: '100%', maxHeight: '85%', borderRadius: 24 },
  openCashButton: { flex: 0, minHeight: 52, alignSelf: 'stretch', marginTop: 16 },
  scannerScreen: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  scannerHeader: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 20, paddingVertical: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scannerTitle: { color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 18 },
  scannerClose: { padding: 8 },
  scanTarget: { width: '82%', height: 190, borderWidth: 2, borderColor: '#f5c542', borderRadius: 16, backgroundColor: 'transparent' },
  scannerHint: { color: '#fff', fontFamily: 'Inter_500Medium', fontSize: 14, textAlign: 'center', marginTop: 24, paddingHorizontal: 24 },
  modal: { backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: colors.foreground, marginBottom: 4 },
  closeSummary: { fontSize: 13, fontFamily: 'Inter_400Regular', marginBottom: 4 },
  modalBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center' },
  modalBtnTxt: { color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 15 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
  cancelTxt: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  diffText: { fontFamily: 'Inter_700Bold', fontSize: 16, marginTop: 8, textAlign: 'center' },
});
