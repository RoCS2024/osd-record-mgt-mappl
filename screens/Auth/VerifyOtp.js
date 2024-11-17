import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, ImageBackground, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

/**
 * VerifyOtpScreen component allows users to verify their OTP (One-Time Password).
 * Users enter their username and OTP, then submit the form for verification.
 * Displays a success or error message based on the verification response from the backend.
 */
const VerifyOtp = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  /**
   * Handles OTP verification by sending a POST request to the backend server.
   * Upon successful OTP verification, navigates the user to the Login screen after a delay.
   * 
   * @async
   * @function
   * @returns {Promise<void>}
   * 
   * Note: Update the IP address in the axios URL to match your backend server's IP address and port.
   */
  const handleVerifyOtp = async () => {
    setIsSubmitting(true);

    try {
      const payload = {
        username,
        otp,
      };

      const response = await axios.post('http://192.168.1.21:8080/user/verify-otp', payload, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (response.status === 200) {
        setMessage('OTP Verified Successfully!');
        setTimeout(() => {
          navigation.navigate('Login');
        }, 2000);
      } else {
        setMessage('Failed to verify OTP. Please try again.');
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setMessage(error.response.data.message);
      } else {
        setMessage('An error occurred while verifying OTP.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ImageBackground source={require('../../assets/images/img3-1.png')} style={styles.background}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.overlayContainer}>
          <Image source={require('../../assets/images/logo-1.png')} style={styles.logo} />
          <Text style={styles.headerText}>Verify OTP</Text>

          <Text style={styles.label}>Username</Text>
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              editable={!isSubmitting}
            />
            <Image source={require('../../assets/images/user-1.png')} style={styles.icon} />
          </View>

          <Text style={styles.label}>OTP</Text>
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              value={otp}
              onChangeText={setOtp}
              autoCapitalize="none"
              editable={!isSubmitting}
              keyboardType="default"
            />
          </View>

          {message ? <Text style={styles.messageText}>{message}</Text> : null}

          <TouchableOpacity
            style={styles.button}
            onPress={handleVerifyOtp}
            disabled={isSubmitting || !username || !otp}
          >
            <Text style={styles.buttonText}>{isSubmitting ? 'Verifying...' : 'Verify OTP'}</Text>
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
    height: 40,
    backgroundColor: 'white',
  },
  icon: {
    width: 18,
    height: 18,
  },
  button: {
    backgroundColor: '#0072BB',
    width: '100%',
    top: 20,
    paddingVertical: 6,
    paddingHorizontal: 40,
    alignItems: 'center',
    borderRadius: 5,
    marginBottom: 40,
    alignSelf: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  messageText: {
    color: 'green',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 14,
  },
});

export default VerifyOtp;
