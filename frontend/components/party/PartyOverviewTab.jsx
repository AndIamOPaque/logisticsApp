import React from 'react';
import { View } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import {
  MapPinIcon,
  PhoneIcon,
  MailIcon,
  HashIcon,
  BuildingIcon,
  CreditCardIcon,
} from 'lucide-react-native';

export function InfoRow({ icon, label, value }) {
  if (!value) return null;
  return (
    <View className="border-border flex-row items-start gap-x-3 border-b py-3 last:border-0">
      <View className="bg-muted mt-0.5 rounded-lg p-1.5">
        <Icon as={icon} className="text-muted-foreground size-4" />
      </View>
      <View className="flex-1">
        <Text className="text-muted-foreground mb-0.5 text-xs">{label}</Text>
        <Text className="text-foreground text-sm font-medium">{value}</Text>
      </View>
    </View>
  );
}

export function PartyHero({ cfg }) {
  return (
    <View className="flex-row items-center gap-x-3 px-4">
      <View className={`rounded-2xl p-3 ${cfg.bg}`}>
        <Icon as={cfg.icon} className={`size-7 ${cfg.color}`} />
      </View>
      <View className={`rounded-full px-3 py-1 ${cfg.bg} self-start`}>
        <Text className={`text-sm font-semibold ${cfg.color}`}>{cfg.label}</Text>
      </View>
    </View>
  );
}

export function PartyGeneralCard({ party }) {
  return (
    <View className="bg-card border-border rounded-2xl border px-4 mx-4">
      <Text className="text-muted-foreground pt-4 pb-2 text-xs font-bold tracking-widest uppercase">
        General
      </Text>
      <InfoRow icon={MapPinIcon} label="Address" value={party.address} />
      <InfoRow icon={HashIcon} label="GSTIN" value={party.gstin} />
    </View>
  );
}

export function PartyContactsCard({ party }) {
  if (!party.contact || party.contact.length === 0) return null;

  return (
    <View className="bg-card border-border rounded-2xl border px-4 mx-4">
      <Text className="text-muted-foreground pt-4 pb-2 text-xs font-bold tracking-widest uppercase">
        Contacts
      </Text>
      {party.contact.map((c, i) => (
        <View key={i} className="border-border border-b py-3 last:border-0">
          {c.person && (
            <Text className="text-foreground mb-1 text-sm font-semibold">{c.person}</Text>
          )}
          <InfoRow icon={PhoneIcon} label="Phone" value={c.phone} />
          <InfoRow icon={MailIcon} label="Email" value={c.email} />
        </View>
      ))}
    </View>
  );
}

export function PartyBankingCard({ party }) {
  if (!party.bankingDetails?.bankName && !party.bankingDetails?.accountNumber) return null;

  return (
    <View className="bg-card border-border rounded-2xl border px-4 mx-4">
      <Text className="text-muted-foreground pt-4 pb-2 text-xs font-bold tracking-widest uppercase">
        Banking Details
      </Text>
      <InfoRow icon={BuildingIcon} label="Bank" value={party.bankingDetails?.bankName} />
      <InfoRow
        icon={CreditCardIcon}
        label="Account Number"
        value={party.bankingDetails?.accountNumber}
      />
      <InfoRow icon={HashIcon} label="IFSC Code" value={party.bankingDetails?.ifscCode} />
    </View>
  );
}
