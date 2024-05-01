import {Alert, StyleSheet, Text, View} from 'react-native'
import navigation from "../components/Navigation.js";
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import RNPickerSelect from 'react-native-picker-select';
import Button from "../components/CustomButton";
import React, { useState } from 'react';
import {useRoute} from "@react-navigation/native";
import { getDatabase, ref, query, equalTo, orderByChild, get, child, push, set } from "firebase/database";


const AddDisponibility = () => {
    console.log("dentro");
    const route = useRoute();
    const datiUtente = route.params?.data;
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [isTimePickerVisible, setTimePickerVisibility] = useState(false);

    const [selectedDate, setSelectedDate] = useState(null); // Stato per la data selezionata
    const [selectedTime, setSelectedTime] = useState(null); // Stato per l'ora selezionata
    const [selectedSubject, setSelectedSubject] = useState(null); // Stato per la materia selezionata

    console.log("datiUtente: " + datiUtente.nome);
    const subjectsArray = datiUtente.materie;
    console.log("materie? " + subjectsArray);
    console.log("porcodio" +  JSON.stringify(JSON.stringify(datiUtente)));

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleDateConfirm = (date: Date) => {
        setSelectedDate(date);
        hideDatePicker();
    };

    const showTimePicker = () => {
        setTimePickerVisibility(true);
    };

    const hideTimePicker = () => {
        setTimePickerVisibility(false);
    };

    const handleTimeConfirm = (time: Date) => {
        setSelectedTime(time);
        hideTimePicker();
    };

    const renderPickerOptions = () => {
        if (Array.isArray(subjectsArray) && subjectsArray.length > 0) {
            return subjectsArray.map((subject: any) => ({
                label: subject,
                value: subject
            }));
        } else {
            return [];
        }
    };


    const createDisponibility = async () => {
        try{
            const dispRef = ref(getDatabase(), 'lessons');
            const newDispRef = push(dispRef);

            console.log('orario: ' + selectedDate.getMonth())
            console.log('orario: ' + selectedDate?.getDate())
            console.log('orario2: ' + selectedTime)
            const mese = selectedDate?.getMonth() + 1;
            const data = mese + ' ' +  selectedDate?.getDate() + ' ' + selectedDate?.getFullYear();
            const orario = selectedTime?.getHours() + ':' + selectedTime?.getMinutes();

            const newDispData ={
                data: data,
                ora: orario,
                materia: selectedSubject,
                professore: datiUtente.id,
                studente: '',
            }

            return set(newDispRef, newDispData)
                .then(() => {
                    console.log('Nuova disponibilita aggiunto con successo:', newDispData);
                    navigation.navigate('TeacherHome', {
                        dati: datiUtente
                    });

                })
                .catch(error => {
                    console.error('Errore durante l aggiunta del nuovo studente:', error);
                });

        }catch (error) {
            console.error('Disponibilita error:', error);
            Alert.alert('Error', 'Failed to register user');
        }

    }


    return (
        <View style={styles.container}>
            <Button text="Select Date" onPress={showDatePicker} />
            <Button text="Select Time" onPress={showTimePicker} />

            <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleDateConfirm}
                onCancel={hideDatePicker}
            />

            <DateTimePickerModal
                isVisible={isTimePickerVisible}
                mode="time"
                onConfirm={handleTimeConfirm}
                onCancel={hideTimePicker}
            />

            <RNPickerSelect
                onValueChange={(value) => setSelectedSubject(value)}
                items={renderPickerOptions()}
                placeholder={{ label: 'Select Subject', value: null }}
            />

            <Text style={styles.selectedDateText}>
                Selected Date: {selectedDate ? selectedDate.toLocaleDateString() : ''}
            </Text>

            <Text style={styles.selectedTimeText}>
                Selected Time: {selectedTime ? selectedTime.toLocaleTimeString() : ''}
            </Text>

            <Text style={styles.selectedSubjectText}>
                Selected Subject: {selectedSubject || 'N/A'}
            </Text>

            <Button
                text="fatto"
                onPress={createDisponibility}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '90%',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedDateText: {
        marginTop: 10,
        fontSize: 16,
    },
    selectedTimeText: {
        marginTop: 10,
        fontSize: 16,
    },
    selectedSubjectText: {
        marginTop: 10,
        fontSize: 16,
    },
});

export default AddDisponibility;
