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
        <View style={styles.container}>
            <Text>Home Professori</Text>
            <Text>Bentornato! {datiUtente.nome} {datiUtente.cognome}</Text>

            <View style={styles.comando}>
                <Button
                    text={"aggiugni lezione"}
                    onPress={() => navigation.navigate("Disponibilita", {
                        data: datiUtente
                    })}
                />
            </View>


        </View>
    )
}

export default HomeScreenT

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginTop: 20,
        padding: 20,
    },
    comando: {
        padding: 20,
        alignSelf: "center",
        width: '70%',
    }
})
