import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { typography } from '../constants/theme';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width / 3;

interface MenuItem {
  id: string;
  title: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'divisas', title: 'Divisas', icon: 'cash-sync' },
  { id: 'longitud', title: 'Longitud', icon: 'ruler' },
  { id: 'masa', title: 'Masa', icon: 'weight' },
  { id: 'area', title: 'Área', icon: 'texture-box' },
  { id: 'tiempo', title: 'Tiempo', icon: 'clock-time-four' },
  { id: 'finanzas', title: 'Finanzas', icon: 'hand-coin' },
  { id: 'datos', title: 'Datos', icon: 'harddisk' },
  { id: 'fecha', title: 'Fecha', icon: 'calendar-blank' },
  { id: 'descuento', title: 'Descuento', icon: 'tag' },
  { id: 'volumen', title: 'Volumen', icon: 'cube' },
  { id: 'sistema', title: 'Sistema numérico', icon: 'numeric' },
  { id: 'velocidad', title: 'Velocidad', icon: 'speedometer' },
  { id: 'temperatura', title: 'Temperatura', icon: 'thermometer' },
  { id: 'imc', title: 'IMC', icon: 'scale-bathroom' },
];

export default function Conversor() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgDeep }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.grid}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.item}
              activeOpacity={0.6}
            >
              <MaterialCommunityIcons 
                name={item.icon} 
                size={34} 
                color={colors.textPrimary} // Pure white in dark mode
              />
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingVertical: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  item: {
    width: ITEM_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 26,
  },
  label: {
    marginTop: 12,
    fontSize: 13,
    fontFamily: typography.sans,
    fontWeight: '400',
    textAlign: 'center',
  },
});