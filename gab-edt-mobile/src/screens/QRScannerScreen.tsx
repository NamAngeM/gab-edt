import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export const QRScannerScreen = ({ navigation }: any) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    
    try {
      const payload = JSON.parse(data);
      if (payload.type === 'ROOM') {
        Alert.alert(
          `Salle détectée : ${payload.name}`,
          `ID de la salle : ${payload.id}\n\nVoulez-vous consulter le planning de cette salle ?`,
          [
            { text: 'Non, fermer', onPress: () => setScanned(false), style: 'cancel' },
            { 
              text: 'Oui', 
              onPress: () => {
                setScanned(false);
                navigation.replace('RoomSchedule', { roomId: payload.id, roomName: payload.name });
              } 
            },
          ]
        );
      } else {
        Alert.alert('QR Code Inconnu', `Données scannées : ${data}`, [
          { text: 'OK', onPress: () => setScanned(false) }
        ]);
      }
    } catch (e) {
      // Not a JSON payload, probably a URL or plain text
      Alert.alert('QR Code scanné', data, [
        { text: 'OK', onPress: () => setScanned(false) }
      ]);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Demande d'autorisation de la caméra...</Text>
      </View>
    );
  }
  
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center', marginBottom: 20 }}>
          Pas d'accès à la caméra. 
          Veuillez autoriser l'application dans les paramètres de votre téléphone.
        </Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Scanner une Salle</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.cameraContainer}>
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          style={StyleSheet.absoluteFill}
        />
        
        {/* Overlay pour cibler le QR Code */}
        <View style={styles.overlay}>
          <View style={styles.unfocusedContainer}></View>
          <View style={styles.middleContainer}>
            <View style={styles.unfocusedContainer}></View>
            <View style={styles.focusedContainer}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            <View style={styles.unfocusedContainer}></View>
          </View>
          <View style={styles.unfocusedContainer}>
            <Text style={styles.instructionText}>
              Placez le QR Code de la salle au centre du cadre.
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#000',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  unfocusedContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  middleContainer: {
    flexDirection: 'row',
    flex: 2,
  },
  focusedContainer: {
    flex: 4,
    position: 'relative',
  },
  instructionText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    paddingHorizontal: 20,
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#fff',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  button: {
    backgroundColor: '#4F46E5',
    padding: 12,
    borderRadius: 8,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
