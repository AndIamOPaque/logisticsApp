import React from 'react';
import { View } from 'react-native';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  PackageIcon,
  ZapIcon,
  Trash2Icon,
  SlidersHorizontalIcon,
  BoxIcon,
  FlaskConicalIcon,
} from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';

// ─── Purpose label & icon ─────────────────────────────────────────────────────
const PURPOSE_META = {
  intake:     { label: 'Intake',      icon: ArrowDownIcon         },
  production: { label: 'Production',  icon: ZapIcon               },
  transfer:   { label: 'Transfer',    icon: ArrowUpIcon           },
  sale:       { label: 'Sale',        icon: PackageIcon           },
  waste:      { label: 'Waste',       icon: Trash2Icon            },
  correction: { label: 'Return',      icon: SlidersHorizontalIcon },
};

// ─── Item model icon ──────────────────────────────────────────────────────────
const ITEM_MODEL_META = {
  RawMaterial: { icon: FlaskConicalIcon, color: 'text-amber-500',  bg: 'bg-amber-500/10'  },
  Product:     { icon: BoxIcon,          color: 'text-blue-500',   bg: 'bg-blue-500/10'   },
};

/**
 * InventoryMoveCard
 *
 * Renders a single InventoryMove document returned by GET /production-order/:id/logs
 *
 * Data shape (from production.service.getProductionInventoryMoves):
 *   move.item        { name, code }      — populated
 *   move.location    { name }            — populated
 *   move.createdBy   { name }            — populated
 *   move.quantity    Number              — SIGNED: negative = stock went out, positive = stock came in
 *   move.purpose     string enum         — 'intake'|'production'|'transfer'|'sale'|'waste'|'correction'
 *   move.itemModel   'RawMaterial'|'Product'
 *   move.createdAt   Date
 */
const InventoryMoveCard = ({ move }) => {
  const isOut = move.quantity < 0;
  const absQty = Math.abs(move.quantity);

  const purposeMeta = PURPOSE_META[move.purpose] ?? PURPOSE_META.correction;
  const itemMeta = ITEM_MODEL_META[move.itemModel] ?? ITEM_MODEL_META.Product;

  const timeStr = move.createdAt
    ? new Date(move.createdAt).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

  return (
    <View className="flex-row items-start gap-x-3 py-3 border-b border-border last:border-0">
      {/* Item type icon */}
      <View className={`mt-0.5 p-2 rounded-xl ${itemMeta.bg}`}>
        <Icon as={itemMeta.icon} className={`size-4 ${itemMeta.color}`} />
      </View>

      {/* Content */}
      <View className="flex-1">
        {/* Top row: name + signed quantity */}
        <View className="flex-row items-center justify-between">
          <Text className="text-foreground text-sm font-semibold flex-1 mr-2" numberOfLines={1}>
            {move.item?.name ?? 'Unknown Item'}
          </Text>
          <View className="flex-row items-center gap-x-1">
            <Icon
              as={isOut ? ArrowDownIcon : ArrowUpIcon}
              className={`size-3 ${isOut ? 'text-red-500' : 'text-green-500'}`}
            />
            <Text className={`text-sm font-bold tabular-nums ${isOut ? 'text-red-500' : 'text-green-500'}`}>
              {absQty}
              <Text className="text-muted-foreground text-xs font-normal"> units</Text>
            </Text>
          </View>
        </View>

        {/* Second row: purpose badge + location */}
        <View className="flex-row items-center gap-x-2 mt-0.5">
          <View className="flex-row items-center gap-x-1 bg-muted px-1.5 py-0.5 rounded-md">
            <Icon as={purposeMeta.icon} className="size-2.5 text-muted-foreground" />
            <Text className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              {purposeMeta.label}
            </Text>
          </View>
          {move.location?.name && (
            <Text className="text-muted-foreground text-xs">@ {move.location.name}</Text>
          )}
        </View>

        {/* Timestamp */}
        <Text className="text-muted-foreground text-[10px] mt-1">{timeStr}</Text>
      </View>
    </View>
  );
};

export default InventoryMoveCard;
