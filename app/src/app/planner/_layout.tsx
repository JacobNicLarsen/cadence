import { Stack } from 'expo-router';

export default function PlannerLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="new" options={{ title: 'New Habit', presentation: 'modal' }} />
      <Stack.Screen name="[id]" options={{ title: 'Edit Habit', presentation: 'modal' }} />
    </Stack>
  );
}
