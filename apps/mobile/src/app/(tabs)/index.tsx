import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['cashflow'],
    queryFn: api.getCashflow,
  });

  const { data: billsData, isLoading: billsLoading } = useQuery({
    queryKey: ['bills'],
    queryFn: api.getBills,
  });

  if (isLoading || billsLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted-foreground">Loading dashboard...</Text>
      </View>
    );
  }

  const upcoming = (billsData?.data || [])
    .filter(b => !['Paid', 'Rejected'].includes(b.status))
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} className="flex-1 bg-background">
      <ScrollView
        className="flex-1 p-4"
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        <Text className="text-xl font-bold text-foreground mb-4">Dashboard</Text>
        
        {/* KPI Cards */}
        <View className="flex-row flex-wrap gap-2 mb-6">
          <View className="bg-card border border-border p-4 rounded-xl flex-1 min-w-[45%]">
            <Text className="text-muted-foreground text-sm">Cash Out This Month</Text>
            <Text className="text-foreground text-2xl font-bold mt-1">
              ₹{((data?.summary?.totalActual || 0) / 1000).toFixed(0)}k
            </Text>
          </View>
          <View className="bg-card border border-border p-4 rounded-xl flex-1 min-w-[45%]">
            <Text className="text-muted-foreground text-sm">Forecasted Cashflow</Text>
            <Text className="text-foreground text-2xl font-bold mt-1">
              ₹{((data?.summary?.totalForecast || 0) / 1000).toFixed(0)}k
            </Text>
          </View>
          <View className="bg-card border border-border p-4 rounded-xl flex-1 min-w-[45%]">
            <Text className="text-muted-foreground text-sm">Net Position</Text>
            <Text className="text-primary text-2xl font-bold mt-1">
              ₹{((data?.summary?.netCashflow || 0) / 1000).toFixed(0)}k
            </Text>
          </View>
        </View>

        {/* Upcoming Payments */}
        <Text className="text-lg font-bold text-foreground mb-3">Upcoming Payments</Text>
        <View className="bg-card border border-border rounded-xl overflow-hidden mb-8">
          {upcoming.map((bill, i) => (
            <View key={bill.id} className={`p-4 flex-row justify-between items-center ${i !== upcoming.length - 1 ? 'border-b border-border' : ''}`}>
              <View>
                <Text className="text-foreground font-medium">{bill.vendorName}</Text>
                <Text className="text-muted-foreground text-sm">Due {bill.dueDate}</Text>
              </View>
              <Text className="text-foreground font-bold">₹{bill.totalAmount.toLocaleString('en-IN')}</Text>
            </View>
          ))}
          {upcoming.length === 0 && (
            <Text className="p-4 text-muted-foreground">No upcoming payments</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
