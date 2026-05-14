import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { FileText, ArrowDownLeft, ArrowUpRight, Calendar, Tag, CreditCard } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';

const TYPE_CONFIG = {
  INCOME: { label: 'Income', color: 'text-green-500', bg: 'bg-green-500/10', icon: ArrowDownLeft },
  EXPENSE: { label: 'Expense', color: 'text-destructive', bg: 'bg-destructive/10', icon: ArrowUpRight },
};

const getStatusVariant = (status) => {
  switch (status?.toUpperCase()) {
    case 'PAID': return 'default';
    case 'PENDING': return 'secondary';
    case 'OVERDUE': return 'destructive';
    default: return 'outline';
  }
};

const truncate = (str, len) => str?.length > len ? str.substring(0, len) + '...' : str;

export default function BillCard({ bill, onPress }) {
  const typeConf = TYPE_CONFIG[bill.type] || TYPE_CONFIG.EXPENSE;
  const isPaid = bill.status === 'PAID';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="bg-card border-border border-b px-4 py-4">
      {/* Top row: Type + Status */}
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-x-2">
          <View className={`rounded-xl p-2 ${typeConf.bg}`}>
            <Icon as={typeConf.icon} className={`size-4 ${typeConf.color}`} />
          </View>
          <View>
            <Text className="text-foreground font-semibold">{typeConf.label}</Text>
            <Text className="text-muted-foreground text-[10px] tracking-widest uppercase">
              BILL #{bill._id.substring(0, 8)}
            </Text>
          </View>
        </View>
        <Badge variant={getStatusVariant(bill.status)}>
          <Text>{bill.status?.toUpperCase() || 'UNKNOWN'}</Text>
        </Badge>
      </View>

      {/* Details Row 1 */}
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-1 flex-row items-center gap-x-1.5">
          <Icon as={Tag} className="text-muted-foreground size-3.5" />
          <Text className="text-muted-foreground text-xs font-medium" numberOfLines={1}>
            {truncate(bill.category || 'General', 18)}
          </Text>
        </View>
        <View className="flex-row items-center gap-x-1.5 flex-1 pl-2">
          <Icon as={Calendar} className="text-muted-foreground size-3.5" />
          <Text className="text-muted-foreground text-xs" numberOfLines={1}>
            {isPaid ? 'Paid on: ' : 'Due: '}
            {new Date(isPaid ? bill.paymentDate : bill.dueDate).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {/* Details Row 2: Link + Amount */}
      <View className="flex-row items-center justify-between mt-1">
        <View className="flex-1 flex-row items-center gap-x-1.5">
          <Icon as={FileText} className="text-muted-foreground size-3.5" />
          <Text className="text-muted-foreground text-xs font-semibold" numberOfLines={1}>
            {bill.from?.name} → {bill.to?.name}
          </Text>
        </View>
        <View className="ml-3 flex-row items-end gap-x-1">
          <Text className="text-muted-foreground text-xs pb-0.5">₹</Text>
          <Text className="text-foreground text-lg font-black leading-none">
            {bill.grandTotal?.toLocaleString() || 0}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
