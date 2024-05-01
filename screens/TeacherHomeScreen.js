import {StyleSheet, Text, View} from 'react-native'
import navigation from "../components/Navigation.js";
import {useNavigation, useRoute} from "@react-navigation/native";
import Button from "../components/CustomButton";


const HomeScreenT = () => {
    const route = useRoute();
    const datiUtente = route.params?.dati;
    const tipoUtente = route.params?.tipo;
    //console.log('tipo: ' + tipoUtente);
    const navigation = useNavigation();

    console.log("datiUtente Home : " + JSON.stringify(datiUtente));

    return(
        <View>
            <Text>Home Professori</Text>
            <Text>Bentornato! {datiUtente.nome} {datiUtente.cognome}</Text>

            <Button
                text={"aggiugni lezione"}
                onPress={() => navigation.navigate("Disponibilita", {
                    data: datiUtente
                })}
            />

        </View>
    )
}

export default HomeScreenT

const styles = StyleSheet.create({
})
