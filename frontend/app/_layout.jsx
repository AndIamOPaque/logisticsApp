import '@/global.css';
import { TabBar } from '@/components/tabBar'; 
import { LayoutDashboardIcon, Truck, FactoryIcon, CalendarClock } from 'lucide-react-native'; 
import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack, Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useUniwind } from 'uniwind';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { MutationCache } from '@tanstack/react-query';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '@/components/ui/icon';


export {
  ErrorBoundary,
} from 'expo-router';

const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onSuccess: (data, variables, context, mutation) => {
      if (mutation.options.meta?.successMessage) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: mutation.options.meta.successMessage,
        });
      }
    },onError: (error) => {
      Toast.show({
        type: 'error',
        text1: 'Action Failed',
        text2: error.message,
      });
    },
  }),

});

export default function RootLayout() {
  const { theme } = useUniwind();

  return (
    <SafeAreaProvider>

      <ThemeProvider value={NAV_THEME[theme ?? 'light']}>
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        <QueryClientProvider client={queryClient}>
          <Tabs
        tabBar={props => <TabBar {...props} />}
        
        screenOptions={{
          headerShown: false,
        }}
        >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({focused, size }) => <Icon 
              as={LayoutDashboardIcon} 
              size={size} 
              className={focused ? 'text-primary-foreground' : 'text-muted-foreground'} 
            />,
          }}
          />
        <Tabs.Screen
          name="production"
          options={{
            title: 'Production',
            tabBarIcon: ({focused,size }) => <Icon 
              as={FactoryIcon} 
              size={size} 
              className={focused ? 'text-primary-foreground' : 'text-muted-foreground'} 
            />,
          }}
          />
        <Tabs.Screen
          name="delivery"
          options={{
            title: 'Delivery',
            tabBarIcon: ({focused,size }) => <Icon 
              as={Truck} 
              size={size} 
              className={focused ? 'text-primary-foreground' : 'text-muted-foreground'} 
            />,
          }}
          />
        <Tabs.Screen
          name="product"
          options={{ href: null }} // moved to sidebar
          />
        <Tabs.Screen
          name="location"
          options={{ href: null }} // sidebar only
          />
        <Tabs.Screen
          name="asset"
          options={{ href: null }} // sidebar only
          />
        <Tabs.Screen
          name="party"
          options={{ href: null }} // sidebar only
          />
        <Tabs.Screen
          name="employee"
          options={{ href: null }} // sidebar only
          />
        <Tabs.Screen
          name="attendance"
          options={{
            title: 'Attendance',
            tabBarIcon: ({focused, size}) => <Icon as={CalendarClock} size={size} className={focused ? 'text-primary-foreground' : 'text-muted-foreground'} />
          }}
          />
      </Tabs>

      </QueryClientProvider>
        <PortalHost />
        <Toast/>
      </ThemeProvider>

    </SafeAreaProvider>
  );
}
