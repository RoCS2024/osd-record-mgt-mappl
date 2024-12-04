import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';

/**
 * AddGuest component collects personal details from the guest, including name, birthdate, birthplace, etc.
 * It validates the input fields and, if valid, navigates to the next step for contact details.
 */
const AddGuest = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { guestNumber, username, password } = route.params;

  const [personalDetails, setPersonalDetails] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    birthdate: '',
    birthplace: '',
    citizenship: '',
    religion: '',
    civilStatus: '',
    sex: '',
  });

  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [errors, setErrors] = useState({});

  /**
   * Handles changes to the input fields and clears the related error messages.
   * 
   * @param {string} field - The field to be updated (e.g., firstName, lastName, etc.).
   * @param {string} value - The value to set for the field.
   */
  const handleInputChange = (field, value) => {
    setPersonalDetails(prevState => ({ ...prevState, [field]: value }));
    setErrors(prevErrors => ({ ...prevErrors, [field]: undefined }));
  };

  /**
   * Shows the date picker for selecting the birthdate.
   */
  const showDatePicker = () => {
    setDatePickerVisible(true);
  };

  /**
   * Handles the change of the date in the date picker.
   * 
   * @param {Event} event - The event object from the date picker.
   * @param {Date} selectedDate - The selected date.
   */
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date(personalDetails.birthdate);
    setDatePickerVisible(Platform.OS === 'ios');
    handleInputChange('birthdate', currentDate.toISOString().split('T')[0]);
  };

  /**
   * Handles the form submission by validating the input fields.
   * If any field is missing, it sets the error state. If all fields are filled, 
   * it navigates to the next step, `AddGuestNext`, passing the collected data.
   * 
   * @async
   * @function
   * @returns {Promise<void>}
   */
  const handleNext = () => {
    const newErrors = {};
    Object.keys(personalDetails).forEach((key) => {
      if (!personalDetails[key]) {
        newErrors[key] = `Please enter a ${formatPlaceholder(key)}`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      navigation.navigate('AddGuestNext', { personalDetails, guestNumber, username, password });
    }
  };

  /**
   * Formats the placeholder text for field names by adding spaces and capitalizing the first letter.
   * 
   * @param {string} key - The key (field name) to format.
   * @returns {string} - The formatted placeholder text.
   */
  const formatPlaceholder = (key) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase());
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
            <View style={[styles.inputWrapper, key === 'birthdate' && { flexDirection: 'row' }]}>
              <TextInput
                style={[styles.input, key === 'birthdate' && { paddingRight: 40 }]}
                placeholder={key === 'birthdate' ? 'Birthdate' : formatPlaceholder(key)}
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
            {errors[key] && <Text style={styles.errorText}>{errors[key]}</Text>}
          </View>
        ))}

        {datePickerVisible && (
          <DateTimePicker
            testID="dateTimePicker"
            value={new Date(personalDetails.birthdate || new Date())}
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
    marginTop: 40,
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
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
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 20,
    position: 'relative',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    width: '100%',
  },
  iconButton: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -12 }],
    height: 24,
    width: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconInsideInput: {
    width: 24,
    height: 24,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 20,
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
