import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';

/**
 * AddGuestNext component allows the user to input contact details for a new guest.
 * This includes email, contact number, and address. Upon submission, the collected data is sent 
 * to the backend for guest registration, and the user is navigated to the OTP verification screen.
 */
const AddGuestNext = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { personalDetails, guestNumber, username, password } = route.params;

  console.log('Received in AddGuestNext:', username, password);

  const [contactDetails, setContactDetails] = useState({
    email: '',
    contactNumber: '',
    address: ''
  });

  /**
   * Handles input changes for each field in the contact details form.
   * Updates the respective field in the state.
   * 
   * @param {string} field - The name of the field being updated.
   * @param {string} value - The new value to be set for the field.
   */
  const handleInputChange = (field, value) => {
    setContactDetails(prevState => ({ ...prevState, [field]: value }));
  };

  /**
   * Navigates back to the previous screen.
   */
  const handleBack = () => {
    navigation.goBack();
  };

  /**
   * Handles the form submission by sending a POST request to the backend server.
   * Upon success, navigates the user to the OTP verification screen.
   * 
   * @async
   * @function
   * @returns {Promise<void>}
   * 
   * Note: Change the IP address in the axios URL to match your backend server's IP address and port.
   */
  const handleSubmit = async () => {
    const payload = {
      user: {
        username,
        password
      },
      guest: {
        guestNumber,
        ...personalDetails,
        ...contactDetails
      }
    };

    console.log("Payload being sent to the server:", JSON.stringify(payload));

    try {
      const response = await axios.post('http://192.168.1.21:8080/user/register', payload);

      if (response.status === 200) {
        Alert.alert('Success', 'Guest has been successfully registered!');
        navigation.navigate('VerifyOtp', { username });
      } else {
        Alert.alert('Error', 'Unexpected response received.');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'An error occurred during registration.';
      Alert.alert('Error', message);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView style={styles.formContainer}>
        <View style={styles.logoContainer}>
          <Image source={require('../../assets/images/logo-1.png')} style={styles.logo} />
        </View>
        <Text style={styles.header}>Contact Details</Text>
        <View style={styles.breakLine} />

        <TextInput
          style={styles.input}
          placeholder="Email"
          onChangeText={text => handleInputChange('email', text)}
          value={contactDetails.email}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Contact Number"
          onChangeText={text => handleInputChange('contactNumber', text)}
          value={contactDetails.contactNumber}
          keyboardType="phone-pad"
        />
        <TextInput
          style={[styles.input, styles.addressInput]}
          placeholder="Address"
          onChangeText={text => handleInputChange('address', text)}
          value={contactDetails.address}
          multiline={true}
          numberOfLines={4}
        />
      </ScrollView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextButton} onPress={handleSubmit}>
          <Text style={styles.nextButtonText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    marginBottom: 10,
  },
  breakLine: {
    borderBottomColor: '#000',
    borderBottomWidth: 1,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  addressInput: {
    height: 100,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
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
    width: '48%',
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    textAlign: 'center'
  }
});

export default AddGuestNext;
