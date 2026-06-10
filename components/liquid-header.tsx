import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/app-context";

type LiquidHeaderProps = {
  showNotifications?: boolean;
  showSearch?: boolean;
};

export function LiquidHeader({
  showNotifications = false,
  showSearch = false,
}: LiquidHeaderProps) {
  const {
    settings,
    isFocusTimerStarted,
    focusSecondsRemaining,
    activeFocusTask,
    setShowFocusTimerModal,
  } = useApp();
  const isDark = settings.darkMode;
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.topBar,
        {
          top: insets.top + 8, // Dynamically set position below notch/status bar!
          backgroundColor: isDark
            ? "rgba(18, 28, 24, 0.92)"
            : "rgba(255, 255, 255, 0.88)",
          borderColor: isDark
            ? "rgba(255, 255, 255, 0.12)"
            : "rgba(255, 255, 255, 0.8)",
        },
      ]}
    >
      <View
        style={[
          styles.brand,
          {
            backgroundColor: isDark
              ? "rgba(255, 255, 255, 0.05)"
              : "rgba(255, 255, 255, 0.46)",
            borderColor: isDark
              ? "rgba(255, 255, 255, 0.08)"
              : "rgba(255, 255, 255, 0.74)",
          },
        ]}
      >
        <Image
          source={require("@/assets/images/app.png")}
          style={styles.avatar}
        />
        <Text
          style={[styles.brandText, { color: isDark ? "#EFFBF3" : "#557866" }]}
        >
          TaskFlow
        </Text>
      </View>
      <View style={styles.topActions}>
        {isFocusTimerStarted && activeFocusTask && (
          <Pressable
            onPress={() => setShowFocusTimerModal(true)}
            style={[
              styles.miniTimerPill,
              {
                backgroundColor: isDark
                  ? "rgba(59, 130, 246, 0.12)"
                  : "rgba(95, 128, 109, 0.12)",
                borderColor: isDark
                  ? "rgba(59, 130, 246, 0.2)"
                  : "rgba(95, 128, 109, 0.2)",
              },
            ]}
          >
            <MaterialIcons
              name="timer"
              size={13}
              color={isDark ? "#3B82F6" : "#5F806D"}
            />
            <Text
              style={[
                styles.miniTimerText,
                { color: isDark ? "#3B82F6" : "#5F806D" },
              ]}
            >
              {Math.floor(focusSecondsRemaining / 60)}:
              {(focusSecondsRemaining % 60).toString().padStart(2, "0")}
            </Text>
          </Pressable>
        )}
        {showSearch ? (
          <View
            style={[
              styles.actionButton,
              {
                backgroundColor: isDark
                  ? "rgba(255, 255, 255, 0.05)"
                  : "rgba(255, 255, 255, 0.48)",
                borderColor: isDark
                  ? "rgba(255, 255, 255, 0.08)"
                  : "rgba(255, 255, 255, 0.78)",
              },
            ]}
          >
            <MaterialIcons
              name="search"
              size={19}
              color={isDark ? "#EFFBF3" : "#587A6C"}
            />
          </View>
        ) : null}
        {showNotifications ? (
          <View
            style={[
              styles.actionButton,
              {
                backgroundColor: isDark
                  ? "rgba(255, 255, 255, 0.05)"
                  : "rgba(255, 255, 255, 0.48)",
                borderColor: isDark
                  ? "rgba(255, 255, 255, 0.08)"
                  : "rgba(255, 255, 255, 0.78)",
              },
            ]}
          >
            <MaterialIcons
              name="notifications-none"
              size={19}
              color={isDark ? "#EFFBF3" : "#587A6C"}
            />
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    position: "absolute",
    left: 12,
    right: 12,
    alignItems: "center",
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 56,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: "#6D8B7A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    zIndex: 10,
  },
  brand: {
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    paddingBottom: 5,
    paddingLeft: 5,
    paddingRight: 12,
    paddingTop: 5,
  },
  avatar: {
    borderRadius: 16,
    height: 28,
    width: 28,
  },
  brandText: {
    fontSize: 17,
    fontWeight: "600",
  },
  topActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    alignItems: "center",
    borderRadius: 17,
    borderWidth: 1,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  miniTimerPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 14,
    borderWidth: 1,
    height: 34,
    paddingHorizontal: 10,
    justifyContent: "center",
  },
  miniTimerText: {
    fontSize: 11,
    fontWeight: "800",
  },
});
