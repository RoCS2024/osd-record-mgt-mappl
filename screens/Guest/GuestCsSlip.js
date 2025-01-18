import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert, TouchableWithoutFeedback } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * GuestCsSlip component displays and filters the CS slips for a guest's beneficiaries.
 * It allows filtering by student name and handles fetching data, session management, and navigation to other screens.
 */
const GuestCsSlip = () => {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [studentStatus, setStudentStatus] = useState('all');
  const [csSlips, setCsSlips] = useState([]);
  const [filteredCsSlips, setFilteredCsSlips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [role, setRole] = useState('');
  const [guestId, setGuestId] = useState(null);
  const navigation = useNavigation();

  /**
   * Initializes the component by validating the session and fetching data.
   * It checks the token, role, and guest ID from AsyncStorage and fetches CS slips if valid.
   */
  useEffect(() => {
    const initialize = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const storedRole = await AsyncStorage.getItem('role');
        const storedGuestId = await AsyncStorage.getItem('guestId');

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

        if (!storedRole || storedRole !== 'ROLE_ROLE_GUEST') {
          Alert.alert('Unauthorized Access', 'You do not have permission to access this page.');
          handleLogout();
          return;
        }

        setRole(storedRole);
        setGuestId(storedGuestId);

        if (storedGuestId) {
          fetchCsSlips(storedGuestId, token);
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
   * Fetches CS slips for the guest's beneficiaries and their students.
   * Makes API calls to fetch beneficiaries and CS slips data, and stores them in the state.
   * 
   * @param {string} guestId - The guest ID used to fetch beneficiaries and their CS slips.
   * 
   * 
   * Note: Change the IP address in the axios URL to match your backend server's IP address and port.
   */
  const fetchCsSlips = async (guestId, token) => {
    setLoading(true);
    setError(null);

    try {
      const beneficiariesResponse = await fetch(`https://amused-gnu-legally.ngrok-free.app/guest/${guestId}/Beneficiaries`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!beneficiariesResponse.ok) {
        throw new Error('Failed to fetch beneficiaries');
      }

      const beneficiariesData = await beneficiariesResponse.json();

      if (!Array.isArray(beneficiariesData)) {
        throw new Error('The response is not an array. Check the API response structure.');
      }

      const fetchedCsSlips = await Promise.all(
        beneficiariesData.map(async (topBeneficiary) => {
          if (!Array.isArray(topBeneficiary.beneficiary)) {
            throw new Error(`No beneficiary data found for: ${JSON.stringify(topBeneficiary)}`);
          }

          const studentCsSlips = await Promise.all(
            topBeneficiary.beneficiary.map(async (student) => {
              const studentNumber = student.studentNumber;

              if (!studentNumber) {
                throw new Error(`No studentNumber found for student: ${JSON.stringify(student)}`);
              }

              const csSlipResponse = await fetch(`https://amused-gnu-legally.ngrok-free.app/csSlip/studentNumber/${studentNumber}`, {
                headers: { Authorization: `Bearer ${token}` },
              });

              if (!csSlipResponse.ok) {
                throw new Error(`Failed to fetch CS slip for studentNumber: ${studentNumber}`);
              }

              const csSlipData = await csSlipResponse.json();
              return {
                studentName: `${student.firstName} ${student.lastName}`,
                csSlips: csSlipData,
              };
            })
          );

          return studentCsSlips;
        })
      );

      setCsSlips(fetchedCsSlips.flat());
      setFilteredCsSlips(fetchedCsSlips.flat());
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filters CS slips based on the selected student name.
   * 
   * @param {string} studentName - The student name used to filter CS slips.
   */
  const filterCsSlips = (studentName) => {
    if (studentName === 'all') {
      setFilteredCsSlips(csSlips);
    } else {
      const filtered = csSlips.filter(csSlipData => csSlipData.studentName === studentName);
      setFilteredCsSlips(filtered);
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

  const navigateToCSslips = () => {
    setDropdownVisible(false);
    navigation.navigate('GuestCsSlip');
  };

  const navigateToViolations = () => {
    setDropdownVisible(false);
    navigation.navigate('GuestViolation');
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return <Text>Error: {error}</Text>;
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
            <TouchableOpacity style={styles.dropdownItem} onPress={navigateToViolations}>
              <Image source={require('../../assets/images/violation.png')} style={styles.dropdownIcon} />
              <Text style={styles.dropdownText}>Student Violations</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dropdownItem} onPress={navigateToCSslips}>
              <Image source={require('../../assets/images/slip.png')} style={styles.dropdownIcon} />
              <Text style={styles.dropdownText}>Student CS Slips</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dropdownItem} onPress={handleLogout}>
              <Image source={require('../../assets/images/logout.png')} style={styles.dropdownIcon} />
              <Text style={styles.dropdownText}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}

        <ScrollView style={styles.container}>
          <Text style={styles.screenTitle}>List of Community Service Slips</Text>
          <View style={styles.breakLine} />

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={studentStatus}
              style={styles.picker}
              onValueChange={(itemValue) => {
                setStudentStatus(itemValue);
                filterCsSlips(itemValue);
              }}
            >
              <Picker.Item label="All Students" value="all" />
              {csSlips.map((csSlipData, index) => (
                <Picker.Item key={index} label={csSlipData.studentName} value={csSlipData.studentName} />
              ))}
            </Picker>
          </View>

          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableHeader}>Student Name</Text>
              <Text style={styles.tableHeader}>Area of Community Service</Text>
            </View>
            {filteredCsSlips.length > 0 ? (
              filteredCsSlips.map((csSlipData, index) => (
                csSlipData.csSlips.map((csSlip, csIndex) => (
                  <View style={styles.tableRow} key={csIndex}>
                    <Text style={styles.tableCell}>{csSlipData.studentName}</Text>
                    <Text style={styles.tableCell}>{csSlip.areaOfCommServ.stationName}</Text>
                  </View>
                ))
              ))
            ) : (
              <Text>No Community Service Slips found for the selected student.</Text>
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
    right: 20,
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
  pickerContainer: {
    marginLeft: 10,
    marginBottom: 10,
    height: 40,
    width: '60%',
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  picker: {
    width: '100%',
    color: '#000000',
  },
  table: {
    margin: 10,
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#E8E8E8',
  },
  tableHeader: {
    flex: 1,
    padding: 10,
    textAlign: 'center',
    fontWeight: 'bold',
    backgroundColor: '#F0F0F0',
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    padding: 10,
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    padding: 20,
  },
});

export default GuestCsSlip;
