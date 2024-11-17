import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, ImageBackground, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

const ForgotUsername = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    otp: '',
    newUsername: '',
    form: ''
  });

  const handleChange = (name, value) => {
    setErrors({ ...errors, [name]: '' });
    if (name === 'email') setEmail(value);
    if (name === 'otp') setOtp(value);
    if (name === 'newUsername') setNewUsername(value);
  };

  const handleSubmit = async () => {
    setErrors({ email: '', otp: '', newUsername: '', form: '' });
    setIsButtonDisabled(true);

    if (!showOtp) {
      if (!email) {
        setErrors({ ...errors, email: 'Email is required' });
        setIsButtonDisabled(false);
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setErrors({ ...errors, email: 'Please enter a valid email address.' });
        setIsButtonDisabled(false);
        return;
      }

      try {
        const response = await axios.post('http://192.168.1.21:8080/user/forgot-username', { email });
        if (response.status === 200) {
          setShowOtp(true);
        } else {
          setErrors({ ...errors, form: 'Request failed. Please try again.' });
        }
      } catch (error) {
        setErrors({ ...errors, form: 'An error occurred while processing your request.' });
      } finally {
        setIsButtonDisabled(false);
      }
    } else {
      if (!otp) {
        setErrors({ ...errors, otp: 'OTP is required' });
        setIsButtonDisabled(false);
        return;
      }
      if (!newUsername) {
        setErrors({ ...errors, newUsername: 'New username is required' });
        setIsButtonDisabled(false);
        return;
      }

      try {
        const response = await axios.post('http://192.168.1.21:8080/user/verify-otp-forgot-username', { otp, username: newUsername });
        if (response.status === 200) {
          Alert.alert('Success', 'Your username has been updated successfully!');
          navigation.navigate('Login');
        } else {
          setErrors({ ...errors, form: 'Request failed. Please check your credentials and try again.' });
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
          <Text style={styles.headerText}>{showOtp ? 'New Username and OTP' : 'Forgot Username'}</Text>

          {errors.form && <Text style={styles.errorText}>{errors.form}</Text>}

          <Text style={styles.label}>Email</Text>
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={(text) => handleChange('email', text)}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          {showOtp && (
            <>
              <Text style={styles.label}>New Username</Text>
              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input}
                  value={newUsername}
                  onChangeText={(text) => handleChange('newUsername', text)}
                  autoCapitalize="none"
                />
              </View>
              {errors.newUsername && <Text style={styles.errorText}>{errors.newUsername}</Text>}

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
            </>
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit}
            disabled={isButtonDisabled}
          >
            <Text style={styles.buttonText}>{showOtp ? 'Submit' : 'Check Email'}</Text>
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
  errorText: {
    color: 'red',
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
});

export default ForgotUsername;
