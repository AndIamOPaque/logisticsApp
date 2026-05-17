import React, { useState } from 'react';
import { View, ScrollView, ActivityIndicator, TouchableOpacity, Image, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeftIcon, LinkIcon, FileText, UploadIcon, FileIcon, XIcon, DownloadIcon, CheckCircleIcon, PencilIcon, TrashIcon } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import Toast from 'react-native-toast-message';

import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchBillById, attachBillFile, uploadFile, markBillPaid, deleteBill, updateBill } from '@/api/bill';
import { SERVER_URL } from '@/api/client';
import { EditBillModal, LinkDeliveryModal } from '@/components/bill/billModals';
import ConfirmDialog from '@/components/ui/confirmDialog';

export default function BillDetailPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const qc = useQueryClient();

  const [uploading, setUploading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [editVisible, setEditVisible] = useState(false);
  const [linkDeliveryVisible, setLinkDeliveryVisible] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState(false);

  const { data, isPending, error } = useQuery({
    queryKey: ['bill', id],
    queryFn: () => fetchBillById(id),
  });

  const attachMutation = useMutation({
    mutationFn: (attachment) => attachBillFile(id, attachment),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bill', id] });
      Toast.show({ type: 'success', text1: 'Attachment Added' });
    },
  });

  const payMutation = useMutation({
    mutationFn: (data) => markBillPaid(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bill', id] });
      Toast.show({ type: 'success', text1: 'Bill marked as Paid' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteBill(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bills'] });
      router.back();
      Toast.show({ type: 'success', text1: 'Bill deleted' });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => updateBill(id, { status: 'CANCELLED' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bill', id] });
      qc.invalidateQueries({ queryKey: ['bills'] });
      Toast.show({ type: 'success', text1: 'Bill cancelled' });
    },
  });

  const handleMarkPaid = () => {
    payMutation.mutate({
      paymentMethod: bill?.paymentMethod || 'CASH',
      paymentDate: new Date(),
    });
  };

  const pickAndUploadImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Toast.show({ type: 'error', text1: 'Permission Denied' });
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.[0]) {
      handleUpload(result.assets[0].uri);
    }
  };

  const pickAndUploadDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
      if (!result.canceled && result.assets?.[0]) {
        handleUpload(result.assets[0].uri);
      }
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Error picking document' });
    }
  };

  const handleUpload = async (uri) => {
    try {
      setUploading(true);
      const uploadRes = await uploadFile(uri);
      if (uploadRes.success) {
        attachMutation.mutate({
          url: uploadRes.data.url,
          fileType: uploadRes.data.fileType,
          caption: 'Attachment',
        });
      }
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Upload failed', text2: err.message });
    } finally {
      setUploading(false);
    }
  };

  const downloadAndShare = async (url) => {
    try {
      // url is typically a relative path like '/uploads/file.jpg'
      const cleanUrl = url.startsWith('/') ? url : `/${url}`;
      const fullUrl = `${SERVER_URL}${cleanUrl}`;
      const filename = url.split('/').pop() || 'downloaded_file';
      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      
      const downloadRes = await FileSystem.downloadAsync(fullUrl, fileUri);
      
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(downloadRes.uri);
      } else {
        Toast.show({ type: 'info', text1: 'Saved to documents', text2: fileUri });
      }
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Download failed', text2: err.message });
    }
  };

  const bill = data?.data;

  if (isPending) {
    return (
      <SafeAreaView style={{ flex: 1 }} className="bg-background items-center justify-center" edges={['top']}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }
  if (error || !bill) {
    return (
      <SafeAreaView style={{ flex: 1 }} className="bg-background items-center justify-center" edges={['top']}>
        <Text className="text-destructive text-center p-10">Error loading bill.</Text>
        <Button variant="outline" size="sm" onPress={() => router.back()}>
          <Text>Go Back</Text>
        </Button>
      </SafeAreaView>
    );
  }

  const isIncome = bill.type === 'INCOME';

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']} className="bg-background">
      {/* Dense Header */}
      <View className="border-border bg-card flex-row items-center justify-between border-b px-4 pt-4 pb-3">
        <Button variant="ghost" size="icon" onPress={() => router.back()} className="rounded-xl">
          <Icon as={ChevronLeftIcon} className="text-foreground size-5" />
        </Button>
        <View className="mx-3 flex-1">
          <Text className="text-foreground text-base font-bold" numberOfLines={1}>
            Bill #{bill._id.substring(0, 8)}
          </Text>
          <Text className="text-muted-foreground text-xs">{bill.category}</Text>
        </View>
        <View className="flex-row gap-x-2">
          {bill.status !== 'CANCELLED' && (
            <Button variant="outline" size="icon" onPress={() => setCancelConfirm(true)} className="rounded-xl border-destructive">
              <Icon as={XIcon} className="text-destructive size-4" />
            </Button>
          )}
          <Button variant="destructive" size="icon" onPress={() => setDeleteConfirm(true)} className="rounded-xl">
            <Icon as={TrashIcon} className="text-white size-4" />
          </Button>
          <Button variant="outline" size="icon" onPress={() => setLinkDeliveryVisible(true)} className="rounded-xl">
            <Icon as={LinkIcon} className="text-foreground size-4" />
          </Button>
          <Button variant="outline" size="icon" onPress={() => setEditVisible(true)} className="rounded-xl">
            <Icon as={PencilIcon} className="text-foreground size-4" />
          </Button>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerClassName="pb-20">

        {/* Status Banner */}
        <View className="bg-card border-b border-border px-4 py-4 flex-row items-center justify-between">
          <View>
            <Text className="text-muted-foreground text-xs uppercase tracking-widest font-bold mb-1">
              Grand Total
            </Text>
            <Text className={`text-3xl font-black ${isIncome ? 'text-green-500' : 'text-foreground'}`}>
              ₹{bill.grandTotal?.toLocaleString() || 0}
            </Text>
          </View>
          <Badge variant={bill.status === 'PAID' ? 'default' : bill.status === 'PENDING' ? 'secondary' : 'destructive'}>
            <Text>{bill.status}</Text>
          </Badge>
        </View>

        {/* Action & Payment Info row */}
        <View className="bg-card border-b border-border px-4 py-3 flex-row items-center justify-between">
          <View>
            <Text className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest">Payment Method</Text>
            <Text className="text-foreground font-semibold text-sm mt-0.5">
              {bill.paymentMethod} {bill.paymentDate ? `• ${new Date(bill.paymentDate).toLocaleDateString()}` : ''}
            </Text>
          </View>
          {bill.status !== 'PAID' && bill.status !== 'CANCELLED' && (
            <TouchableOpacity
              onPress={handleMarkPaid}
              disabled={payMutation.isPending}
              className="bg-primary px-3 py-1.5 rounded-full flex-row items-center gap-x-1.5">
              <Icon as={CheckCircleIcon} className="text-primary-foreground size-3.5" />
              <Text className="text-primary-foreground text-xs font-bold uppercase tracking-wide">
                {payMutation.isPending ? 'Saving...' : 'Mark Paid'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Linked Delivery */}
        {bill.linkedDelivery && (
          <TouchableOpacity
            onPress={() => router.push(`/delivery/${bill.linkedDelivery._id ?? bill.linkedDelivery}`)}
            className="bg-blue-500/10 border-b border-blue-500/20 px-4 py-3 flex-row items-center justify-between mt-4">
            <View className="flex-row items-center gap-x-2">
              <Icon as={LinkIcon} className="text-blue-500 size-4" />
              <View>
                <Text className="text-blue-500 font-bold text-sm">Linked to Delivery</Text>
                <Text className="text-blue-500/70 text-xs">
                  #{(bill.linkedDelivery._id ?? bill.linkedDelivery).toString().substring(0, 8)}
                  {bill.linkedDelivery.status ? ` • ${bill.linkedDelivery.status}` : ''}
                </Text>
              </View>
            </View>
            <Text className="text-blue-500 font-medium text-xs">View →</Text>
          </TouchableOpacity>
        )}

        {/* Attachments Section */}
        <View className="bg-card border-b border-border mt-4">
          <View className="px-4 py-3 border-b border-border flex-row justify-between items-center">
            <Text className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
              Receipt Photos
            </Text>
            <View className="flex-row gap-x-2">
              <TouchableOpacity
                onPress={pickAndUploadDocument}
                disabled={uploading || attachMutation.isPending}
                className="bg-muted px-3 py-1.5 rounded flex-row items-center gap-x-1">
                <Icon as={FileIcon} className="text-foreground size-3" />
                <Text className="text-foreground text-xs font-semibold">PDF</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={pickAndUploadImage}
                disabled={uploading || attachMutation.isPending}
                className="bg-muted px-3 py-1.5 rounded flex-row items-center gap-x-1">
                {uploading || attachMutation.isPending ? (
                  <ActivityIndicator size="small" />
                ) : (
                  <>
                    <Icon as={UploadIcon} className="text-foreground size-3" />
                    <Text className="text-foreground text-xs font-semibold">Upload</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View className="px-4 py-4 flex-row flex-wrap gap-2">
            {bill.attachments?.length > 0 ? (
              bill.attachments.map((att) => {
                const isPdf = att.fileType === 'pdf';
                const fullUrl = `${SERVER_URL}${att.url}`;
                return (
                  <TouchableOpacity
                    key={att._id}
                    onPress={() => {
                      if (isPdf) {
                        downloadAndShare(att.url);
                      } else {
                        setPreviewUrl(fullUrl);
                        setPreviewVisible(true);
                      }
                    }}
                    className="border border-border rounded-lg overflow-hidden relative"
                    style={{ width: 100, height: 100 }}>
                    {isPdf ? (
                      <View className="bg-muted w-full h-full items-center justify-center">
                        <Icon as={FileText} className="text-destructive size-8 mb-1" />
                        <Text className="text-xs font-bold text-muted-foreground">PDF</Text>
                      </View>
                    ) : (
                      <Image source={{ uri: fullUrl }} style={{ width: 100, height: 100 }} resizeMode="cover" />
                    )}
                  </TouchableOpacity>
                );
              })
            ) : (
              <Text className="text-muted-foreground text-sm">No photos attached.</Text>
            )}
          </View>
        </View>

        {/* Parties */}
        <View className="bg-card border-b border-border mt-4">
          <View className="px-4 py-3 border-b border-border">
            <Text className="text-muted-foreground text-xs font-bold tracking-widest uppercase">Parties</Text>
          </View>
          <View className="px-4 py-3 flex-row justify-between border-b border-border">
            <Text className="text-muted-foreground text-sm">From</Text>
            <Text className="text-foreground font-semibold">{bill.from?.party?.name || bill.from?.name || 'N/A'}</Text>
          </View>
          <View className="px-4 py-3 flex-row justify-between">
            <Text className="text-muted-foreground text-sm">To</Text>
            <Text className="text-foreground font-semibold">{bill.to?.party?.name || bill.to?.name || 'N/A'}</Text>
          </View>
        </View>

      </ScrollView>

      {/* Full Screen Image Preview Modal */}
      <Modal visible={previewVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/90 justify-center items-center">
          <SafeAreaView className="absolute top-0 w-full flex-row justify-between px-4 py-2 z-10">
            <TouchableOpacity onPress={() => setPreviewVisible(false)} className="bg-black/50 p-2 rounded-full">
              <Icon as={XIcon} className="text-white size-6" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => previewUrl && downloadAndShare(previewUrl.replace(SERVER_URL, ''))}
              className="bg-black/50 p-2 rounded-full">
              <Icon as={DownloadIcon} className="text-white size-6" />
            </TouchableOpacity>
          </SafeAreaView>
          {previewUrl && (
            <Image source={{ uri: previewUrl }} style={{ width: '100%', height: '80%' }} resizeMode="contain" />
          )}
        </View>
      </Modal>

      <ConfirmDialog
        visible={cancelConfirm}
        title="Cancel Bill"
        message="Are you sure you want to cancel this bill? This action can be reversed by editing the bill status."
        confirmText="Cancel Bill"
        variant="destructive"
        onConfirm={() => {
          cancelMutation.mutate();
          setCancelConfirm(false);
        }}
        onCancel={() => setCancelConfirm(false)}
      />

      <ConfirmDialog
        visible={deleteConfirm}
        title="Delete Bill"
        message="Are you sure you want to completely delete this bill? This action CANNOT be undone."
        confirmText="Delete Permanently"
        variant="destructive"
        onConfirm={() => {
          deleteMutation.mutate();
          setDeleteConfirm(false);
        }}
        onCancel={() => setDeleteConfirm(false)}
      />

      <EditBillModal bill={bill} visible={editVisible} onClose={() => setEditVisible(false)} />
      <LinkDeliveryModal bill={bill} visible={linkDeliveryVisible} onClose={() => setLinkDeliveryVisible(false)} />
    </SafeAreaView>
  );
}
