import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';

export default function BillDetailScreen() {
  const { id } = useLocalSearchParams();
  
  // Using getBills and finding by id since the mock API doesn't support get by ID strictly
  const { data, isLoading } = useQuery({
    queryKey: ['bills'],
    queryFn: api.getBills,
  });

  if (isLoading) {
    return <View className="flex-1 items-center justify-center bg-background"><ActivityIndicator /></View>;
  }

  const bill = data?.data?.find(b => b.id === id);

  if (!bill) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted-foreground">Bill not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background p-4">
      <View className="bg-card border border-border p-4 rounded-xl mb-4">
        <Text className="text-muted-foreground mb-1">Vendor</Text>
        <Text className="text-foreground text-xl font-bold mb-4">{bill.vendorName}</Text>
        
        <View className="flex-row justify-between mb-2">
          <Text className="text-muted-foreground">Amount</Text>
          <Text className="text-foreground font-bold">₹{bill.amount.toLocaleString('en-IN')}</Text>
        </View>
        <View className="flex-row justify-between mb-2">
          <Text className="text-muted-foreground">GST</Text>
          <Text className="text-foreground">₹{bill.gstAmount.toLocaleString('en-IN')}</Text>
        </View>
        <View className="border-t border-border my-2 pt-2 flex-row justify-between">
          <Text className="text-foreground font-bold">Total</Text>
          <Text className="text-primary font-bold text-lg">₹{bill.totalAmount.toLocaleString('en-IN')}</Text>
        </View>
      </View>

      <View className="bg-card border border-border p-4 rounded-xl mb-4">
        <Text className="text-muted-foreground mb-1">Status</Text>
        <View className="bg-primary/20 self-start px-2 py-1 rounded">
          <Text className="text-primary font-bold">{bill.status}</Text>
        </View>
        <Text className="text-muted-foreground mt-4 mb-1">Due Date</Text>
        <Text className="text-foreground">{bill.dueDate}</Text>
      </View>
    </ScrollView>
  );
}
