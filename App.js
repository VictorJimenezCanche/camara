import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert
} from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import * as ImagePicker from 'expo-image-picker'
import * as MediaLibrary from 'expo-media-library' // 👈 nuevo import

export default function CameraGalleryApp() {
  const [permission, requestPermission] = useCameraPermissions()
  const [hasGalleryPermission, setHasGalleryPermission] = useState(null)
  const [facing, setFacing] = useState('back')
  const [capturedImage, setCapturedImage] = useState(null)
  const [showCamera, setShowCamera] = useState(false)
  const cameraRef = useRef(null)

  useEffect(() => {
    requestGalleryPermission()
    requestMediaLibraryPermission() // 👈 solicitar permiso para guardar
  }, [])

  const requestGalleryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    setHasGalleryPermission(status === 'granted')
  }

  const requestMediaLibraryPermission = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'No se podrá guardar en la galería')
    }
  }

  if (hasGalleryPermission === false) {
    Alert.alert('Permiso denegado', 'Enviando tu ubicación al FBI')
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 1.0 })
        setCapturedImage(photo.uri)
        setShowCamera(false)
      } catch (error) {
        Alert.alert('Error', 'No se pudo tomar la foto')
        console.log(error)
      }
    }
  }

  const savePhotoToGallery = async () => { // 👈 nueva función
    if (!capturedImage) return
    try {
      const asset = await MediaLibrary.createAssetAsync(capturedImage)
      await MediaLibrary.createAlbumAsync('CameraGalleryApp', asset, false)
      Alert.alert('Éxito', 'La foto se guardó en la galería 📸')
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la foto')
      console.log(error)
    }
  }

  const pickImageFromGallery = async () => {
    if (!hasGalleryPermission) {
      Alert.alert('Error', 'No tienes permiso para acceder a la galería')
      return
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 1.0
      })

      if (!result.canceled) {
        setCapturedImage(result.assets[0].uri)
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo abrir la galería')
      console.log(error)
    }
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'))
  }

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text>Solicitando permisos...</Text>
      </View>
    )
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No se ha concedido acceso a la cámara</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Solicitar acceso a la cámara</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (showCamera) {
    return (
      <View style={styles.fullscreen}>
        <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
          <View style={styles.cameraButtonContainer}>
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={toggleCameraFacing}
            >
              <Text style={styles.cameraButtonText}>Voltear</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <View style={styles.captureButtonInner}></View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cameraButton}
              onPress={() => setShowCamera(false)}
            >
              <Text style={styles.cameraButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cámara y galería</Text>

      {capturedImage && (
        <Image source={{ uri: capturedImage }} style={styles.preview} />
      )}

      <TouchableOpacity style={styles.button} onPress={() => setShowCamera(true)}>
        <Text style={styles.buttonText}>📷 Abrir cámara</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={pickImageFromGallery}>
        <Text style={styles.buttonText}>🦃 Abrir galería</Text>
      </TouchableOpacity>

      {capturedImage && (
        <>
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={savePhotoToGallery}
          >
            <Text style={styles.buttonText}>💾 Guardar foto</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.clearButton]}
            onPress={() => setCapturedImage(null)}
          >
            <Text style={styles.buttonText}>🧹 Limpiar imagen</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  fullscreen: {
    flex: 1
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333'
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666'
  },
  button: {
    backgroundColor: '#007aff',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    marginVertical: 10,
    minWidth: 200,
    alignItems: 'center'
  },
  saveButton: { // 👈 nuevo estilo
    backgroundColor: '#28a745'
  },
  clearButton: {
    backgroundColor: '#ff3b30'
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  preview: {
    width: 300,
    height: 300,
    borderRadius: 10,
    marginBottom: 20
  },
  camera: {
    flex: 1
  },
  cameraButtonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingBottom: 40
  },
  cameraButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10
  },
  cameraButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(0,0,0,0.3)'
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff'
  }
})
