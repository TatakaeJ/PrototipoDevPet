import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    padding: 20,
  },
  modeTitle: {
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 30,
    letterSpacing: 1.5,
  },
  timerCircle: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: (width * 0.7) / 2,
    borderWidth: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    marginBottom: 50,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
  },
  timerText: {
    fontSize: 70,
    fontWeight: "bold",
    color: "#1E293B",
    fontVariant: ["tabular-nums"],
  },
  statusText: {
    fontSize: 12,
    color: "#94A3B8",
    letterSpacing: 3,
    fontWeight: "700",
    marginTop: -5,
  },
  controls: {
    alignItems: "center",
    width: "100%",
  },
  mainButton: {
    width: "80%",
    paddingVertical: 18,
    borderRadius: 35,
    alignItems: "center",
    marginBottom: 20,
    elevation: 3,
  },
  buttonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  resetButton: {
    padding: 10,
  },
  resetText: {
    color: "#94A3B8",
    fontSize: 14,
    fontWeight: "600",
  },
  message: {
    marginTop: 30,
    color: "#334155",
    fontWeight: "500",
    textAlign: "center",
  },
});