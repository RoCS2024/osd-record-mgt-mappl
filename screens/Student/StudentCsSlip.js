import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert, TouchableWithoutFeedback } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * StudentCsSlip component allows students to view their CS slips.
 * It handles session management, fetching CS slips from the server, and navigating to related screens.
 */
const StudentCsSlip = () => {
  const [csSlips, setCsSlips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [role, setRole] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const navigation = useNavigation();

  /**
   * Initializes the component by validating session data (token, role, studentNumber).
   * If the session is valid, it fetches the CS slips for the student.
   * If not valid, it logs out the user.
   */
  useEffect(() => {
    const initialize = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const storedRole = await AsyncStorage.getItem('role');
        const storedStudentNumber = await AsyncStorage.getItem('studentNumber');

        if (!token) {
          handleLogout();
          return;
        }

        let decodedPayload = {};
        try {
          const base64Payload = token.split('.')[1];
          decodedPayload = JSON.parse(atob(base64Payload));
        } catch (decodeError) {
          console.error('Error decoding token:', decodeError);
          Alert.alert('Error', 'Invalid session. Please log in again.');
          handleLogout();
          return;
        }

        const currentTime = Math.floor(Date.now() / 1000);
        if (decodedPayload.exp && decodedPayload.exp < currentTime) {
          handleLogout();
          return;
        }

        if (!storedRole || storedRole !== 'ROLE_ROLE_STUDENT') {
          Alert.alert('Unauthorized Access', 'You do not have permission to access this page.');
          handleLogout();
          return;
        }

        setRole(storedRole);
        setStudentNumber(storedStudentNumber);

        if (storedStudentNumber) {
          fetchCsSlips(storedStudentNumber, token);
        } else {
          handleLogout();
        }
      } catch (error) {
        console.error('Initialization error:', error);
        Alert.alert('Error', 'An error occurred during initialization. Please log in again.');
        handleLogout();
      }
    };

    initialize(); // Initialize the component
  }, []);

  /**
   * Fetches CS slips for the student from the server.
   * The CS slips data is retrieved using the student number and token.
   * 
   * @param {string} studentNumber - The student number.
   * @param {string} token - The authentication token.
   * 
   * 
   * Note: Change the IP address in the axios URL to match your backend server's IP address and port.
   */
  const fetchCsSlips = async (studentNumber, token) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://192.168.1.16:8080/csSlip/studentNumber/${studentNumber}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setCsSlips(data);
    } catch (error) {
      console.error('Error fetching CS Slips:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };


  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      navigation.replace('Auth', { screen: 'Login' });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const closeDropdown = () => {
    if (dropdownVisible) setDropdownVisible(false);
  };

  const navigateToStudentViolation = () => {
    setDropdownVisible(false);
    navigation.navigate('StudentViolation');
  };

  const navigateToStudentCsSlip = () => {
    setDropdownVisible(false);
    navigation.navigate('StudentCsSlip');
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return <Text>Error fetching CS Slips: {error}</Text>;
  }

  return (
    <TouchableWithoutFeedback onPress={closeDropdown}>
      <View style={styles.outerContainer}>
        <View style={styles.header}>
          <Image source={require('../../assets/images/loge-new-1.png')} style={styles.logo} />
          <TouchableOpacity onPress={toggleDropdown}>
            <Image source={require('../../assets/images/menu.png')} style={styles.menuIcon} />
          </TouchableOpacity>
        </View>

        {dropdownVisible && (
          <View style={styles.dropdownContainer}>
            <TouchableOpacity style={styles.dropdownItem} onPress={navigateToStudentViolation}>
              <Image source={require('../../assets/images/violation.png')} style={styles.dropdownIcon} />
              <Text style={styles.dropdownText}>My Violations</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dropdownItem} onPress={navigateToStudentCsSlip}>
              <Image source={require('../../assets/images/slip.png')} style={styles.dropdownIcon} />
              <Text style={styles.dropdownText}>CS Slips</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dropdownItem} onPress={handleLogout}>
              <Image source={require('../../assets/images/logout.png')} style={styles.dropdownIcon} />
              <Text style={styles.dropdownText}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}

        <ScrollView style={styles.container}>
          <Text style={styles.screenTitle}>My List of Community Service Slips</Text>
          <View style={styles.breakLine} />
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableHeader}>Student Name</Text>
              <Text style={styles.tableHeader}>Area of Community Service</Text>
            </View>
            {csSlips.length > 0 ? (
              csSlips.map((slip, index) => (
                <View style={styles.tableRow} key={index}>
                  <Text style={styles.tableCell}>{`${slip.student.firstName} ${slip.student.middleName} ${slip.student.lastName}`}</Text>
                  <Text style={styles.tableCell}>{slip.areaOfCommServ.stationName}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noDataText}>No Community Service Slips found.</Text>
            )}
          </View>
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#D3D3D3',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 0,
    backgroundColor: '#0072BB',
  },
  logo: {
    width: 150,
    height: 50,
    resizeMode: 'contain',
  },
  menuIcon: {
    width: 30,
    height: 30,
  },
  dropdownContainer: {
    position: 'absolute',
    top: 35,
    right: 10,
    width: 150,
    backgroundColor: '#FFFFFF',
    padding: 5,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    zIndex: 1,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dropdownIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  dropdownText: {
    fontSize: 14,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    margin: 20,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'left',
    marginVertical: 10,
    marginLeft: 20,
  },
  breakLine: {
    borderBottomColor: '#D3D3D3',
    borderBottomWidth: 2,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  table: {
    margin: 10,
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#E8E8E8',
  },
  tableHeader: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: '#F0F0F0',
    borderColor: '#E8E8E8',
    borderWidth: 1,
    paddingVertical: 8,
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    borderColor: '#E8E8E8',
    paddingVertical: 8,
    borderBottomWidth: 0,
  },
  noDataText: {
    textAlign: 'center',
    marginVertical: 10,
    color: '#888888',
  }
});

export default StudentCsSlip;
