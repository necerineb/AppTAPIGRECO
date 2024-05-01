import {StyleSheet, Text, View} from 'react-native'
import navigation from "../components/Navigation.js";
import {useRoute} from "@react-navigation/native";


const StudentHomeScreen = () => {

    const route = useRoute();
    const datiUtente = route.params?.dati;
    const tipoUtente = route.params?.tipo;
    console.log('tipo: ' + tipoUtente);


    return(
        <View>
            <Text>home</Text>
            <Text>{tipoUtente}: {datiUtente.nome} {datiUtente.cognome}</Text>

        </View>
    )
}

export default StudentHomeScreen

const styles = StyleSheet.create({
})
