import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, ImageBackground, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

const Forgot = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordAndOTP, setShowPasswordAndOTP] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [errors, setErrors] = useState({
    username: '',
    otp: '',
    password: '',
    form: ''
  });

  const oldPassword = ""; // Replace with actual old password if needed

  /**
   * Handles changes to input fields and sets the corresponding state.
   * Also validates the username field to ensure only alphanumeric characters are allowed.
   * 
   * @param {string} name - The name of the input field (e.g., 'username', 'otp', 'password')
   * @param {string} value - The value entered by the user
   */
  const handleChange = (name, value) => {
    if (name === 'username') {
      setUsername(value);
      if (/[^a-zA-Z0-9]/.test(value)) {
        setErrors({ ...errors, username: 'Please Enter a Valid Input (alphanumeric characters only).' });
      } else {
        setErrors({ ...errors, username: '' });
      }
    }
    if (name === 'otp') setOtp(value);
    if (name === 'password') setPassword(value);
    setErrors({ ...errors, [name]: '' });
  };

  /**
   * Submits the form data to the server for OTP request or verification.
   * Checks if the username is valid, and toggles between requesting OTP and verifying OTP based on state.
   * 
   * @async
   * @function
   * @returns {Promise<void>}
   * 
   * Note: Change the IP address in the axios URL to match your backend server's IP address and port.
   */
  const handleSubmit = async () => {
    setErrors({ username: '', otp: '', password: '', form: '' });
    setIsButtonDisabled(true);

    if (!showPasswordAndOTP) {
      if (!username) {
        setErrors({ ...errors, username: 'Username is Required' });
        setIsButtonDisabled(false);
        return;
      }

      if (/[^a-zA-Z0-9]/.test(username)) {
        setErrors({ ...errors, username: 'Please Enter a Valid Input (alphanumeric characters only).' });
        setIsButtonDisabled(false);
        return;
      }

      try {
        const response = await axios.post('http://192.168.1.6:8080/user/forgot-password', { username });
        if (response.status === 200) {
          setShowPasswordAndOTP(true);
        } else {
          setErrors({ ...errors, form: 'Request Failed. Please check your credentials and try again.' });
        }
      } catch (error) {
        setErrors({ ...errors, form: 'An error occurred while processing your request.' });
      } finally {
        setIsButtonDisabled(false);
      }
    } else {
      if (password === oldPassword) {
        setErrors({ ...errors, password: 'You cannot use the same password. Please enter a new one.' });
        setIsButtonDisabled(false);
        return;
      }

      const validationErrors = {};
      if (!otp) validationErrors.otp = 'OTP is Required';
      if (!password) validationErrors.password = 'Password is Required';

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setIsButtonDisabled(false);
        return;
      }

      try {
        const response = await axios.post('http://192.168.1.6:8080/user/verify-forgot-password', { username, otp, password });
        if (response.status === 200) {
          navigation.navigate('Login');
        } else {
          setErrors({ ...errors, form: 'Request Failed. Please check your credentials and try again.' });
        }
      } catch (error) {
        setErrors({ ...errors, form: 'An error occurred while processing your request.' });
      } finally {
        setIsButtonDisabled(false);
      }
    }
  };

  return (
    <ImageBackground source={require('../../assets/images/img3-1.png')} style={styles.background}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.overlayContainer}>
          <Image source={require('../../assets/images/logo-1.png')} style={styles.logo} />
          <Text style={styles.headerText}>{showPasswordAndOTP ? 'Change Password' : 'Forgot Password'}</Text>

          {errors.form && <Text style={styles.errorText}>{errors.form}</Text>}

          <Text style={styles.label}>Username</Text>
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={(text) => handleChange('username', text)}
              autoCapitalize="none"
            />
            <Image source={require('../../assets/images/user-1.png')} style={styles.icon} />
          </View>
          {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}

          {showPasswordAndOTP && (
            <>
              <Text style={styles.label}>OTP</Text>
              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input}
                  value={otp}
                  onChangeText={(text) => handleChange('otp', text)}
                  keyboardType="numeric"
                  placeholder="Enter OTP"
                />
              </View>
              {errors.otp && <Text style={styles.errorText}>{errors.otp}</Text>}

              <Text style={styles.label}>Password</Text>
              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(text) => handleChange('password', text)}
                  placeholder="Enter New Password"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Image
                    source={showPassword ? require('../../assets/images/eye.png') : require('../../assets/images/eye1.png')}
                    style={styles.icon}
                  />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </>
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit}
            disabled={isButtonDisabled}
          >
            <Text style={styles.buttonText}>{showPasswordAndOTP ? 'Save' : 'Check Username'}</Text>
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
    width: 120,
    height: 120,
    marginBottom: 10,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    alignSelf: 'flex-start',
    width: '100%',
    fontSize: 15,
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
    borderWidth: 1,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: 35,
    backgroundColor: 'white',
  },
  icon: {
    width: 18,
    height: 18,
  },
  button: {
    backgroundColor: '#0072BB',
    width: '100%',
    paddingVertical: 8,
    paddingHorizontal: 30,
    alignItems: 'center',
    borderRadius: 5,
    marginBottom: 30,
    alignSelf: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  showPasswordText: {
    color: '#0072BB',
    marginTop: -5,
    marginBottom: 10,
    textAlign: 'right',
  },
  errorText: {
    color: 'red',
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
});

export default Forgot;
