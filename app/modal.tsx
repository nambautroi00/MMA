import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ModalScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.card}>
        <View style={styles.iconBox}>
          <MaterialIcons name="assignment" size={32} color="#FFF9F1" />
        </View>
        <Text style={styles.title}>Assignment 1</Text>
        <Text style={styles.text}>
          This Expo app rebuilds the starter template into a clean task list
          with filtering, priorities, completion status, and a small insights
          screen.
        </Text>
        <Link href="/" dismissTo style={styles.link}>
          Back to tasks
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    alignItems: "center",
    backgroundColor: "#FFF9F1",
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#EEE4D8",
    borderRadius: 8,
    borderWidth: 1,
    padding: 24,
    width: "100%",
  },
  iconBox: {
    alignItems: "center",
    backgroundColor: "#193C3A",
    borderRadius: 8,
    height: 64,
    justifyContent: "center",
    width: 64,
  },
  title: {
    color: "#25211D",
    fontSize: 28,
    fontWeight: "800",
    marginTop: 18,
  },
  text: {
    color: "#746D64",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
    textAlign: "center",
  },
  link: {
    color: "#193C3A",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 22,
    paddingVertical: 8,
  },
});
