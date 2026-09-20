import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        alignSelf: "center",
    },
    particle: {
        position: 'absolute',
        width: 40,
        height: 40,
        resizeMode: 'contain',
        left: "50%",
        bottom: 0,
    },
});