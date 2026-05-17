import React from 'react';
import { View } from 'react-native';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Text } from '@/components/ui/text';

const ConfirmDialog = ({ 
  visible, 
  title = "Are you sure?", 
  message, 
  onConfirm, 
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default" 
}) => {
  return (
    <View>
    <AlertDialog open={visible}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onPress={onCancel}>
            <Text>{cancelText}</Text>
          </AlertDialogCancel>
          <AlertDialogAction 
            onPress={onConfirm}
            className={variant === 'destructive' ? 'bg-destructive' : 'bg-primary'}
            >
            <Text className={variant === 'destructive' ? 'text-destructive-foreground' : 'text-primary-foreground'}>
              {confirmText}
            </Text>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
</View>
  );
};

export default ConfirmDialog;