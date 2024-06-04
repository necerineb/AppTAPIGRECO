import {Alert, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
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

    const route = useRoute();
    const datiUtente = route.params?.dati;
    const tipoUtente = route.params?.tipo;

    useEffect(() => {
        // Fetch available lessons for the student

        const refLessons = ref(getDatabase(), 'lessons');
        get(refLessons)
            .then(snapshot => {
                if (snapshot.exists()) {

                    const lezioni = snapshot.val();
                    console.log(lezioni);

                    for(const key in lezioni){
                        const lezione = lezioni[key];
                        console.log(`----- lezione ${key} ------`);
                        console.log(`Elemento con chiave: ${key}`);
                        console.log(`Data: ${lezione.data}`);
                        console.log(`Materia: ${lezione.materia}`);
                        console.log(`OraFine: ${lezione.oraFine}`);
                        console.log(`OraInizio: ${lezione.oraInizio}`);

                        console.log(`Professore: ${lezione.professore}`);
                        console.log(`Studente: ${lezione.studente}`);
                        const stringaData = lezione.data;
                        const elementiData = stringaData.split(" ");
                        const dataFormattata = `${elementiData[2]}-${elementiData[0].padStart(2, '0')}-${elementiData[1].padStart(2, '0')}`;
                        console.log("ultima stampa" + dataFormattata); // Output: 2024-06-15

                        if(lezione.studente === ''){ // mettere condizioni se lo studente è dello stessa classe e stesso istituto

                            const refProf = ref(getDatabase(), 'teachers/' + lezione.professore);


                            get(refProf)
                                .then(snapshot => {
                                    if (snapshot.exists()) {
                                        const nomeProf = snapshot.val();
                                        console.log("nomeProf: " + nomeProf.nome);
                                        fetchLessons(dataFormattata, lezione.materia, lezione.oraInizio, lezione.oraFine, nomeProf.nome ,key);
                                    }
                                })

                        }

                    }

                }else {
                    console.log('Il percorso "lessons" nel database è vuoto o non esiste.');
                }

            })

    }, []);

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

        update(ref(db, "lessons/" + lesson.id), {studente: datiUtente.nome})
            .then(() => {
                console.log('studente aggiunto alla lezione');

            })
            .catch((error) => {
                console.error('Errore durante l\'aggiornamento dei campi:', error);
            });

        setVisible(false);
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
        </View>
    )
}

export default StudentHomeScreen

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginTop: 20,
        padding: 20,
    },
    calendar:{
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
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
    }
})
