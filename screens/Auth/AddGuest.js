import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, ScrollView, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';

/**
 * AddGuest component allows the user to input personal details for adding a new guest.
 * This component handles the entry of first name, middle name, last name, birthdate, birthplace, 
 * citizenship, religion, civil status, and sex, as well as navigating to the next screen to save the data.
 */
const AddGuest = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { guestNumber, username, password } = route.params;
  console.log('Received in AddGuest:', username, password);

  const [personalDetails, setPersonalDetails] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    birthdate: new Date().toISOString().split('T')[0],
    birthplace: '',
    citizenship: '',
    religion: '',
    civilStatus: '',
    sex: '',
  });

  const [datePickerVisible, setDatePickerVisible] = useState(false);

  /**
   * Handles input changes for each field in the personal details form.
   * Updates the respective field in the state.
   * 
   * @param {string} field - The name of the field being updated.
   * @param {string} value - The new value to be set for the field.
   */
  const handleInputChange = (field, value) => {
    setPersonalDetails(prevState => ({ ...prevState, [field]: value }));
  };

  /**
   * Displays the date picker when the user clicks on the birthdate input field.
   */
  const showDatePicker = () => {
    setDatePickerVisible(true);
  };

  /**
   * Handles the date selection from the date picker.
   * Updates the birthdate field with the selected date.
   * 
   * @param {Event} event - The event triggered by the date picker change.
   * @param {Date} selectedDate - The date selected by the user.
   */
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date(personalDetails.birthdate);
    setDatePickerVisible(Platform.OS === 'ios'); // Keep date picker visible on iOS
    handleInputChange('birthdate', currentDate.toISOString().split('T')[0]);
  };

  /**
   * Navigates to the AddGuestNext screen, passing the personal details, guest number,
   * and credentials (username and password) for the next step.
   */
  const handleNext = () => {
    console.log('Passing to AddGuestNext:', username, password);
    navigation.navigate('AddGuestNext', { personalDetails, guestNumber, username, password });
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView style={styles.formContainer}>
        <View style={styles.logoContainer}>
          <Image source={require('../../assets/images/logo-1.png')} style={styles.logo} />
        </View>
        <Text style={styles.header}>Personal Details</Text>
        <View style={styles.breakLine} />

        {Object.keys(personalDetails).map((key) => (
          <View key={key} style={styles.inputGroup}>
            <TextInput
              style={[styles.input, key === 'birthdate' && { paddingRight: 40 }]}
              placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
              onChangeText={(text) => handleInputChange(key, text)}
              value={personalDetails[key]}
              editable={key !== 'birthdate'}
            />
            {key === 'birthdate' && (
              <TouchableOpacity onPress={showDatePicker} style={styles.iconButton}>
                <Image source={require('../../assets/images/calendar-1.png')} style={styles.iconInsideInput} />
              </TouchableOpacity>
            )}
          </View>
        ))}

        {datePickerVisible && (
          <DateTimePicker
            testID="dateTimePicker"
            value={new Date(personalDetails.birthdate)}
            mode="date"
            display="default"
            onChange={onDateChange}
            maximumDate={new Date()}
          />
        )}
      </ScrollView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40
  },
  logo: {
    width: Dimensions.get('window').width * 0.28,
    height: Dimensions.get('window').width * 0.28,
    resizeMode: 'contain'
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10
  },
  breakLine: {
    borderBottomColor: '#000',
    borderBottomWidth: 1,
    marginBottom: 20
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    position: 'relative'
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
  },
  iconButton: {
    position: 'absolute',
    right: 10,
    height: '100%',
    justifyContent: 'center',
    padding: 10,
  },
  iconInsideInput: {
    width: 24,
    height: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ccc'
  },
  backButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#007bff',
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    width: '48%'
  },
  backButtonText: {
    color: '#007bff',
    textAlign: 'center'
  },
  nextButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    width: '48%'
  },
  nextButtonText: {
    color: '#fff',
    textAlign: 'center'
  }
});

export default AddGuest;
