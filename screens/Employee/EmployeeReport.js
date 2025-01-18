import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, ScrollView, Image, TextInput, TouchableWithoutFeedback, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EmployeeReport = () => {
  const [report, setReport] = useState({
    studentID: '',
    fullName: '',
    section: '',
    clusterHead: '',
    hoursRequired: '',
    hoursToDeduct: '',
    areaOfService: '',
    reasonForService: '',
    dateOfCS: new Date(),
    hoursCompleted: '',
    natureOfWork: '',
    status: '',
    totalHoursCompleted: '',
    remainingHours: '',
    timeIn: new Date(),
    timeOut: new Date(),
    remarks: ''
  });

  const [csSlips, setCsSlips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completedHours, setCompletedHours] = useState(0);
  const [remainingHours, setRemainingHours] = useState(0);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [totalCsHours, setTotalCsHours] = useState('');
  const [deduction, setDeduction] = useState(0);
  const [reports, setReports] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [timeInPickerVisible, setTimeInPickerVisible] = useState(false);
  const [timeOutPickerVisible, setTimeOutPickerVisible] = useState(false);
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [role, setRole] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserRoleAndToken = async () => {
      try {
        const storedRole = await AsyncStorage.getItem('role');
        const storedToken = await AsyncStorage.getItem('token');
        const storedEmployeeNumber = await AsyncStorage.getItem('employeeNumber');

        if (!storedToken || !storedRole || !storedEmployeeNumber) {
          Alert.alert('Error', 'Session expired. Please log in again.');
          handleLogout();
          return;
        }

        if (storedRole !== 'ROLE_ROLE_EMPLOYEE') {
          Alert.alert('Unauthorized Access', 'You do not have permission to access this page.');
          handleLogout();
          return;
        }

        setRole(storedRole);
        setEmployeeNumber(storedEmployeeNumber);
        fetchEmployeeData(storedEmployeeNumber);
      } catch (err) {
        console.error('Initialization error:', err);
        Alert.alert('Error', 'An error occurred during initialization. Please log in again.');
        handleLogout();
      }
    };

    fetchUserRoleAndToken();
  }, []);

  const fetchEmployeeData = async () => {
    try {
        const token = await AsyncStorage.getItem('token');
        const storedEmployeeNumber = await AsyncStorage.getItem('employeeNumber');

        if (!token || !storedEmployeeNumber) {
            Alert.alert('Error', 'Session expired. Please log in again.');
            handleLogout();
            return;
        }

        const response = await fetch(`https://amused-gnu-legally.ngrok-free.app/employee/employeeNumber/${storedEmployeeNumber}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            setError('Failed to fetch employee data.');
            setLoading(false);
            return;
        }

        const responseText = await response.text();

        if (!responseText) {
            setError('No data received.');
            setLoading(false);
            return;
        }

        let employeeData;
        try {
            employeeData = JSON.parse(responseText);
        } catch {
            setError('Failed to parse employee data.');
            setLoading(false);
            return;
        }

        if (employeeData.httpStatusCode === 403) {
            Alert.alert('Session Expired', 'Your session has expired. Please log in again.');
            handleLogout();
            return;
        }

        if (!employeeData || !employeeData.station) {
            setError('Station data is missing.');
            setLoading(false);
            return;
        }

        const stationName = employeeData.station.stationName;

        const slipResponse = await fetch(`https://amused-gnu-legally.ngrok-free.app/csSlip/areaOfCs/${stationName}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });

        const slipResponseText = await slipResponse.text();

        if (!slipResponseText) {
            setError('No CS slips available.');
            setLoading(false);
            return;
        }

        let slipData;
        try {
            slipData = JSON.parse(slipResponseText);
        } catch {
            setError('Failed to parse CS slip data.');
            setLoading(false);
            return;
        }

        setCsSlips(slipData);
        setLoading(false);
    } catch {
        setError('Error fetching CS slips');
        setLoading(false);
    }
};

  
const loadTotalCsHours = async (studentNumber) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const url = `https://amused-gnu-legally.ngrok-free.app/csSlip/totalCsHours/${studentNumber}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error('Failed to fetch total CS hours');

    const data = await response.json();
    setTotalCsHours(data);
  } catch (error) {
    setTotalCsHours('N/A');
    console.error('Error:', error.message || error);
  }
};


  const handleChange = (field, value) => {
    setReport((prevReport) => ({
      ...prevReport,
      [field]: value,
    }));
  };

  const onDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setReport((prevReport) => ({
        ...prevReport,
        dateOfCS: selectedDate,
      }));
    }
    setDatePickerVisible(false);
  };
  

  const onTimeInChange = (event, selectedTime) => {
    setReport((prevReport) => ({
      ...prevReport,
      timeIn: selectedTime || prevReport.timeIn,
      timeOut: null,
    }));
    setTimeInPickerVisible(false);
  };

  const onTimeOutChange = (event, selectedTime) => {
    const { timeIn } = report;
  
    if (!timeIn) {
      Alert.alert('Invalid Input', 'Please select Time In first.');
      return;
    }
  
    if (selectedTime && selectedTime <= timeIn) {
      Alert.alert('Invalid Input', 'Time Out must be later than Time In.');
      return;
    }
  
    const differenceInHours = (selectedTime - timeIn) / (1000 * 60 * 60);
    if (differenceInHours < 1) {
      Alert.alert('Invalid Input', 'Time difference must be at least 1 hour.');
      return;
    }
  
    setReport((prevReport) => ({
      ...prevReport,
      timeOut: selectedTime || prevReport.timeOut,
    }));
    setTimeOutPickerVisible(false);
  };
  

  const handleSubmit = async () => {
    const { csSlipId, dateOfCS, timeIn, timeOut, natureOfWork, remarks, status } = report;
  
    if (!csSlipId || !dateOfCS || !timeIn || !timeOut || !natureOfWork || !status) {
      Alert.alert("Error", "All fields are required.");
      return;
    }

    const timeDifference = (timeOut - timeIn) / (1000 * 60 * 60);
    const hoursCompleted = Math.floor(timeDifference);
  
    const payload = {
      dateOfCs: new Date(dateOfCS).toISOString(),
      timeIn: new Date(timeIn).toISOString(),
      timeOut: new Date(timeOut).toISOString(),
      hoursCompleted,
      natureOfWork,
      status: status.toLowerCase(),
      remarks,
    };
  
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `https://amused-gnu-legally.ngrok-free.app/csreport/addCsReportForSlip/${csSlipId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
  
      if (response.ok) {
        Alert.alert("Success", "Report added successfully.");
        setModalVisible(false);
        setReport({
          csSlipId: "",
          studentID: "",
          fullName: "",
          section: "",
          clusterHead: "",
          areaOfService: "",
          reasonForService: "",
          dateOfCS: new Date(),
          timeIn: new Date(),
          timeOut: new Date(),
          hoursCompleted: "",
          natureOfWork: "",
          status: "",
          remarks: "",
        });
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.message || "Failed to add report.");
      }
    } catch (error) {
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

  const handleRowClick = async (csSlip) => {
    const studentNumber = csSlip.student.studentNumber;
    const csSlipId = csSlip.id;

    setReport((prevReport) => ({
      ...prevReport,
      csSlipId,
      studentID: studentNumber,
      fullName: `${csSlip.student.firstName} ${csSlip.student.lastName}`,
      section: csSlip.student.section.sectionName,
      clusterHead: csSlip.student.section.clusterHead,
      areaOfService: csSlip.areaOfCommServ.stationName,
      reasonForService: csSlip.reasonOfCs,
      dateOfCS: csSlip.dateOfCs ? new Date(csSlip.dateOfCs) : new Date(),
      natureOfWork: csSlip.natureOfWork || '',
      status: csSlip.status || '',
      timeIn: new Date(),
      timeOut: new Date(),
      remarks: '',
      totalHoursCompleted: 0,
      remainingHours: 0,
    }));

    const csDeduction = csSlip.deduction || 0;
    setDeduction(csDeduction);

    await loadTotalCsHours(studentNumber);

    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`https://amused-gnu-legally.ngrok-free.app/csSlip/commServSlip/${csSlipId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const responseText = await response.text();
      if (!response.ok) {
        throw new Error(`Failed to fetch reports for csSlipId ${csSlipId}, status code: ${response.status}`);
      }

      const fetchedReports = JSON.parse(responseText);

      if (!Array.isArray(fetchedReports.reports)) {
        throw new Error("Fetched reports is not an array under 'reports'.");
      }

      setReports(fetchedReports.reports);

      const hoursCompleted = fetchedReports.reports.reduce((sum, report) => sum + (report.hoursCompleted || 0), 0);

      const totalCompleted = hoursCompleted + csDeduction;
      setCompletedHours(totalCompleted);

      const remainingHours = totalCsHours ? totalCsHours - totalCompleted : 0;
      setRemainingHours(remainingHours);

      setReport((prevReport) => ({
        ...prevReport,
        totalHoursCompleted: totalCompleted,
        remainingHours,
      }));
    } catch (error) {
      console.error('Error fetching reports for csSlipId:', csSlipId, error);
      setReports([]);
    }
  };
  
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
              <TouchableOpacity style={styles.dropdownItem} onPress={handleLogout}>
                <Image source={require('../../assets/images/logout.png')} style={styles.dropdownIcon} />
                <Text style={styles.dropdownText}>Logout</Text>
              </TouchableOpacity>
            </View>
          )}

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
        >
        
          <Text style={styles.screenTitle}>Community Service Slips</Text>
          <View style={styles.breakLine} />

          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableHeader}>Student ID</Text>
              <Text style={styles.tableHeader}>Student Name</Text>
              <Text style={styles.tableHeader}>Area of Community Service</Text>
            </View>
            {csSlips.length > 0 ? (
              csSlips.map((csSlip, index) => (
                <TouchableOpacity key={index} onPress={() => handleRowClick(csSlip)}>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableCell}>{csSlip.student.studentNumber}</Text>
                    <Text style={styles.tableCell}>{`${csSlip.student.firstName} ${csSlip.student.lastName}`}</Text>
                    <Text style={styles.tableCell}>{csSlip.areaOfCommServ.stationName}</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>No CS slips available</Text>
              </View>
            )}
          </View>

          <Text style={styles.screenTitle}>Community Service Report</Text>
          <View style={styles.breakLine} />

          <Text style={styles.label}>Student ID</Text>
          <TextInput
            style={styles.input}
            placeholder="Student ID"
            value={report.studentID}
            editable={false}
          />

          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={report.fullName}
            editable={false}
          />

          <Text style={styles.label}>Section</Text>
          <TextInput
            style={styles.input}
            placeholder="Section"
            value={report.section}
            editable={false}
          />

          <Text style={styles.label}>Cluster Head</Text>
          <TextInput
            style={styles.input}
            placeholder="Cluster Head"
            value={report.clusterHead}
            editable={false}
          />

          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <Text style={styles.placeholderText}>Hours Required</Text>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Enter Hours Required"
                value={totalCsHours ? totalCsHours.toString() : ""}
                editable={false}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.placeholderText}>Hours to Deduct</Text>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Enter Hours to Deduct"
                value={deduction ? deduction.toString() : ""}
                editable={false}
              />
            </View>
          </View>

          <Text style={styles.label}>Area of Community Service</Text>
          <TextInput
            style={styles.input}
            placeholder="Area of Community Service"
            value={report.areaOfService}
            editable={false}
          />

          <Text style={styles.label}>Reason for Community Service</Text>
          <TextInput
            style={styles.input}
            placeholder="Reason for Community Service"
            value={report.reasonForService}
            editable={false}
          />

          <View style={styles.table2}>
            <View style={styles.tableRow}>
              <Text style={styles.tableHeader}>Date of CS</Text>
              <Text style={styles.tableHeader}>Hours Completed</Text>
              <Text style={styles.tableHeader}>Nature of Work</Text>
              <Text style={styles.tableHeader}>Status</Text>
            </View>
            
            {reports.length > 0 ? (
              reports.map((report, index) => (
                <View style={styles.tableRow} key={report.id || index}>
                  <Text style={styles.tableCell}>
                    {report.dateOfCs ? new Date(report.dateOfCs).toLocaleDateString() : 'N/A'}
                  </Text>
                  <Text style={styles.tableCell}>{report.hoursCompleted || 'N/A'}</Text>
                  <Text style={styles.tableCell}>{report.natureOfWork || 'N/A'}</Text>
                  <Text style={styles.tableCell}>{report.status || 'N/A'}</Text>
                </View>
              ))
            ) : (
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>No reports available</Text>
              </View>
            )}


            <View style={styles.tableRow}>
              <Text style={styles.summaryCell}>Total Hours Completed:</Text>
              <Text style={styles.summaryValue}>{completedHours}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.summaryCell}>Remaining Hours:</Text>
              <Text style={styles.summaryValue}>{remainingHours}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.addButton, report.studentID ? {} : { backgroundColor: '#ccc' }]}
            onPress={() => {
              if (report.studentID) {
                setModalVisible(true);
              } else {
                Alert.alert('Error', 'Please select a student before adding a report.');
              }
            }}
            disabled={!report.studentID}
          >
            <Text style={styles.buttonText}>Add Report</Text>
          </TouchableOpacity>

          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(!modalVisible)}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(!modalVisible)}
                >
                  <Image source={require('../../assets/images/close.png')} style={styles.closeIcon} />
                </TouchableOpacity>

                <Text style={styles.label2}>Date of CS</Text>
                <TouchableOpacity onPress={() => setDatePickerVisible(true)} style={styles.modalInput}>
                  <Text style={styles.textInput}>
                    {report.dateOfCS ? new Date(report.dateOfCS).toLocaleDateString() : ''}
                  </Text>
                  <Image style={styles.icon} source={require('../../assets/images/calendar-1.png')} />
                </TouchableOpacity>
                {datePickerVisible && (
                  <DateTimePicker
                    value={report.dateOfCS}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                  />
                )}

                <Text style={styles.label2}>Time In</Text>
                <TouchableOpacity onPress={() => setTimeInPickerVisible(true)} style={styles.modalInput}>
                  <Text style={styles.textInput}>
                    {report.timeIn ? new Date(report.timeIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </Text>
                  <Image style={styles.icon} source={require('../../assets/images/clock.png')} />
                </TouchableOpacity>
                {timeInPickerVisible && (
                  <DateTimePicker
                    value={report.timeIn}
                    mode="time"
                    display="default"
                    onChange={onTimeInChange}
                  />
                )}

                <Text style={styles.label2}>Time Out</Text>
                {report.timeIn ? (
                  <TouchableOpacity
                    onPress={() => setTimeOutPickerVisible(true)}
                    style={styles.modalInput}
                  >
                    <Text style={styles.textInput}>
                      {report.timeOut
                        ? new Date(report.timeOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : ''}
                    </Text>
                    <Image style={styles.icon} source={require('../../assets/images/clock.png')} />
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.errorText}>
                    Please select Time In before setting Time Out.
                  </Text>
                )}

                {timeOutPickerVisible && (
                  <DateTimePicker
                    value={report.timeOut || new Date()}
                    mode="time"
                    display="default"
                    onChange={onTimeOutChange}
                  />
                )}


                <Text style={styles.label2}>Nature of Work</Text>
                <View style={styles.modalInput}>
                  <TextInput
                    style={styles.natureOfWorkInput}
                    placeholder="Nature of Work"
                    value={report.natureOfWork}
                    onChangeText={(text) => handleChange('natureOfWork', text)}
                  />
                </View>

                <Text style={styles.label2}>Status</Text>
                <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={report.status}
                  onValueChange={(itemValue) => handleChange('status', itemValue)}
                  style={styles.pickerStyle}
                >
                  <Picker.Item label="Select Status" value="" />
                  <Picker.Item label="Complete" value="Complete" />
                  <Picker.Item label="Incomplete" value="Incomplete" />
                </Picker>
                </View>


                <Text style={styles.label2}>Remarks</Text>
                <View style={styles.modalInput}>
                  <TextInput
                    style={styles.remarksInput}
                    placeholder="Remarks"
                    value={report.remarks}
                    onChangeText={(text) => handleChange('remarks', text)}
                  />
                </View>

                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                  <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>

              </View>
            </View>
          </Modal>

          
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
  contentContainer: {
    padding: 20,
    paddingBottom: 60,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'left',
    marginVertical: 10,
    marginLeft: 10,
  },
  breakLine: {
    borderBottomColor: '#D3D3D3',
    borderBottomWidth: 2,
    marginHorizontal: 0,
    marginBottom: 10,
  },
  table: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#CCC',
  },
  table2: {
    marginBottom: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#CCC',
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
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    backgroundColor: 'white',
    marginBottom: 5,
    justifyContent: 'space-between',
    width: '100%',
    height: 40,
  },
  pickerStyle: {
    height: 50,
    width: '100%',
    color: '#000',
    fontSize: 16,
  },
  natureOfWorkInput: {
    width: '100%',
    height: 20,
    backgroundColor: 'white',
    padding: 4,
    fontSize: 12,
    lineHeight: 16,
  },
  
  remarksInput: {
    width: '100%',
    height: 50,
    backgroundColor: 'white',
    padding: 4,
    fontSize: 12,
    lineHeight: 16,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  inputContainer: {
    flex: 1,
    marginRight: 10,
  },
  placeholderText: {
    fontSize: 14,
    marginBottom: 5,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#0072BB',
    padding: 10,
    width: '60%',
    alignSelf: 'flex-end',
    borderRadius: 5,
    marginBottom: -20,
    marginTop: 40,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  closeIcon: {
    width: 15,
    height: 15,
    resizeMode: 'contain',
  },
  summaryCell: {
    flex: 1,
    textAlign: 'center',
    borderColor: '#E8E8E8',
    paddingVertical: 8,
    borderBottomWidth: 0,
  },
  summaryValue: {
    flex: 1,
    textAlign: 'center',
    borderColor: '#E8E8E8',
    paddingVertical: 8,
    borderBottomWidth: 0,
  },
  icon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    marginLeft: 'auto'
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    marginLeft: 10,
    color: '#333',
  },
  label2: {
    fontSize: 14,
    alignSelf: 'flex-start',
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  dropdownLabel: {
    fontSize: 16,
    marginRight: 10
  },
  dropdownButton: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: "center",
    fontWeight: 'bold',
    fontSize: 18
  },
  modalInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    backgroundColor: 'white',
    marginBottom: 5,
    justifyContent: 'space-between',
    width: '100%',
  },
  textInput: {
    flex: 1,
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: '#0072BB',
    borderRadius: 5,
    padding: 10,
    elevation: 2,
    width: '60%',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center'
  }
});


export default EmployeeReport;
