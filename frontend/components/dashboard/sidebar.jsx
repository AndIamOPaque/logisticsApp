// components/dashboard/Sidebar.jsx
import * as React from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Pressable,
  ScrollView,
} from 'react-native';
import { Link } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Uniwind, useUniwind } from 'uniwind';
import {
  UserCircleIcon,
  SettingsIcon,
  MapPinIcon,
  WrenchIcon,
  UsersIcon,
  FlaskConicalIcon,
  MoonStarIcon,
  SunIcon,
  XIcon,
  PackageIcon,
  CalendarClockIcon,
  ReceiptIcon,
} from 'lucide-react-native';
import { router } from 'expo-router';

// ─── Nav Config ─────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  // { label: 'Account',       href: '/account',       icon: UserCircleIcon    },
  // { label: 'Settings',      href: '/settings',      icon: SettingsIcon      },
  { label: 'Location', href: '/location', icon: MapPinIcon },
  { label: 'Asset', href: '/asset', icon: WrenchIcon },
  { label: 'Party', href: '/party', icon: UsersIcon },
  { label: 'Raw Materials', href: '/raw-material', icon: FlaskConicalIcon },
  { label: 'Product', href: '/product', icon: PackageIcon },
  { label: 'Employees', href: '/employee', icon: UsersIcon },
  { label: 'Attendance', href: '/attendance', icon: CalendarClockIcon },
  { label: 'Bills', href: '/bill', icon: ReceiptIcon },
];

const THEME_ICONS = { light: SunIcon, dark: MoonStarIcon };

// ─── Theme Toggle (internal) ─────────────────────────────────────────────────

function ThemeToggle() {
  const { theme } = useUniwind();

  function toggleTheme() {
    Uniwind.setTheme(theme === 'dark' ? 'light' : 'dark');
  }

  const isDark = theme === 'dark';

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      activeOpacity={0.7}
      className="bg-muted border-border flex-row items-center justify-between rounded-xl border px-3 py-3">
      <View className="flex-row items-center gap-x-3">
        <View className={`rounded-lg p-1.5 ${isDark ? 'bg-primary/20' : 'bg-primary/10'}`}>
          <Icon as={THEME_ICONS[theme ?? 'light']} className="text-primary size-4" />
        </View>
        <Text className="text-foreground text-sm font-medium">
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </Text>
      </View>

      {/* Toggle pill */}
      <View
        className={`h-6 w-11 justify-center rounded-full px-0.5 ${
          isDark ? 'bg-primary' : 'bg-border'
        }`}>
        <View
          className={`h-5 w-5 rounded-full bg-white shadow-sm transition-all ${
            isDark ? 'self-end' : 'self-start'
          }`}
        />
      </View>
    </TouchableOpacity>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

export function Sidebar({ isOpen, onClose }) {
  const slideAnim = React.useRef(new Animated.Value(-320)).current;
  const overlayAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 70,
          friction: 12,
        }),
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -320,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} transparent animationType="none" onRequestClose={onClose}>
      {/* Dimmed backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View className="absolute inset-0 bg-black/50" style={{ opacity: overlayAnim }} />
      </TouchableWithoutFeedback>

      {/* Drawer panel */}
      <Animated.View
        className="bg-sidebar border-border absolute top-0 bottom-0 left-0 w-72 border-r"
        style={{ transform: [{ translateX: slideAnim }] }}>
        {/* Header */}
        <View className="border-border flex-row items-center justify-between border-b px-5 pt-14 pb-4">
          <View>
            <Text className="text-sidebar-foreground text-base font-bold tracking-tight">
              OpsManager
            </Text>
            <Text className="text-muted-foreground mt-0.5 text-xs">Manufacturing Suite</Text>
          </View>
          <Button variant="ghost" size="icon" onPress={onClose} className="rounded-full">
            <Icon as={XIcon} className="text-muted-foreground size-4" />
          </Button>
        </View>

        {/* Nav Items */}
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 16, gap: 2 }}>
          <Text className="text-muted-foreground mb-2 px-2 text-xs font-bold tracking-widest uppercase">
            Navigation
          </Text>

          {NAV_ITEMS.map(({ label, href, icon }) => (
            <Pressable
              key={href}
              className="active:bg-muted flex-row items-center gap-x-3 rounded-xl px-3 py-3"
              onPress={() => {
                onClose();
                router.push(href);
              }}>
              {({ pressed }) => (
                <>
                  <View className={`rounded-lg p-2 ${pressed ? 'bg-primary/20' : 'bg-muted'}`}>
                    <Icon
                      as={icon}
                      className={`size-4 ${pressed ? 'text-primary' : 'text-muted-foreground'}`}
                    />
                  </View>
                  <Text
                    className={`text-sm font-medium ${
                      pressed ? 'text-primary' : 'text-sidebar-foreground'
                    }`}>
                    {label}
                  </Text>
                </>
              )}
            </Pressable>
          ))}
        </ScrollView>

        {/* Bottom: Theme Toggle */}
        <View className="border-border border-t px-3 pt-3 pb-10">
          <Text className="text-muted-foreground mb-2 px-2 text-xs font-bold tracking-widest uppercase">
            Appearance
          </Text>
          <ThemeToggle />
        </View>
      </Animated.View>
    </Modal>
  );
}
