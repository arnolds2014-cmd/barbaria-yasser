import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs, useRouter } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, TouchableOpacity, View, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "house", selected: "house.fill" }} />
        <Label>Inicio</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="inventario">
        <Icon sf={{ default: "cube.box", selected: "cube.box.fill" }} />
        <Label>Inventario</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="balances">
        <Icon sf={{ default: "chart.bar", selected: "chart.bar.fill" }} />
        <Label>Balances</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="cuentas">
        <Icon sf={{ default: "list.bullet", selected: "list.bullet" }} />
        <Label>Cuentas</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="perfil">
        <Icon sf={{ default: "person", selected: "person.fill" }} />
        <Label>Perfil</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: true,
        headerStyle: {
          backgroundColor: 'rgba(8,4,2,0.95)',
          ...(Platform.OS === "android" ? { height: 45 } : {}),
        },
        headerTitleStyle: { fontSize: 16 },
        headerRightContainerStyle: { paddingRight: 8 },
        headerTintColor: colors.gold,
        headerRight: () => (
          <TouchableOpacity
            accessibilityLabel="Abrir punto de venta"
            hitSlop={8}
            style={{ marginRight: 8, flexDirection: 'row', alignItems: 'center', gap: 4, transform: [{ translateY: 6 }] }}
            onPress={() => router.push('/pos')}
          >
            <Feather name="shopping-cart" size={20} color={colors.gold} />
          </TouchableOpacity>
        ),
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : "rgba(8,4,2,0.97)",
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 0,
          ...(Platform.OS === "android"
            ? { height: 54 + insets.bottom, paddingTop: 4, paddingBottom: insets.bottom + 4 }
            : {}),
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : isWeb ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(8,4,2,0.97)" }]} />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="house" tintColor={color} size={22} />
            ) : (
              <Feather name="home" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="inventario"
        options={{
          title: "Inventario",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="archivebox" tintColor={color} size={22} />
            ) : (
              <Feather name="package" size={20} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="balances"
        options={{
          title: "Balances",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="chart.bar" tintColor={color} size={22} />
            ) : (
              <Feather name="bar-chart-2" size={20} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="cuentas"
        options={{
          title: "Cuentas",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="list.bullet" tintColor={color} size={22} />
            ) : (
              <Feather name="list" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="person" tintColor={color} size={22} />
            ) : (
              <Feather name="user" size={22} color={color} />
            ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}
