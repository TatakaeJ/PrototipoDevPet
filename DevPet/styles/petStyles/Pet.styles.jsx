import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
    petBox: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 20,
    },
    petImage: {
        width:       width * 0.48,
        height:      width * 0.48 * (208 / 187),
        resizeMode: 'contain',
    },
});