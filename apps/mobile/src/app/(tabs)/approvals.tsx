import { View, Text, FlatList, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Swipeable } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { Check, X } from 'lucide-react-native';

export default function ApprovalsScreen() {
  const queryClient = useQueryClient();
  
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['approvals'],
    queryFn: api.getApprovals,
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.approveBill(id),
    onMutate: async (id) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await queryClient.cancelQueries({ queryKey: ['approvals'] });
      const previous = queryClient.getQueryData(['approvals']);
      
      queryClient.setQueryData(['approvals'], (old: any) => ({
        ...old,
        data: old.data.filter((b: any) => b.id !== id),
      }));
      
      return { previous };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(['approvals'], context?.previous);
      Alert.alert('Error', 'Failed to approve bill.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      queryClient.invalidateQueries({ queryKey: ['bills'] });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string, reason: string }) => api.rejectBill(id, reason),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    }
  });

  if (isLoading) {
    return <View className="flex-1 items-center justify-center bg-background"><Text className="text-muted-foreground">Loading...</Text></View>;
  }

  const bills = data?.data || [];

  const renderRightActions = (id: string) => (
    <View className="flex-row">
      <TouchableOpacity 
        className="bg-destructive w-20 justify-center items-center h-full"
        onPress={() => {
          Alert.prompt('Reject Bill', 'Please provide a reason:', [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Reject', 
              style: 'destructive',
              onPress: (reason) => {
                if (!reason) return Alert.alert('Error', 'Reason is required');
                rejectMutation.mutate({ id, reason });
              }
            }
          ]);
        }}
      >
        <X color="white" size={24} />
      </TouchableOpacity>
    </View>
  );

  const renderLeftActions = (id: string) => (
    <View className="flex-row">
      <View className="bg-green-500 w-20 justify-center items-center h-full">
        <Check color="white" size={24} />
      </View>
    </View>
  );

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} className="flex-1 bg-background">
      <FlatList
        data={bills}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View className="items-center justify-center py-10">
            <Text className="text-lg text-muted-foreground">All caught up! 🎉</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className="mb-4 bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <Swipeable
              renderRightActions={() => renderRightActions(item.id)}
              renderLeftActions={() => renderLeftActions(item.id)}
              onSwipeableOpen={(direction) => {
                if (direction === 'left') {
                  approveMutation.mutate(item.id);
                }
              }}
            >
              <View className="p-4 bg-card">
                <View className="flex-row justify-between items-start mb-2">
                  <Text className="font-bold text-lg text-foreground flex-1">{item.vendorName}</Text>
                  <Text className="font-bold text-lg text-foreground">₹{item.totalAmount.toLocaleString('en-IN')}</Text>
                </View>
                <Text className="text-muted-foreground text-sm mb-2">{item.category}</Text>
                <Text className="text-muted-foreground text-xs">Due: {item.dueDate}</Text>
              </View>
            </Swipeable>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
