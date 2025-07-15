import React, { useRef, useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Textos en ambos idiomas
const translations = {
  en: {
    requestingPermissions: "Requesting permissions...",
    cameraPermissionTitle: "Camera Access Required",
    cameraPermissionMessage: "We need access to your camera to take photos and identify objects for learning.",
    grantPermission: "Grant Permission",
    takePhoto: "Take Photo",
    retakePhoto: "Retake Photo",
    photoTaken: "Photo Taken",
    tapToTakePhoto: "Tap the button to take a photo",
    preparing: "Preparing camera...",
    photoSaved: "Photo captured successfully!",
    error: "Error",
    cameraError: "Camera error occurred. Please try again.",
    permissionDenied: "Camera permission denied",
    permissionDeniedMessage: "Cannot take photos without camera permission. Please enable it in settings."
  },
  es: {
    requestingPermissions: "Solicitando permisos...",
    cameraPermissionTitle: "Acceso a Cámara Requerido",
    cameraPermissionMessage: "Necesitamos acceso a tu cámara para tomar fotos e identificar objetos para el aprendizaje.",
    grantPermission: "Conceder Permiso",
    takePhoto: "Tomar Foto",
    retakePhoto: "Tomar Otra Foto",
    photoTaken: "Foto Tomada",
    tapToTakePhoto: "Toca el botón para tomar una foto",
    preparing: "Preparando cámara...",
    photoSaved: "¡Foto capturada exitosamente!",
    error: "Error",
    cameraError: "Ocurrió un error con la cámara. Inténtalo de nuevo.",
    permissionDenied: "Permiso de cámara denegado",
    permissionDeniedMessage: "No se pueden tomar fotos sin permiso de cámara. Por favor habilítalo en configuración."
  }
};

export default function CameraScreen({ onPhotoTaken, language = 'en' }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState(null);
  const [showCamera, setShowCamera] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const cameraRef = useRef(null);

  // Función para obtener texto traducido
  const t = (key) => {
    return translations[language][key] || translations.en[key] || key;
  };

  useEffect(() => {
    // Reset camera state when component mounts
    setCameraReady(false);
    setIsLoading(false);
  }, []);

  if (!permission) {
    // Camera permissions are still loading
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <View style={styles.spinner} />
          <Text style={styles.loadingText}>{t('requestingPermissions')}</Text>
        </View>
      </View>
    );
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.permissionContainer}>
        <LinearGradient
          colors={['#2c3e50', '#3498db', '#5dade2']}
          style={styles.permissionGradient}
        >
          <View style={styles.permissionContent}>
            <View style={styles.permissionIcon}>
              <Text style={styles.permissionIconText}>📷</Text>
            </View>
            
            <Text style={styles.permissionTitle}>
              {t('cameraPermissionTitle')}
            </Text>
            
            <Text style={styles.permissionMessage}>
              {t('cameraPermissionMessage')}
            </Text>
            
            <TouchableOpacity
              style={styles.permissionButton}
              onPress={requestPermission}
            >
              <LinearGradient
                colors={['#27ae60', '#2ecc71']}
                style={styles.permissionButtonGradient}
              >
                <Text style={styles.permissionButtonText}>
                  {t('grantPermission')}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  const takePhoto = async () => {
    if (cameraRef.current && cameraReady && !isLoading) {
      try {
        setIsLoading(true);
        
        const photoData = await cameraRef.current.takePictureAsync({ 
          base64: true,
          quality: 0.7,
          exif: false
        });
        
        setPhoto(photoData);
        setShowCamera(false);
        onPhotoTaken(photoData);
        
        // Simulate success feedback
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
        
      } catch (error) {
        console.error('Error taking photo:', error);
        setIsLoading(false);
        // You could show an error message here
      }
    }
  };

  const retakePhoto = () => {
    setPhoto(null);
    setShowCamera(true);
    setCameraReady(false);
    setIsLoading(false);
  };

  const handleCameraReady = () => {
    setCameraReady(true);
  };

  return (
    <View style={styles.container}>
      {showCamera ? (
        <>
          <CameraView 
            style={styles.camera} 
            ref={cameraRef} 
            facing="back"
            onCameraReady={handleCameraReady}
          />
          
          {/* Camera overlay with instructions */}
          <View style={styles.overlay}>
            <View style={styles.topOverlay}>
              <Text style={styles.instructionText}>
                {cameraReady ? t('tapToTakePhoto') : t('preparing')}
              </Text>
            </View>
            
            {/* Viewfinder frame */}
            <View style={styles.viewfinderContainer}>
              <View style={styles.viewfinder}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
              </View>
            </View>
            
            {/* Bottom controls */}
            <View style={styles.bottomControls}>
              <TouchableOpacity
                style={[
                  styles.captureButton,
                  (!cameraReady || isLoading) && styles.captureButtonDisabled
                ]}
                onPress={takePhoto}
                disabled={!cameraReady || isLoading}
              >
                <View style={styles.captureButtonInner}>
                  {isLoading ? (
                    <View style={styles.captureSpinner} />
                  ) : (
                    <Text style={styles.captureButtonText}>📸</Text>
                  )}
                </View>
              </TouchableOpacity>
              
              <Text style={styles.captureButtonLabel}>
                {isLoading ? t('photoSaved') : t('takePhoto')}
              </Text>
            </View>
          </View>
        </>
      ) : (
        <View style={styles.previewContainer}>
          <LinearGradient
            colors={['#2c3e50', '#34495e']}
            style={styles.previewGradient}
          >
            <View style={styles.previewContent}>
              <Text style={styles.previewTitle}>{t('photoTaken')}</Text>
              
              {photo && (
                <View style={styles.imageContainer}>
                  <Image 
                    source={{ uri: photo.uri }} 
                    style={styles.previewImage}
                    resizeMode="contain"
                  />
                </View>
              )}
              
              <TouchableOpacity
                style={styles.retakeButton}
                onPress={retakePhoto}
              >
                <LinearGradient
                  colors={['#3498db', '#2980b9']}
                  style={styles.retakeButtonGradient}
                >
                  <Text style={styles.retakeButtonText}>
                    {t('retakePhoto')}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  
  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
  },
  loadingContent: {
    alignItems: 'center',
  },
  spinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#3498db',
    borderTopColor: 'transparent',
    marginBottom: 20,
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
  },
  
  // Permission styles
  permissionContainer: {
    flex: 1,
  },
  permissionGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionContent: {
    alignItems: 'center',
    padding: 30,
    maxWidth: width * 0.8,
  },
  permissionIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  permissionIconText: {
    fontSize: 40,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 15,
  },
  permissionMessage: {
    fontSize: 16,
    color: '#ecf0f1',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  permissionButton: {
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  permissionButtonGradient: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  permissionButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  // Camera styles
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  topOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  instructionText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  
  // Viewfinder styles
  viewfinderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewfinder: {
    width: width * 0.7,
    height: width * 0.7,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#ffffff',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  
  // Bottom controls
  bottomControls: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 5,
    borderColor: '#3498db',
    marginBottom: 10,
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonText: {
    fontSize: 24,
  },
  captureSpinner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ffffff',
    borderTopColor: 'transparent',
  },
  captureButtonLabel: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Preview styles
  previewContainer: {
    flex: 1,
  },
  previewGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContent: {
    alignItems: 'center',
    padding: 20,
    width: '100%',
  },
  previewTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
  },
  imageContainer: {
    width: '100%',
    maxWidth: 300,
    aspectRatio: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 30,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  retakeButton: {
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  retakeButtonGradient: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  retakeButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});