import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, ImageBackground, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

/**
 * ForgotPassword component handles the process of resetting the user's password.
 * It allows the user to request a password reset by submitting their username,
 * receive an OTP (one-time password), and set a new password.
 */
const ForgotPassword = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordAndOTP, setShowPasswordAndOTP] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [errors, setErrors] = useState({
    username: '',
    otp: '',
    password: '',
    form: '',
    otpIncorrect: ''
  });

  /**
   * Updates the form field values and clears any associated error messages.
   * 
   * @param {string} name - The name of the field being updated.
   * @param {string} value - The value to be set for the specified field.
   */
  const handleChange = (name, value) => {
    setErrors({ ...errors, [name]: '', otpIncorrect: '' });
    if (name === 'username') setUsername(value);
    if (name === 'otp') setOtp(value);
    if (name === 'password') setPassword(value);
  };

  /**
   * Handles the submission of the password reset form.
   * First, it checks if the username is provided and sends a request for an OTP.
   * After receiving the OTP, it allows the user to input a new password.
   * 
   * @async
   * @function
   * @returns {Promise<void>}
   */
  const handleSubmit = async () => {
    setErrors({ username: '', otp: '', password: '', form: '', otpIncorrect: '' });
    setIsButtonDisabled(true);

    if (!showPasswordAndOTP) {
      if (!username) {
        setErrors({ ...errors, username: 'Username is Required' });
        setIsButtonDisabled(false);
        return;
      }

      setIsCheckingUsername(true);

      try {
        const response = await axios.post('https://amused-gnu-legally.ngrok-free.app/user/forgot-password', { username });
        if (response.status === 200) {
          setShowPasswordAndOTP(true);
        } else {
          setErrors({ ...errors, form: 'Request Failed. Please check your credentials and try again.' });
        }
      } catch (error) {
        setErrors({ ...errors, form: 'Username not found.' });
      } finally {
        setIsButtonDisabled(false);
        setIsCheckingUsername(false);
      }
    } else {
      const validationErrors = {};
      if (!otp) validationErrors.otp = 'OTP is Required';
      if (!password) validationErrors.password = 'Password is Required';

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setIsButtonDisabled(false);
        return;
      }

      // Password strength validation
      if (password.length < 8) {
        validationErrors.password = 'Password must be at least 8 characters.';
      }

      // Check for uppercase, lowercase, digits, and special characters
      if (/^[a-z]+$/.test(password) || !/\d/.test(password) || !/[!@#$%^&*]/.test(password)) {
        validationErrors.password = 'Your password is weak. Please include a mix of uppercase, lowercase, numbers, and special characters.';
      }

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setIsButtonDisabled(false);
        return;
      }

      try {
        const payload = { username, otp, password };
        const response = await axios.post('https://amused-gnu-legally.ngrok-free.app/user/verify-forgot-password', payload);
        if (response.status === 200) {
          Alert.alert('Success', 'Password has been updated successfully!');
          navigation.navigate('Login');
        } else {
          setErrors({ ...errors, form: 'Failed to update password. Please check your OTP and try again.' });
        }
      } catch (error) {
        setErrors({ ...errors, otpIncorrect: 'Incorrect OTP. Please try again.' });
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

          <Text style={styles.label}>Username</Text>
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={(text) => handleChange('username', text)}
              autoCapitalize="none"
              editable={!showPasswordAndOTP}  // Make the username field non-editable once we are on the second screen
            />
            <Image source={require('../../assets/images/user-1.png')} style={styles.icon} />
          </View>
          {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}

          {errors.form && !errors.username && !errors.otp && !errors.password && (
            <Text style={styles.errorText}>{errors.form}</Text>
          )}

          {isCheckingUsername && !errors.form && (
            <Text style={[styles.errorText, { color: 'green' }]}>Checking Username...</Text>
          )}

          {showPasswordAndOTP && (
            <>
              <Text style={styles.label}>OTP</Text>
              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input}
                  value={otp}
                  onChangeText={(text) => handleChange('otp', text)}
                  keyboardType="default"
                  placeholder="Enter OTP"
                />
              </View>
              {errors.otp && <Text style={styles.errorText}>{errors.otp}</Text>}
              {errors.otpIncorrect && <Text style={[styles.errorText, { color: 'red' }]}>{errors.otpIncorrect}</Text>}

              <Text style={styles.label}>New Password</Text>
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
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default ForgotPassword;
