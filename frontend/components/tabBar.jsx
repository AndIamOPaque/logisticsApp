import { View, Text, TouchableOpacity } from 'react-native';
import { useLinkBuilder, useTheme } from '@react-navigation/native';

export function TabBar({ state, descriptors, navigation }) {
  const { colors } = useTheme();
  const { buildHref } = useLinkBuilder();

  return (
    <View className="absolute bottom-8 left-4 right-4 bg-card rounded-full flex-row justify-between items-center p-3 shadow-lg border border-border">
      {state.routes.map((route, index) => {
        
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };
        
        const onLongPress = () => {
            navigation.emit({
                type: 'tabLongPress',
                target: route.key,
            });
        };
    if(['production', 'index', 'delivery', 'attendance'].includes(route.name)) 
       { return (
          <TouchableOpacity
            key={route.name}
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            className={`flex-1 items-center justify-center py-2 rounded-full ${isFocused ? 'bg-primary' : ''}`}
          >
             {options.tabBarIcon && options.tabBarIcon({ 
                focused: isFocused,
                size: 24 
             })}
          </TouchableOpacity>
        );}
        else{
            return null;
        }
      })}
    </View>
  );
}