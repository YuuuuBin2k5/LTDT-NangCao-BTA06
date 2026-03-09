import { Tabs } from "expo-router";
import CustomTabBar from "../../../src/components/CustomTabBar";

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          title: "Bảng tin",
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: "Bạn bè",
        }}
      />
      <Tabs.Screen
        name="missions"
        options={{
          title: "Nhiệm vụ",
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Cài đặt",
        }}
      />
    </Tabs>
  );
}
