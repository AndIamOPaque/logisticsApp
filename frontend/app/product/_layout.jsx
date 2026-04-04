import { Stack } from 'expo-router';
import { useTheme } from '@react-navigation/native';
export default function ProductLayout() {
    const {colors}  = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background }, 
        headerTintColor: colors.text ,
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ title: 'Product List' }} 
      />
    </Stack>
  );
}