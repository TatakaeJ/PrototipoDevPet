import { ImageBackground, View, Text, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from "../styles/HomeStyles";
import { BrainCog, ShoppingCart, ClipboardList, Gem, Droplet, BatteryMedium, Heart } from 'lucide-react-native';

export default function HomeScreen({ navigation }) {
    return (
        <ImageBackground
            source={require('../assets/RoomBedBackground.png')}
            style={styles.background}
            resizeMode="cover"
        >
            <SafeAreaView style={styles.body}>
                <View style={styles.sections_cont}>
                    <View style={styles.states_cont}>
                        <TouchableOpacity style={styles.btn_cont}>
                            <BrainCog size={27} strokeWidth={1} style={styles.general_button} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.btn_cont}>
                            <ShoppingCart size={27} strokeWidth={1} style={styles.general_button} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.btn_cont}>
                            <ClipboardList size={27} strokeWidth={1} style={styles.general_button} />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.points_btn}>
                        <Gem size={22} strokeWidth={1} color="#fff" />
                        <Text style={styles.points_text}>0</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.main_cont}>
                    <Image source={require("../assets/FullPet.png")} style={styles.img_pet} />
                </View>
                <View style={styles.actions_cont}>
                    <TouchableOpacity style={styles.btn_cont}>
                        <Droplet size={27} strokeWidth={1} style={styles.general_button} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btn_cont}>
                        <BatteryMedium size={27} strokeWidth={1} style={styles.general_button} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btn_cont}>
                        <Heart size={27} strokeWidth={1} style={styles.general_button} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </ImageBackground>
    );
}