import { Stack } from 'expo-router';
import { useTheme } from '@react-navigation/native';

export default function ProductionLayout() {
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
        options={{ title: 'Production List' }} 
      />
      <Stack.Screen
      name="[id]"
      options={{title: 'Info'
      }}/>
    </Stack>
  );
}