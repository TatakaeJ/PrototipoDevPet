import { ImageBackground, View, Text, TouchableOpacity, Image } from "react-native";
import { styles } from "../styles/HomeStyles";
import { BrainCog, ShoppingCart, ClipboardList, Gem, Droplet, BatteryMedium, Heart } from 'lucide-react-native';

export default function HomeScreen({ navigation }) {
    return (
        <ImageBackground
            source={require('../assets/RoomBedBackground.png')}
            style={styles.background}
        >
            <View style={styles.body}>
                <View style={styles.sections_cont}>
                    <View style={styles.states_cont}>
                        <TouchableOpacity style={styles.btn_cont}>
                            <BrainCog size={27} strokeWidth={1} style={styles.general_button}/>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.btn_cont}>
                            <ShoppingCart size={27} strokeWidth={1} style={styles.general_button}/>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.btn_cont}>
                            <ClipboardList size={27} strokeWidth={1} style={styles.general_button}/>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.points_cont}>
                        <TouchableOpacity style={styles.btn_cont}>
                            <Gem size={30} strokeWidth={1} style={styles.general_button}/>
                            <Text>0</Text>
                        </TouchableOpacity> 
                    </View>
                </View>
                <View style={styles.main_cont}>  
                    <View style={styles.pet_cont}>
                        <Image source={require("../assets/FullPet.png")} style={styles.img_pet}/>
                    </View>
                </View>                
                <View style={styles.actions_cont}>
                    <TouchableOpacity style={styles.btn_cont}>
                        <Droplet size={27} strokeWidth={1} style={styles.general_button}/>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btn_cont}>
                        <BatteryMedium size={27} strokeWidth={1} style={styles.general_button}/>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btn_cont}>
                        <Heart size={27} strokeWidth={1} style={styles.general_button}/>
                    </TouchableOpacity>
                </View>
            </View>
        </ImageBackground>
    )
}