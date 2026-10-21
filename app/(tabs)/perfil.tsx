import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  Platform, Image, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import BackgroundImage from '@/components/BackgroundImage';

export default function PerfilScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { userProfile, updateUserProfile } = useApp();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(userProfile.name);
  const [businessName, setBusinessName] = useState(userProfile.businessName);
  const [rtn, setRtn] = useState(userProfile.rtn);
  const [phone, setPhone] = useState(userProfile.phone);
  const [address, setAddress] = useState(userProfile.address);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const handleSave = () => {
    updateUserProfile({ name, businessName, rtn, phone, address });
    setEditing(false);
    Alert.alert('Guardado', 'Perfil actualizado correctamente');
  };

  const s = makeStyles(colors);

  return (
    <BackgroundImage>
      <ScrollView
        contentContainerStyle={{ paddingTop: topPad + 10, paddingBottom: 100, paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.avatarSection}>
          <View style={s.avatarWrap}>
            <Image source={require('../../assets/images/icon.png')} style={s.avatar} />
            <View style={[s.avatarBadge, { backgroundColor: colors.gold }]}>
              <Feather name="scissors" size={14} color={colors.background} />
            </View>
          </View>
          <Text style={s.businessName}>{userProfile.businessName}</Text>
          <Text style={s.ownerName}>{userProfile.name}</Text>
          {userProfile.rtn ? <Text style={[s.rtnText, { color: colors.mutedForeground }]}>RTN: {userProfile.rtn}</Text> : null}
        </View>

        <View style={[s.card, { backgroundColor: 'rgba(20,10,5,0.85)', borderColor: colors.border }]}>
          <View style={s.cardHeader}>
            <Text style={[s.cardTitle, { color: colors.gold }]}>Información del Negocio</Text>
            {!editing && (
              <TouchableOpacity onPress={() => setEditing(true)}>
                <Feather name="edit-2" size={16} color={colors.gold} />
              </TouchableOpacity>
            )}
          </View>

          {editing ? (
            <>
              <Text style={s.label}>Nombre del Propietario</Text>
              <TextInput style={s.input} value={name} onChangeText={setName} placeholderTextColor={colors.mutedForeground} placeholder="Tu nombre" />
              <Text style={s.label}>Nombre del Negocio</Text>
              <TextInput style={s.input} value={businessName} onChangeText={setBusinessName} placeholderTextColor={colors.mutedForeground} placeholder="Nombre de la barbería" />
              <Text style={s.label}>RTN</Text>
              <TextInput style={s.input} value={rtn} onChangeText={setRtn} placeholderTextColor={colors.mutedForeground} placeholder="Registro Tributario Nacional" keyboardType="numeric" />
              <Text style={s.label}>Teléfono</Text>
              <TextInput style={s.input} value={phone} onChangeText={setPhone} placeholderTextColor={colors.mutedForeground} placeholder="Número de teléfono" keyboardType="phone-pad" />
              <Text style={s.label}>Dirección</Text>
              <TextInput style={s.input} value={address} onChangeText={setAddress} placeholderTextColor={colors.mutedForeground} placeholder="Dirección del local" multiline />
              <View style={s.btnRow}>
                <TouchableOpacity style={[s.cancelBtn, { borderColor: colors.border }]} onPress={() => setEditing(false)}>
                  <Text style={[s.cancelTxt, { color: colors.mutedForeground }]}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.saveBtn, { backgroundColor: colors.gold }]} onPress={handleSave}>
                  <Text style={[s.saveTxt, { color: colors.background }]}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <InfoRow icon="user" label="Propietario" value={userProfile.name || 'Sin definir'} colors={colors} />
              <InfoRow icon="briefcase" label="Negocio" value={userProfile.businessName || 'Sin definir'} colors={colors} />
              <InfoRow icon="file-text" label="RTN" value={userProfile.rtn || 'Sin definir'} colors={colors} />
              <InfoRow icon="phone" label="Teléfono" value={userProfile.phone || 'Sin definir'} colors={colors} />
              <InfoRow icon="map-pin" label="Dirección" value={userProfile.address || 'Sin definir'} colors={colors} />
            </>
          )}
        </View>

        <View style={[s.card, { backgroundColor: 'rgba(20,10,5,0.85)', borderColor: colors.border, marginTop: 12 }]}>
          <Text style={[s.cardTitle, { color: colors.gold }]}>Acerca de la App</Text>
          <Text style={[s.aboutTxt, { color: colors.mutedForeground }]}>Barbería Yasser v1.0</Text>
          <Text style={[s.aboutTxt, { color: colors.mutedForeground }]}>Sistema Contable para Barberías</Text>
          <Text style={[s.aboutTxt, { color: colors.mutedForeground }]}>Moneda: Lempira Hondureno (L)</Text>
          <Text style={[s.aboutTxt, { color: colors.mutedForeground }]}>Funciona 100% sin internet</Text>
        </View>
      </ScrollView>
    </BackgroundImage>
  );
}

function InfoRow({ icon, label, value, colors }: { icon: string; label: string; value: string; colors: ReturnType<typeof import('@/hooks/useColors').useColors> }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border + '55' }}>
      <Feather name={icon as any} size={15} color={colors.gold} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 10, fontFamily: 'Inter_400Regular', color: colors.mutedForeground, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Text>
        <Text style={{ fontSize: 14, fontFamily: 'Inter_500Medium', color: colors.foreground, marginTop: 1 }}>{value}</Text>
      </View>
    </View>
  );
}

const makeStyles = (colors: ReturnType<typeof import('@/hooks/useColors').useColors>) => StyleSheet.create({
  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatarWrap: { position: 'relative', marginBottom: 12 },
  avatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: colors.gold },
  avatarBadge: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  businessName: { fontSize: 22, fontFamily: 'Inter_700Bold', color: colors.gold, textAlign: 'center' },
  ownerName: { fontSize: 14, fontFamily: 'Inter_400Regular', color: colors.foreground, marginTop: 2 },
  rtnText: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 4 },
  card: { borderRadius: 16, padding: 18, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  cardTitle: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  label: { fontSize: 11, fontFamily: 'Inter_500Medium', color: colors.mutedForeground, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 12, marginBottom: 6 },
  input: { backgroundColor: colors.muted, borderRadius: 10, padding: 12, color: colors.foreground, fontFamily: 'Inter_400Regular', fontSize: 14, borderWidth: 1, borderColor: colors.border },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
  cancelTxt: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  saveBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center' },
  saveTxt: { fontFamily: 'Inter_700Bold', fontSize: 14 },
  aboutTxt: { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 6 },
});
