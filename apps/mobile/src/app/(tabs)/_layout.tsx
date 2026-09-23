import { Tabs } from 'expo-router';
import { Home, CheckSquare, Receipt } from 'lucide-react-native';
import { useColorScheme } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const tint = colorScheme === 'dark' ? 'hsl(250 84% 65%)' : 'hsl(250 84% 54%)'; // Primary color

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tint,
        headerShown: true,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="approvals"
        options={{
          title: 'Approvals',
          tabBarIcon: ({ color }) => <CheckSquare color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="reimbursements"
        options={{
          title: 'Reimbursements',
          tabBarIcon: ({ color }) => <Receipt color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}
