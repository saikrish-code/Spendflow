import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';

export default function ReimbursementsScreen() {
  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} className="flex-1 bg-background p-4">
      <View className="flex-1 items-center justify-center">
        <Text className="text-lg text-muted-foreground mb-4">Reimbursements List</Text>
        <Link href="/new-reimbursement" asChild>
          <TouchableOpacity className="bg-primary px-6 py-3 rounded-md">
            <Text className="text-primary-foreground font-bold">New Reimbursement</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
}
