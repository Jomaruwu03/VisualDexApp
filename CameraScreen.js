// CameraScreen.js
import React, { useRef, useState, useEffect } from 'react';
import { View, Button, Text, Image } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function CameraScreen({ onPhotoTaken }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState(null);
  const [showCamera, setShowCamera] = useState(true);
  const cameraRef = useRef(null);

  if (!permission) {
    // Camera permissions are still loading
    return <Text>Solicitando permisos...</Text>;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
        <Text style={{ textAlign: 'center', marginBottom: 20 }}>
          Necesitamos acceso a la cámara para tomar fotos
        </Text>
        <Button onPress={requestPermission} title="Conceder permiso" />
      </View>
    );
  }

  const takePhoto = async () => {
    if (cameraRef.current) {
      const photoData = await cameraRef.current.takePictureAsync({ 
        base64: true,
        quality: 0.7 
      });
      setPhoto(photoData);
      setShowCamera(false);
      onPhotoTaken(photoData);
    }
  };

  const retakePhoto = () => {
    setPhoto(null);
    setShowCamera(true);
  };

  return (
    <View style={{ flex: 1 }}>
      {showCamera ? (
        <>
          <CameraView style={{ flex: 1 }} ref={cameraRef} facing="back" />
          <View style={{ 
            position: 'absolute', 
            bottom: 50, 
            left: 0, 
            right: 0, 
            alignItems: 'center' 
          }}>
            <Button title="Tomar foto" onPress={takePhoto} />
          </View>
        </>
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          {photo && (
            <>
              <Image 
                source={{ uri: photo.uri }} 
                style={{ width: '100%', height: 300, marginBottom: 20 }} 
                resizeMode="contain"
              />
              <View style={{ flexDirection: 'row', gap: 15 }}>
                <Button title="Tomar otra foto" onPress={retakePhoto} />
              </View>
            </>
          )}
        </View>
      )}
    </View>
  );
}
