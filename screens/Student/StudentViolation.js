import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, Alert, TouchableWithoutFeedback } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

/**
 * StudentViolation component allows students to view their violations.
 * It includes functionality for filtering violations based on a date range and 
 * includes navigation to related screens like Student CS Slip.
 */
const StudentViolation = () => {
  const [violations, setViolations] = useState([]);
  const [filteredViolations, setFilteredViolations] = useState([]);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [role, setRole] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const navigation = useNavigation();

  /**
   * Initialize the component by checking the token, role, and student number from AsyncStorage.
   * If valid, load violations for the student. If not valid, log out the user.
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
          loadViolations(storedStudentNumber, token);
        } else {
          handleLogout();
        }
      } catch (error) {
        console.error('Initialization error:', error);
        Alert.alert('Error', 'An error occurred during initialization. Please log in again.');
        handleLogout();
      }
    };

    initialize();
  }, []);

  /**
   * Loads the violations for the student by fetching data from the backend API.
   * 
   * @param {string} studentNumber - The student number.
   * @param {string} token - The authentication token.
   * 
   * 
   * Note: Change the IP address in the axios URL to match your backend server's IP address and port.
   */
  const loadViolations = async (studentNumber, token) => {
    try {
      const response = await axios.get(
        `http://192.168.1.16:8080/violation/studentNumber/${studentNumber}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setViolations(response.data);
    } catch (error) {
      Alert.alert('Error', 'Unable to fetch violations. Please try again later.');
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

  const navigateToStudentCsSlip = () => {
    setDropdownVisible(false);
    navigation.navigate('StudentCsSlip');
  };

  const navigateToStudentViolation = () => {
    setDropdownVisible(false);
    navigation.navigate('StudentViolation');
  };

  /**
   * Handles the selection of the 'From' date in the date picker.
   * 
   * @param {Event} event - The event object from the date picker.
   * @param {Date} selectedDate - The selected 'From' date.
   */
  const onChangeFrom = (event, selectedDate) => {
    const currentDate = selectedDate || fromDate;
    setShowFromDatePicker(false);
    setFromDate(currentDate);
  };

  /**
   * Handles the selection of the 'To' date in the date picker.
   * 
   * @param {Event} event - The event object from the date picker.
   * @param {Date} selectedDate - The selected 'To' date.
   */
  const onChangeTo = (event, selectedDate) => {
    const currentDate = selectedDate || toDate;
    setShowToDatePicker(false);
    setToDate(currentDate);
  };

  const filterViolations = () => {
    const filtered = violations.filter((violation) => {
      const violationDate = new Date(violation.dateOfNotice);
      const start = fromDate ? new Date(fromDate.setHours(0, 0, 0, 0)) : null;
      const end = toDate ? new Date(toDate.setHours(23, 59, 59, 999)) : null;
      return (!start || violationDate >= start) && (!end || violationDate <= end);
    });

    setFilteredViolations(filtered);
  };

  useEffect(() => {
    filterViolations();
  }, [fromDate, toDate, violations]);

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
          <Text style={styles.screenTitle}>My Violations</Text>
          <View style={styles.breakLine} />
          <View style={styles.datePickerSection}>
            <TouchableOpacity onPress={() => setShowFromDatePicker(true)} style={styles.datePickerContainer}>
              <Text style={styles.dateText}>{fromDate.toDateString()}</Text>
              <Image source={require('../../assets/images/calendar-1.png')} style={styles.icon} />
            </TouchableOpacity>
            {showFromDatePicker && (
              <DateTimePicker value={fromDate} mode="date" display="default" onChange={onChangeFrom} />
            )}

            <TouchableOpacity onPress={() => setShowToDatePicker(true)} style={styles.datePickerContainer}>
              <Text style={styles.dateText}>{toDate.toDateString()}</Text>
              <Image source={require('../../assets/images/calendar-11.png')} style={styles.icon} />
            </TouchableOpacity>
            {showToDatePicker && (
              <DateTimePicker value={toDate} mode="date" display="default" onChange={onChangeTo} />
            )}

          </View>
          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <Text style={styles.tableHeader}>Student</Text>
              <Text style={styles.tableHeader}>Offense</Text>
              <Text style={styles.tableHeader}>Date of Notice</Text>
              <Text style={styles.tableHeader}>CS Hours</Text>
            </View>
            <ScrollView style={styles.tableContent}>
              {filteredViolations.length > 0 ? (
                filteredViolations.map((violation, index) => (
                  <View style={styles.tableRow} key={index}>
                    <Text style={styles.tableCell}>{`${violation.student.firstName} ${violation.student.middleName} ${violation.student.lastName}`}</Text>
                    <Text style={styles.tableCell}>{violation.offense.description}</Text>
                    <Text style={styles.tableCell}>{new Date(violation.dateOfNotice).toLocaleDateString()}</Text>
                    <Text style={styles.tableCell}>{violation.csHours}</Text>
                  </View>
                ))
              ) : (
                <Text>No violations found for the selected dates.</Text>
              )}
            </ScrollView>
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
  datePickerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 5,
    flex: 1,
    marginBottom: 10,
  },
  dateText: {
    marginRight: 5,
  },
  icon: {
    width: 20,
    height: 20,
  },
  table: {
    margin: 10,
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#EEE',
    borderTopWidth: 1,
    borderColor: '#CCC',
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
  tableContent: {
    maxHeight: 400,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#E8E8E8',
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    borderColor: '#E8E8E8',
    paddingVertical: 8,
    borderBottomWidth: 0,
  }
});

export default StudentViolation;
