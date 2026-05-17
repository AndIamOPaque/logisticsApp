import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { AlertCircleIcon, RefreshCwIcon } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';

export function ErrorMessage({ error, onRetry, message = "Something went wrong." }) {
  const displayMessage = error?.message || message;

  return (
    <View className="py-8 items-center gap-y-3 px-8 flex-1 justify-center">
      <View className="bg-destructive/10 rounded-full p-4">
        <Icon as={AlertCircleIcon} className="text-destructive size-8" />
      </View>
      <Text className="text-center text-sm font-medium text-destructive">
        {displayMessage}
      </Text>
      {onRetry && (
        <TouchableOpacity 
          onPress={onRetry}
          activeOpacity={0.7}
          className="flex-row items-center gap-x-2 bg-muted px-4 py-2 rounded-full mt-2"
        >
          <Icon as={RefreshCwIcon} className="text-muted-foreground size-4" />
          <Text className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
            Retry
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
