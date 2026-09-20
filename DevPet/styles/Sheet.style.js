import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    sheet: {
        position: 'absolute',
        left: 10,
        right: 10,
        backgroundColor: '#0F172A',
        borderRadius: 24,
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "#1E3E62",
        paddingHorizontal: 20,
        paddingBottom: 32,
        paddingTop: 48,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 10,
    },
    closeBtn: {
        position: 'absolute',
        top: 12,
        right: 16,
        padding: 6,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        zIndex: 10,
    },
    scrollContent: {
        flex: 1,
    }
});