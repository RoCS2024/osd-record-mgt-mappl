import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, ImageBackground, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

const CreateAccount = () => {
  const navigation = useNavigation();
  const [userType, setUserType] = useState('');
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('');
  const [studentOrEmployeeNumber, setStudentOrEmployeeNumber] = useState('');
  const [email, setEmail] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Toggles the visibility of the password input field.
   */
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  /**
   * Validates the email format using a regular expression.
   * 
   * @param {string} email - The email address to validate
   * @returns {boolean} - Returns true if the email format is valid, otherwise false
   */
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Handles the registration process based on the user type.
   * If user type is 'guest', generates a guest number and sends a registration request.
   * Otherwise, calls submitForm to register students or employees.
   * 
   * @async
   * @function
   * @returns {Promise<void>}
   * 
   * Note: Change the IP address in the axios URL to match your backend server's IP address and port.
   */
  const handleRegister = async () => {
    setErrorMessage('');

    if (!username || !/^[a-zA-Z0-9]+$/.test(username)) {
      setErrorMessage('Please enter a valid username (alphanumeric characters only).');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter a password.');
      return;
    }
    if (userType !== 'guest' && !studentOrEmployeeNumber) {
      setErrorMessage('Please enter your Member Number.');
      return;
    }
    if (userType !== 'guest' && !validateEmail(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    if (userType === 'guest') {
      try {
        const guestNumber = `GUEST_${Math.floor(1000 + Math.random() * 9000)}`;
        const payload = {
          username,
          password,
          guest: { guestNumber }
        };
        const response = await axios.post('http://192.168.1.6:8080/user/register', payload);
        if (response.status === 200) {
          navigation.navigate('AddGuest', { guestNumber });
        } else {
          Alert.alert('Error', 'Unexpected response received.');
        }
      } catch (error) {
        const message = error.response?.data?.message || 'An unexpected error occurred.';
        setErrorMessage(message);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      await submitForm();
    }
  };

  /**
   * Submits the form data for student or employee registration to the backend server.
   * On successful registration, navigates to the VerifyOtp screen.
   * 
   * @async
   * @function
   * @returns {Promise<void>}
   */
  const submitForm = async () => {
    const payload = {
      username,
      password,
      [userType]: {
        [userType === 'student' ? 'studentNumber' : 'employeeNumber']: studentOrEmployeeNumber,
        email
      }
    };

    try {
      const response = await axios.post('http://192.168.1.6:8080/user/register', payload);
      if (response.status === 200) {
        navigation.navigate('VerifyOtp', { username });
      } else {
        Alert.alert('Error', 'Unexpected response received.');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'An unexpected error occurred.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ImageBackground source={require('../../assets/images/img3-1.png')} style={styles.background}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.overlayContainer}>
          <Image source={require('../../assets/images/logo-1.png')} style={styles.logo} />
          <Text style={styles.headerText}>Register</Text>

          <Text style={styles.label}>User Type</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={userType}
              style={styles.picker}
              onValueChange={(itemValue) => setUserType(itemValue)}
            >
              <Picker.Item label="Select User Type" value="" />
              <Picker.Item label="Student" value="student" />
              <Picker.Item label="Employee" value="employee" />
              <Picker.Item label="Guest" value="guest" />
            </Picker>
          </View>

          <Text style={styles.label}>Username</Text>
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
            <Image source={require('../../assets/images/user-1.png')} style={styles.icon} />
          </View>

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!passwordVisible}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={togglePasswordVisibility} style={styles.iconButton}>
              <Image source={passwordVisible ? require('../../assets/images/eye.png') : require('../../assets/images/eye1.png')} style={styles.icon} />
            </TouchableOpacity>
          </View>

          {userType === 'student' && (
            <>
              <Text style={styles.label}>Student Number</Text>
              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input}
                  value={studentOrEmployeeNumber}
                  onChangeText={setStudentOrEmployeeNumber}
                  autoCapitalize="none"
                />
              </View>
            </>
          )}

          {userType === 'employee' && (
            <>
              <Text style={styles.label}>Employee Number</Text>
              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input}
                  value={studentOrEmployeeNumber}
                  onChangeText={setStudentOrEmployeeNumber}
                  autoCapitalize="none"
                />
              </View>
            </>
          )}

          {userType !== 'guest' && (
            <>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                />
              </View>
            </>
          )}

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <TouchableOpacity style={styles.registerButton} onPress={handleRegister} disabled={isSubmitting}>
            <Text style={styles.registerButtonText}>{isSubmitting ? 'Submitting...' : 'Register'}</Text>
          </TouchableOpacity>

          <Text style={styles.registerText}>Already have an Account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.clickHereText}>Click here.</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    width: '100%',
  },
  overlayContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 20,
    width: '80%',
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 50,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  label: {
    alignSelf: 'flex-start',
    width: '100%',
    fontSize: 12,
    top: 4,
    left: 3,
    marginBottom: 5,
    color: '#555',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 10,
    borderWidth: 0.5,
  },
  input: {
    flex: 1,
    fontSize: 14,
    height: 35,
    backgroundColor: 'white',
    marginLeft: 5,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 10,
    borderWidth: 0.5,
    height: 40,
  },
  picker: {
    flex: 1,
    height: '100%',
  },
  icon: {
    width: 15,
    height: 15,
    resizeMode: 'contain',
    right: 5,
  },
  iconButton: {
    padding: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerButton: {
    backgroundColor: '#0072BB',
    width: '100%',
    top: 20,
    paddingVertical: 8,
    paddingHorizontal: 40,
    alignItems: 'center',
    borderRadius: 5,
    marginBottom: 30,
    alignSelf: 'center',
  },
  registerButtonText: {
    color: 'white',
    fontSize: 16,
  },
  registerText: {
    color: '#0174BE',
    marginBottom: 5,
  },
  clickHereText: {
    color: '#0174BE',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 5,
  },
});

export default CreateAccount;
