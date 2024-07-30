import {Alert, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import navigation from "../components/Navigation.js";
import {useRoute} from "@react-navigation/native";
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import {useState, useEffect } from "react";
import {get, getDatabase, ref, update} from "firebase/database";
import Dialog from 'react-native-dialog';


const StudentHomeScreen = () => {
    const [lessons, setLessons] = useState({});
    const [lessonsSet, setLessonsSet] = useState(new Set());
    const [visible, setVisible] = useState(false);
    const [selectedLessons, setSelectedLessons] = useState([]);
    const [data, setData] = useState([]); // dati prenotazioni


    const route = useRoute();
    const datiUtente = route.params?.dati;
    const tipoUtente = route.params?.tipo;
    const [studentId, setStudentId] = useState(null);


    //console.log("dati studente che ho: " + datiUtente);
    console.log(JSON.stringify(datiUtente, null, 2));


    useEffect(() => {
        // Fetch available lessons for the student

        const refLessons = ref(getDatabase(), 'lessons');
        get(refLessons)
            .then(snapshot => {
                if (snapshot.exists()) {
                    const lezioni = snapshot.val();
                    console.log(lezioni);
                    const prenotazioni = [];
                    const today = new Date();
                    console.log("oggi: " + today.getMonth());

                    for(const key in lezioni){
                        const lezione = lezioni[key];
                        const stringaData = lezione.data;
                        const elementiData = stringaData.split(" ");
                        const dataFormattata = `${elementiData[2]}-${elementiData[0].padStart(2, '0')}-${elementiData[1].padStart(2, '0')}`;

                        console.log("mese lezione: " + today.getUTCDay());
                        if(lezione.studente === '' &&
                            (
                                elementiData[0] >= today.getMonth() + 1 && elementiData[2] == today.getFullYear()

                            ) ||
                            (
                                elementiData[2] > today.getFullYear()

                            )

                        ){ // mettere condizioni se lo studente è dello stessa classe e stesso istituto
                            const refProf = ref(getDatabase(), 'teachers/' + lezione.professore);
                            get(refProf)
                                .then(snapshot => {
                                    if (snapshot.exists()) {
                                        const nomeProf = snapshot.val();
                                        //console.log("nomeProf: " + nomeProf.nome);
                                        fetchLessons(dataFormattata, lezione.materia, lezione.oraInizio, lezione.oraFine, nomeProf.nome ,key);
                                    }
                                })
                        }else if(lezione.studente === datiUtente.email &&
                            (
                                elementiData[0] >= today.getMonth() + 1 && elementiData[2] == today.getFullYear()

                            ) ||(

                                elementiData[0] == today.getMonth() + 1 && elementiData[2] == today.getFullYear() &&
                                    elementiData[1] > today.getDay()

                            ) ||
                            (
                                elementiData[2] > today.getFullYear()

                            )){

                            console.log("sono uguali");
                            console.log("nome utente: " + datiUtente.email +  "   e' uguale a: " + lezione.studente);
                            const refProf = ref(getDatabase(), 'teachers/' + lezione.professore);

                            get(refProf)
                                .then(snapshot => {
                                    if (snapshot.exists()) {
                                        const nomeProf = snapshot.val();
                                        //console.log("nomeProf: " + nomeProf.nome);

                                        if(lezione.studente === datiUtente.email){
                                            prenotazioni.push({
                                                key: key,
                                                data: dataFormattata,
                                                materia: lezione.materia,
                                                oraInizio: lezione.oraInizio,
                                                oraFine: lezione.oraFine,
                                                professore: nomeProf.nome,
                                                studente: lezione.studente
                                            });
                                        }


                                        console.log("pushato" + dataFormattata);
                                    }
                                })
                        }
                    }

                    setData(prenotazioni);
                    console.log("prenotazioni:", prenotazioni);

                }else {
                    console.log('Il percorso "lessons" nel database è vuoto o non esiste.');
                }
            })
    }, []);

    // Effetto che logga il contenuto di `data` quando viene aggiornato
    useEffect(() => {
        console.log('Data:', {setData});
    }, [data]);


    const fetchLessons = async (datalezione, materia, orarioInizio, orarioFine, nomeProf, id) => {
        // Replace with your data fetching logic
        setLessons(prevLessons => {
            const newLessons = { ...prevLessons };
            if (!newLessons[datalezione]) {
                newLessons[datalezione] = [];
            }
            newLessons[datalezione].push({ name: materia, lessonStart: orarioInizio, lessonEnd: orarioFine, teacher: nomeProf, id: id });
            return newLessons;
        });

        /*const fetchedLessons = {
            [datalezione]:[{ name: materia, time: orario }],

            // More lessons
        };
        setLessons(fetchedLessons);*/
    };
    const onDayPress = (day) => {
        const selectedDay = lessons[day.dateString];
        if (selectedDay) {
            setSelectedLessons(selectedDay);
            setVisible(true);
        } else {
            Alert.alert('No Lessons', 'There are no lessons available on this day.');
        }
    };

    const handleBooking = (lesson) => {
        console.log(`Lezione prenotata: ${lesson.name} at ${lesson.lessonStart}`);
        Alert.alert('Prenotazione', `Hai prenotato la lezione: ${lesson.name} alle ${lesson.lessonStart} - ${lesson.lessonEnd} con professorƏ: ${lesson.teacher}`);

        //console.log("percorso: " + percorso.toString().substring(50));
        const db = getDatabase();

        update(ref(db, "lessons/" + lesson.id), {studente: datiUtente.email})
            .then(() => {
                console.log('studente aggiunto alla lezione');

            })
            .catch((error) => {
                console.error('Errore durante l\'aggiornamento dei campi:', error);
            });

        const profRef = ref(db, `students/${datiUtente.id}/lessons`);
        update(profRef, { [lesson.id]: true })
            .then(() => {
                console.log('Lezione associata allo studente con successo.');
            })
            .catch(error => {
                console.error('Errore durante l\'aggiornamento del professore:', error);
            });

    };

    return(
        <View style={styles.container}>
            <Text>Home Studenti</Text>
            <Text>{tipoUtente}: {datiUtente.nome} {datiUtente.cognome}</Text>

            <View style={styles.calendar}>
                <Calendar
                    onDayPress={onDayPress}
                    markedDates={Object.keys(lessons).reduce((acc, date) => {
                        acc[date] = { marked: true };
                        return acc;
                    }, {})}
                    theme={{
                        selectedDayTextColor: '#2F6AAC', // colore del testo del giorno selezionato
                        //todayTextColor:  '#2F6AAC', // colore del testo del giorno corrente
                        arrowColor: '#2F6AAC', // colore delle frecce per navigare tra i mesi
                        //dotColor: '#2F6AAC', // colore del punto sotto i giorni marcati

                    }}
                />
            </View>
            <Dialog.Container visible={visible}>
                <Dialog.Title>Available Lessons</Dialog.Title>
                {selectedLessons.map((lesson, index) => (
                    <View key={index} style={styles.lessonContainer}>
                        <Text style={styles.lessonDescription}>
                            {`${lesson.name}\nOrario: ${lesson.lessonStart} - ${lesson.lessonEnd}\nProfessore: ${lesson.teacher}`}
                        </Text>
                        <TouchableOpacity
                            onPress={() => handleBooking(lesson)}
                            style={styles.dialogButton}>
                            <Text style={styles.dialogButtonText}>{`Prenota ${lesson.name}`}</Text>
                        </TouchableOpacity>
                    </View>
                ))}
                <Dialog.Button label="Cancel" onPress={() => setVisible(false)} />
            </Dialog.Container>


            <View style={styles.container}>
                <FlatList
                    data={data}
                    renderItem={({ item }) => (
                        <View style={styles.item}>
                            <Text>Data: {item.data}</Text>
                            <Text>Materia: {item.materia}</Text>
                            <Text>Professore: {item.professore}</Text>
                            <Text>Inizio Lezione: {item.oraInizio}</Text>
                            <Text>Fine Lezione: {item.oraFine}</Text>
                        </View>
                    )}
                    keyExtractor={item => item.key.toString()}
                />
            </View>
        </View>
    )
}

export default StudentHomeScreen

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginTop: 20,
        padding: 20,
        flex: 1,
    },
    calendar:{
        marginTop: 50,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        borderWidth: 2,
        borderRadius: 10,
        borderColor: '#2F6AAC',
    },
    lessonContainer: {
        marginVertical: 10,
        alignItems: 'center'
    },
    lessonDescription: {
        marginBottom: 10,
        fontSize: 16,
        textAlign: 'left'
    },
    dialogButton: {
        padding: 10,
        marginVertical: 5,
        backgroundColor: '#2F6AAC',
        borderRadius: 5,
        alignItems: 'center'
    },
    dialogButtonText: {
        color: 'white',
        fontSize: 16
    },

    item: {
        marginBottom: 10,
        padding: 10,
        backgroundColor: '#f9f9f9',
        borderRadius: 5,
    },
})
