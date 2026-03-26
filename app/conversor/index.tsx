import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { typography } from '../../constants/theme';

interface MenuItem {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'divisas',      title: 'Divisas',           icon: 'cash-outline' },
  { id: 'longitud',     title: 'Longitud',          icon: 'resize-outline' },
  { id: 'masa',         title: 'Masa',              icon: 'bag-handle-outline' },
  { id: 'area',         title: 'Área',              icon: 'grid-outline' },
  { id: 'tiempo',       title: 'Tiempo',            icon: 'time-outline' },
  { id: 'finanzas',     title: 'Finanzas',          icon: 'trending-up-outline' },
  { id: 'datos',        title: 'Datos',             icon: 'server-outline' },
  { id: 'fecha',        title: 'Fecha',             icon: 'calendar-outline' },
  { id: 'descuento',    title: 'Descuento',         icon: 'pricetag-outline' },
  { id: 'volumen',      title: 'Volumen',           icon: 'cube-outline' },
  { id: 'sistema',      title: 'Sistema\nnumérico', icon: 'code-slash-outline' },
  { id: 'velocidad',    title: 'Velocidad',         icon: 'speedometer-outline' },
  { id: 'temperatura',  title: 'Temperatura',       icon: 'thermometer-outline' },
  { id: 'imc',          title: 'IMC',               icon: 'body-outline' },
];

export default function ConversorIndex() {
  const { colors } = useTheme();
  const router = useRouter();

  const rows: MenuItem[][] = [];
  for (let i = 0; i < MENU_ITEMS.length; i += 3) {
    rows.push(MENU_ITEMS.slice(i, i + 3));
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {rows.map((row, ri) => (
          <View key={ri} style={styles.row}>
            {row.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.item}
                activeOpacity={0.6}
                onPress={() => router.push(`/conversor/${item.id}` as any)}
              >
                <Ionicons name={item.icon} size={32} color={colors.textPrimary} />
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}
            {row.length < 3 && Array.from({ length: 3 - row.length }).map((_, i) => (
              <View key={`empty-${i}`} style={styles.item} />
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingVertical: 20 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 12,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 22,
  },
  label: {
    marginTop: 10,
    fontSize: 13,
    fontFamily: typography.sans,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 18,
  },
});
