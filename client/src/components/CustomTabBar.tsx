import React from "react";
import { View, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const TAB_WIDTH = width / 5;

const icons: { [key: string]: any } = {
  index: "home",
  feed: "newspaper",
  chat: "chatbubbles",
  friends: "people",
  settings: "settings",
};

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const translateX = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  React.useEffect(() => {
    translateX.value = withSpring(state.index * TAB_WIDTH, {
      damping: 30,
      stiffness: 100,
    });
  }, [state.index, translateX]);

  return (
    <View style={styles.container}>
      {/* Curved background */}
      <View style={styles.curvedBackground}>
        <Animated.View style={[styles.activeIndicator, animatedStyle]} />
      </View>

      {/* Tab buttons */}
      <View style={styles.tabContainer}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const iconName = icons[route.name] || "ellipse";

          return (
            <TabButton
              key={route.key}
              isFocused={isFocused}
              onPress={onPress}
              iconName={iconName}
            />
          );
        })}
      </View>
    </View>
  );
}

function TabButton({
  isFocused,
  onPress,
  iconName,
}: {
  isFocused: boolean;
  onPress: () => void;
  iconName: string;
}) {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withSpring(isFocused ? 1.05 : 1, {
      damping: 30,
      stiffness: 80,
    });
    translateY.value = withSpring(isFocused ? -4 : 0, {
      damping: 30,
      stiffness: 80,
    });
  }, [isFocused, scale, translateY]);

  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }, { translateY: translateY.value }],
    };
  });

  const animatedBackgroundStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isFocused ? 0.15 : 0, { duration: 400 }),
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.tabButton}
      activeOpacity={0.7}
    >
      <Animated.View style={[styles.iconBackground, animatedBackgroundStyle]} />
      <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
        <Ionicons
          name={iconName as any}
          size={24}
          color={isFocused ? "#3498db" : "#999"}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: "transparent",
  },
  curvedBackground: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  activeIndicator: {
    position: "absolute",
    top: 0,
    left: 0,
    width: TAB_WIDTH,
    height: 3,
    backgroundColor: "#3498db",
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  tabContainer: {
    flexDirection: "row",
    height: "100%",
    alignItems: "center",
    paddingBottom: 12,
  },
  tabButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  iconBackground: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#3498db",
    zIndex: 1,
  },
});
