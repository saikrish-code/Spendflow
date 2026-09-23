import { View, Text, TextInput, TouchableOpacity, Alert, Image, ScrollView, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ReimbursementCreateSchema } from '@spendflow/shared/schemas';
import { api } from '@/api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { useRouter } from 'expo-router';

export default function NewReimbursementModal() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [image, setImage] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(ReimbursementCreateSchema),
    defaultValues: {
      employeeName: '',
      employeeEmail: '',
      amount: '',
      description: '',
      category: 'Travel' as const,
    }
  });

  const mutation = useMutation({
    mutationFn: (data: any) => api.createReimbursement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reimbursements'] });
      Alert.alert('Success', 'Reimbursement submitted!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    },
    onError: () => {
      Alert.alert('Error', 'Failed to submit reimbursement.');
    }
  });

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const onSubmit = (data: any) => {
    mutation.mutate({
      ...data,
      amount: Number(data.amount),
      receiptUrl: image,
    });
  };

  return (
    <ScrollView className="flex-1 bg-background p-4" keyboardShouldPersistTaps="handled">
      <Text className="text-2xl font-bold text-foreground mb-6">New Claim</Text>

      <View className="space-y-4">
        {/* Name */}
        <View className="mb-4">
          <Text className="text-foreground font-medium mb-1">Employee Name</Text>
          <Controller
            control={control}
            name="employeeName"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className={`border bg-card text-foreground px-4 py-3 rounded-md ${errors.employeeName ? 'border-destructive' : 'border-border'}`}
                placeholderTextColor="hsl(var(--muted-foreground))"
                placeholder="Full Name"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.employeeName && <Text className="text-destructive mt-1">{String(errors.employeeName.message)}</Text>}
        </View>

        {/* Email */}
        <View className="mb-4">
          <Text className="text-foreground font-medium mb-1">Email</Text>
          <Controller
            control={control}
            name="employeeEmail"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className={`border bg-card text-foreground px-4 py-3 rounded-md ${errors.employeeEmail ? 'border-destructive' : 'border-border'}`}
                placeholderTextColor="hsl(var(--muted-foreground))"
                placeholder="Email Address"
                keyboardType="email-address"
                autoCapitalize="none"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.employeeEmail && <Text className="text-destructive mt-1">{String(errors.employeeEmail.message)}</Text>}
        </View>

        {/* Amount */}
        <View className="mb-4">
          <Text className="text-foreground font-medium mb-1">Amount (₹)</Text>
          <Controller
            control={control}
            name="amount"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className={`border bg-card text-foreground px-4 py-3 rounded-md ${errors.amount ? 'border-destructive' : 'border-border'}`}
                placeholderTextColor="hsl(var(--muted-foreground))"
                placeholder="0.00"
                keyboardType="decimal-pad"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.amount && <Text className="text-destructive mt-1">{String(errors.amount.message)}</Text>}
        </View>

        {/* Description */}
        <View className="mb-4">
          <Text className="text-foreground font-medium mb-1">Description</Text>
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className={`border bg-card text-foreground px-4 py-3 rounded-md ${errors.description ? 'border-destructive' : 'border-border'}`}
                placeholderTextColor="hsl(var(--muted-foreground))"
                placeholder="What was this for?"
                multiline
                numberOfLines={3}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.description && <Text className="text-destructive mt-1">{String(errors.description.message)}</Text>}
        </View>

        {/* Receipt Upload */}
        <View className="mb-6">
          <Text className="text-foreground font-medium mb-2">Receipt</Text>
          <TouchableOpacity 
            onPress={pickImage}
            className="border border-dashed border-border rounded-md h-32 items-center justify-center bg-card"
          >
            {image ? (
              <Image source={{ uri: image }} className="w-full h-full rounded-md" resizeMode="cover" />
            ) : (
              <Text className="text-primary font-medium">Tap to upload receipt</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Submit */}
        <TouchableOpacity 
          className="bg-primary rounded-md py-4 items-center justify-center mb-8"
          onPress={handleSubmit(onSubmit)}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-primary-foreground font-bold text-lg">Submit Claim</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
