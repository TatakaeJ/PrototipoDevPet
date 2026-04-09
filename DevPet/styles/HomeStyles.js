import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    background: {
        height: "100%"
    },
    body: {
        display: "flex",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        padding: 5
    },
    sections_cont: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between"
    },
    states_cont: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        width: 150,
        margin: 5
    },
    main_cont:{
        display: "flex",
    },
    pet_cont: {
        margin: "auto",
        width: "min-content"
    },
    actions_cont: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-evenly",
        margin: 5
    },
    points_cont: {
    },
    btn_cont: {
        borderRadius: 100,
        backgroundColor: "#FF6500",
        padding: 9,
        width: 45,
        height: 45
    },
    general_button: {
        color: "#FFFF",
    },
    img_pet: {
        width: 187,
        height: 208
    }
});
