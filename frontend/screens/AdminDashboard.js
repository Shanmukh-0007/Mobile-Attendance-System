import React from 'react';
import { View, Button, StyleSheet, Alert, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing'; // Add Sharing for alternative sharing options
import CONFIG from '../config';

const AdminDashboard = ({ navigation }) => {
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Error logging out: ', error);
    }
  };

  const goToManageStudents = () => {
    navigation.navigate('ManageStudents');
  };

  const goToManageClasses = () => {
    navigation.navigate('ManageClasses');
  };

  const handleDownloadReport = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const downloadUrl = `${CONFIG.BASE_URL}/api/attendance/report/excel`;
      const fileUri = FileSystem.documentDirectory + 'Attendance_Report.xlsx';

      const response = await FileSystem.downloadAsync(downloadUrl, fileUri, {
        headers: { Authorization: `${token}` },
      });

      console.log('Download response:', response);

      if (response.status === 200) {
        // Move the downloaded file to a more accessible location
        const publicUri =
          FileSystem.documentDirectory + 'Attendance_Report.xlsx';
        const moveToUri = FileSystem.cacheDirectory + 'Attendance_Report.xlsx';

        await FileSystem.moveAsync({
          from: fileUri,
          to: moveToUri,
        });

        // Optionally, use Sharing API to directly share the file or open in Excel
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(moveToUri);
        } else {
          Alert.alert('File Saved', 'The report has been saved successfully.');
        }

        // Attempt to open the file directly using its URI
        const fileUrl = `file://${moveToUri}`;
        Linking.openURL(fileUrl).catch((err) => {
          console.error('Error opening file: ', err);
          Alert.alert('Error', 'Failed to open the report.');
        });

        Alert.alert(
          'Download Successful',
          'The report has been downloaded and will be opened.'
        );
      } else {
        Alert.alert('Error', 'Failed to download the report');
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      Alert.alert('Error', 'Failed to download the report');
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Manage Students" onPress={goToManageStudents} />
      <Button title="Manage Classes" onPress={goToManageClasses} />
      <Button
        title="Download Attendance Report"
        onPress={handleDownloadReport}
        color="blue"
      />
      <Button title="Logout" onPress={handleLogout} color="red" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15, // Adds space between buttons
  },
});

export default AdminDashboard;
