import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated, Dimensions, Alert } from 'react-native';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CameraScreen from './CameraScreen';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Textos en ambos idiomas
const translations = {
  en: {
    title: "Visual DeX",
    analyzing: "ANALYZING...",
    aiActive: "ADVANCED AI ACTIVE",
    processingImage: "PROCESSING IMAGE",
    translating: "TRANSLATING...",
    photoCaptured: "PHOTO CAPTURED",
    takeAnotherPhoto: "Take another photo?",
    welcomeMain: "WELCOME TO VISUAL DEX",
    systemDescription: "Contextual AI system for language learning",
    tapToCapture: "Tap the button to capture an object",
    examplesEnglish: "ENGLISH EXAMPLES",
    examplesSpanish: "EXAMPLES IN SPANISH",
    translate: "TRANSLATE",
    english: "ENGLISH",
    readAll: "READ ALL",
    newPhoto: "NEW PHOTO",
    reset: "RESET",
    confirmReset: "Confirm Reset",
    deleteObjects: "Delete data from {count} learned objects?",
    cancel: "Cancel",
    confirm: "Confirm",
    success: "Success",
    dataDeleted: "Learning data deleted",
    seen: "SEEN",
    times: "x",
    contextualAI: "CONTEXTUAL AI",
    objectsLearned: "OBJECTS LEARNED",
    context: "Context",
    level: "Level",
    error: "Error",
    noSentences: "No sentences to translate",
    backToWelcome: "Back to Welcome",
    backToMissions: "Back to Missions",
    missionMode: "Mission Mode",
    findObject: "Find this object",
    missionCompleted: "Mission Completed!",
    missionFailed: "Mission Failed",
    wrongObject: "Wrong object detected. Try again!",
    objectDetected: "Object detected",
    tryAgain: "Try Again",
    freePlayMode: "Free Play Mode",
    objectNotFound: "Object not found",
    objectNotFoundMessage: "No object was detected in the image. Please try again with a clearer photo."
  },
  es: {
    title: "Visual DeX",
    analyzing: "ANALIZANDO...",
    aiActive: "IA AVANZADA ACTIVA",
    processingImage: "PROCESANDO IMAGEN",
    translating: "TRADUCIENDO...",
    photoCaptured: "FOTO CAPTURADA",
    takeAnotherPhoto: "¿Tomar otra foto?",
    welcomeMain: "BIENVENIDO A VISUAL DEX",
    systemDescription: "Sistema de IA contextual para aprendizaje de idiomas",
    tapToCapture: "Toca el botón para capturar un objeto",
    examplesEnglish: "EJEMPLOS EN INGLÉS",
    examplesSpanish: "EJEMPLOS EN ESPAÑOL",
    translate: "TRADUCIR",
    english: "INGLÉS",
    readAll: "LEER TODO",
    newPhoto: "NUEVA FOTO",
    reset: "REINICIAR",
    confirmReset: "Confirmar Reinicio",
    deleteObjects: "¿Eliminar datos de {count} objetos aprendidos?",
    cancel: "Cancelar",
    confirm: "Confirmar",
    success: "Éxito",
    dataDeleted: "Datos de aprendizaje eliminados",
    seen: "VISTO",
    times: "x",
    contextualAI: "IA CONTEXTUAL",
    objectsLearned: "OBJETOS APRENDIDOS",
    context: "Contexto",
    level: "Nivel",
    error: "Error",
    noSentences: "No hay oraciones para traducir",
    backToWelcome: "Volver al Inicio",
    backToMissions: "Volver a Misiones",
    missionMode: "Modo Misión",
    findObject: "Encuentra este objeto",
    missionCompleted: "¡Misión Completada!",
    missionFailed: "Misión Fallida",
    wrongObject: "Objeto incorrecto detectado. ¡Inténtalo de nuevo!",
    objectDetected: "Objeto detectado",
    tryAgain: "Intentar de Nuevo",
    freePlayMode: "Modo Libre",
    objectNotFound: "Objeto no encontrado",
    objectNotFoundMessage: "No se detectó ningún objeto en la imagen. Intenta de nuevo con una foto más clara."
  }
};

export default function CameraApp({ 
  language = 'en', 
  onBackToWelcome, 
  onBackToMissions, 
  onPhotoTaken, 
  currentMission = null 
}) {
  const [objectName, setObjectName] = useState('');
  const [sentences, setSentences] = useState([]);
  const [translatedSentences, setTranslatedSentences] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [learningData, setLearningData] = useState({});
  const [scanAnimation] = useState(new Animated.Value(0));
  const [translationProgress, setTranslationProgress] = useState(0);
  const cameraScreenRef = useRef(null);

  // Determinar si estamos en modo misión
  const isMissionMode = currentMission !== null;

  // Función para obtener texto traducido
  const t = (key, params = {}) => {
    let text = translations[language][key] || translations.en[key] || key;
    
    // Reemplazar parámetros
    Object.keys(params).forEach(param => {
      text = text.replace(`{${param}}`, params[param]);
    });
    
    return text;
  };

  useEffect(() => {
    initializeLearningSystem();
    loadLearningData();
    startScanAnimation();
  }, []);

  const startScanAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(scanAnimation, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  };

  const initializeLearningSystem = async () => {
    try {
      console.log('Sistema de IA local inicializado correctamente');
      setModelLoaded(true);
    } catch (error) {
      console.error('Error inicializando sistema de IA:', error);
      setModelLoaded(false);
    }
  };

  const loadLearningData = async () => {
    try {
      const data = await AsyncStorage.getItem('learningData');
      if (data) {
        const parsedData = JSON.parse(data);
        setLearningData(parsedData);
        console.log('Datos de aprendizaje cargados:', Object.keys(parsedData).length, 'objetos');
      }
    } catch (error) {
      console.error('Error cargando datos de aprendizaje:', error);
    }
  };

  const saveLearningData = async (newData) => {
    try {
      await AsyncStorage.setItem('learningData', JSON.stringify(newData));
      console.log('Datos de aprendizaje guardados');
    } catch (error) {
      console.error('Error guardando datos de aprendizaje:', error);
    }
  };

  const handlePhoto = async (photo) => {
    try {
      setIsProcessing(true);
      setPhotoTaken(true);
      console.log('Foto tomada, procesando...', photo.uri);
      const base64 = photo.base64;
      
      if (!base64) {
        console.error('No se pudo obtener base64 de la imagen');
        setObjectName('Error: No se pudo procesar la imagen');
        return;
      }

      console.log('Base64 obtenido, enviando a Google Vision...');
      const label = await detectObject(base64);
      console.log('Objeto detectado:', label);
      
      if (label && label !== 'Error en la detección' && label !== 'Objeto no identificado') {
        setObjectName(label);
        
        // Si estamos en modo misión, verificar si es el objeto correcto
        if (isMissionMode) {
          const isCorrectObject = currentMission.objectKey.toLowerCase() === label.toLowerCase();
          
          if (isCorrectObject) {
            // Misión completada
            Alert.alert(
              t('missionCompleted'),
              `${t('objectDetected')}: ${label}`,
              [
                { 
                  text: 'OK', 
                  onPress: () => {
                    if (onPhotoTaken) {
                      onPhotoTaken(photo);
                    }
                  }
                }
              ]
            );
          } else {
            // Objeto incorrecto
            Alert.alert(
              t('missionFailed'),
              t('wrongObject'),
              [
                { text: t('tryAgain'), onPress: () => resetApp() }
              ]
            );
          }
        } else {
          // Modo libre - generar oraciones
          const aiSentences = await generateSentencesWithAdvancedAI(label);
          setSentences(aiSentences);
          setTranslatedSentences([]);
          setShowTranslation(false);
          
          if (onPhotoTaken) {
            onPhotoTaken(photo);
          }
        }
      } else {
        setObjectName('No se pudo detectar ningún objeto');
        setSentences([]);
        
        Alert.alert(
          t('objectNotFound'),
          t('objectNotFoundMessage'),
          [
            { text: t('tryAgain'), onPress: () => resetApp() }
          ]
        );
      }
    } catch (error) {
      console.error('Error en handlePhoto:', error);
      setObjectName('Error al procesar la imagen');
      setSentences([]);
      
      Alert.alert(
        t('error'),
        'Error al procesar la imagen. Inténtalo de nuevo.',
        [
          { text: t('tryAgain'), onPress: () => resetApp() }
        ]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const resetApp = () => {
    setObjectName('');
    setSentences([]);
    setTranslatedSentences([]);
    setPhotoTaken(false);
    setIsProcessing(false);
    setShowTranslation(false);
    setIsTranslating(false);
    setTranslationProgress(0);
  };

  const detectObject = async (base64) => {
    try {
      console.log('Detectando objeto con Google Vision API...');
      const body = {
        requests: [
          {
            image: { content: base64 },
            features: [{ type: "LABEL_DETECTION", maxResults: 1 }],
          },
        ],
      };

      const response = await fetch(
        "https://vision.googleapis.com/v1/images:annotate?key=AIzaSyBqOMU0jtfEQm04a_ESxAl9l0Qyn-Jbm0k",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Respuesta de Google Vision:', data);

      if (data.responses && data.responses[0] && data.responses[0].labelAnnotations && data.responses[0].labelAnnotations.length > 0) {
        return data.responses[0].labelAnnotations[0].description;
      } else {
        return 'Objeto no identificado';
      }
    } catch (error) {
      console.error('Error en detectObject:', error);
      return 'Error en la detección';
    }
  };

  const speakText = async (text, lang = 'en') => {
    try {
      await Speech.speak(text, {
        language: lang,
        pitch: 1.0,
        rate: 0.8,
      });
    } catch (error) {
      console.error('Error al leer texto:', error);
    }
  };

  // Funciones de traducción (mantenidas del código original)
  const translateText = async (text, targetLang = 'es') => {
    console.log(`🔄 Iniciando traducción: "${text}" -> ${targetLang}`);
    
    try {
      const libreResult = await tryLibreTranslate(text, targetLang);
      if (libreResult && libreResult !== text) {
        console.log(`✅ LibreTranslate exitoso: "${libreResult}"`);
        return libreResult;
      }
    } catch (error) {
      console.log(`❌ LibreTranslate falló: ${error.message}`);
    }

    console.log(`🔧 Usando traducción inteligente local`);
    return translateIntelligent(text);
  };

  const tryLibreTranslate = async (text, targetLang) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch('https://libretranslate.de/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: 'en',
          target: targetLang,
          format: 'text'
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data && data.translatedText && data.translatedText.trim()) {
        return data.translatedText.trim();
      } else {
        throw new Error('No se encontró traducción en la respuesta');
      }
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  };

  const translateIntelligent = (text) => {
    const translationsMap = {
      'This is a (.+)': 'Esto es un $1',
      'This is an (.+)': 'Esto es un $1',
      'I have a (.+)': 'Tengo un $1',
      'I can see a (.+)': 'Puedo ver un $1',
      'bottle': 'botella', 'cup': 'taza', 'phone': 'teléfono', 'book': 'libro',
      'useful': 'útil', 'beautiful': 'hermoso', 'important': 'importante',
    };

    let translated = text;
    
    Object.keys(translationsMap).forEach(pattern => {
      if (pattern.includes('(') && pattern.includes(')')) {
        const regex = new RegExp(pattern, 'gi');
        const replacement = translationsMap[pattern];
        translated = translated.replace(regex, replacement);
      }
    });
    
    Object.keys(translationsMap).forEach(word => {
      if (!word.includes('(') && !word.includes(')')) {
        const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        translated = translated.replace(regex, translationsMap[word]);
      }
    });
    
    return translated !== text ? translated : `[ES] ${text}`;
  };

  const translateAllSentences = async () => {
    if (sentences.length === 0) {
      Alert.alert(t('error'), t('noSentences'));
      return;
    }

    setIsTranslating(true);
    setTranslationProgress(0);
    
    try {
      const translated = [];
      
      for (let i = 0; i < sentences.length; i++) {
        const currentSentence = sentences[i];
        setTranslationProgress(Math.round(((i + 1) / sentences.length) * 100));
        
        try {
          const translatedSentence = await translateText(currentSentence);
          translated.push(translatedSentence);
        } catch (error) {
          const fallbackTranslation = translateIntelligent(currentSentence);
          translated.push(fallbackTranslation);
        }
        
        if (i < sentences.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 800));
        }
      }
      
      setTranslatedSentences(translated);
      setShowTranslation(true);
      
    } catch (error) {
      console.error('Error general en translateAllSentences:', error);
      const basicTranslations = sentences.map(sentence => translateIntelligent(sentence));
      setTranslatedSentences(basicTranslations);
      setShowTranslation(true);
    } finally {
      setIsTranslating(false);
      setTranslationProgress(0);
    }
  };

  const generateSentencesWithAdvancedAI = async (objectName) => {
    try {
      const smartSentences = await generateBasicSentences(objectName);
      await updateLearningData(objectName, smartSentences);
      return smartSentences;
    } catch (error) {
      console.error('Error generando oraciones con IA:', error);
      return generateBasicSentences(objectName);
    }
  };

  const generateBasicSentences = (objectName) => {
    const basicTemplates = [
      `This is a ${objectName}.`,
      `I can see a ${objectName}.`,
      `The ${objectName} is useful.`,
      `I have a ${objectName}.`,
      `My ${objectName} is nice.`,
    ];
    
    return basicTemplates;
  };

  const updateLearningData = async (objectName, sentences) => {
    const normalizedName = objectName.toLowerCase();
    const newLearningData = { ...learningData };
    
    if (!newLearningData[normalizedName]) {
      newLearningData[normalizedName] = {
        frequency: 1,
        patterns: [],
        lastSeen: new Date().toISOString(),
      };
    } else {
      newLearningData[normalizedName].frequency += 1;
      newLearningData[normalizedName].lastSeen = new Date().toISOString();
    }
    
    setLearningData(newLearningData);
    await saveLearningData(newLearningData);
  };

  const scanLinePosition = scanAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, height * 0.4],
  });

  const getBackButtonHandler = () => {
    if (isMissionMode && onBackToMissions) {
      return onBackToMissions;
    }
    return onBackToWelcome;
  };

  const getBackButtonText = () => {
    if (isMissionMode) {
      return t('backToMissions');
    }
    return t('backToWelcome');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#db092c', '#ff1744', '#ff5252']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity 
              onPress={() => {
                if (isMissionMode && onBackToMissions) {
                  onBackToMissions();
                } else if (onBackToWelcome) {
                  onBackToWelcome();
                }
              }}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <View style={styles.bigLight} />
            <View style={styles.smallLights}>
              <View style={[styles.smallLight, { backgroundColor: '#ff6b6b' }]} />
              <View style={[styles.smallLight, { backgroundColor: '#ffd93d' }]} />
              <View style={[styles.smallLight, { backgroundColor: '#6bcf7f' }]} />
            </View>
          </View>
          <Text style={styles.title}>{t('title')}</Text>
          
          {/* Indicador de modo */}
          {isMissionMode && (
            <View style={styles.modeIndicator}>
              <Text style={styles.modeText}>{t('missionMode')}</Text>
              <Text style={styles.missionObjectText}>
                {t('findObject')}: {currentMission.objectKey}
              </Text>
            </View>
          )}
        </View>

        {/* Pantalla principal */}
        <View style={styles.screen}>
          <View style={styles.screenBorder}>
            <View style={styles.screenContent}>
              <CameraScreen 
                ref={cameraScreenRef} 
                onPhotoTaken={handlePhoto}
                language={language}
              />
              
              {/* Línea de escaneo animada */}
              {isProcessing && (
                <Animated.View
                  style={[
                    styles.scanLine,
                    {
                      top: scanLinePosition,
                    },
                  ]}
                />
              )}
              
              {/* Overlay de estado */}
              {isProcessing && (
                <View style={styles.processingOverlay}>
                  <Text style={styles.processingText}>
                    {t('analyzing')}
                  </Text>
                  <Text style={styles.processingSubtext}>
                    {modelLoaded ? t('aiActive') : t('processingImage')}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Panel de información - solo mostrar en modo libre */}
        {!isMissionMode && (
          <ScrollView style={styles.infoPanel} showsVerticalScrollIndicator={false}>
            {objectName && !isProcessing ? (
              <View style={styles.objectInfo}>
                <View style={styles.objectHeader}>
                  <Text style={styles.objectName}>{objectName.toUpperCase()}</Text>
                </View>

                <View style={styles.sentencesContainer}>
                  <Text style={styles.sectionTitle}>
                    {showTranslation ? t('examplesSpanish') : t('examplesEnglish')}
                  </Text>
                  
                  {(showTranslation ? translatedSentences : sentences).map((sentence, index) => (
                    <View key={index} style={styles.sentenceItem}>
                      <Text style={styles.sentenceText}>{sentence}</Text>
                      <TouchableOpacity
                        style={styles.speakButton}
                        onPress={() => speakText(sentence, showTranslation ? 'es' : 'en')}
                      >
                        <Text style={styles.speakButtonText}>🔊</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>

                <View style={styles.actionButtons}>
                  {!showTranslation ? (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.translateButton]}
                      onPress={translateAllSentences}
                      disabled={isTranslating}
                    >
                      <Text style={styles.actionButtonText}>
                        {isTranslating ? `${t('translating')}...` : t('translate')}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.englishButton]}
                      onPress={() => setShowTranslation(false)}
                    >
                      <Text style={styles.actionButtonText}>{t('english')}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ) : !isProcessing ? (
              <View style={styles.welcomeInfo}>
                <Text style={styles.welcomeText}>
                  {isMissionMode ? t('missionMode') : t('freePlayMode')}
                </Text>
                <Text style={styles.welcomeSubtext}>
                  {t('tapToCapture')}
                </Text>
              </View>
            ) : null}
          </ScrollView>
        )}

        {/* Botón principal */}
        <View style={styles.mainButtons}>
          <TouchableOpacity
            style={[styles.mainButton, styles.newPhotoButton]}
            onPress={resetApp}
            disabled={isProcessing}
          >
            <Text style={styles.mainButtonText}>
              {isProcessing ? t('processingImage') : t('newPhoto')}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  backButtonText: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  bigLight: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00ccff',
    marginRight: 20,
    shadowColor: '#00ccff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  smallLights: {
    flexDirection: 'row',
    gap: 8,
  },
  smallLight: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  modeIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  modeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  missionObjectText: {
    color: '#ffeb3b',
    fontSize: 16,
    fontWeight: 'bold',
  },
  screen: {
    marginHorizontal: 20,
    marginBottom: 20,
    height: height * 0.4,
  },
  screenBorder: {
    flex: 1,
    backgroundColor: '#2c2c2c',
    borderRadius: 15,
    padding: 8,
    borderWidth: 3,
    borderColor: '#555',
  },
  screenContent: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#00ff00',
    shadowColor: '#00ff00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    color: '#00ff00',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  processingSubtext: {
    color: '#00ccff',
    fontSize: 14,
  },
  infoPanel: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 20,
    borderRadius: 15,
    maxHeight: height * 0.25,
  },
  objectInfo: {
    padding: 20,
  },
  objectHeader: {
    marginBottom: 15,
  },
  objectName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  sentencesContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center',
  },
  sentenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 10,
    borderRadius: 8,
  },
  sentenceText: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 20,
  },
  speakButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 10,
  },
  speakButtonText: {
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  translateButton: {
    backgroundColor: '#FF9800',
  },
  englishButton: {
    backgroundColor: '#2196F3',
  },
  actionButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  welcomeInfo: {
    padding: 20,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
    textAlign: 'center',
  },
  welcomeSubtext: {
    fontSize: 14,
    color: '#cccccc',
    textAlign: 'center',
  },
  mainButtons: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  mainButton: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
  },
  newPhotoButton: {
    backgroundColor: '#007AFF',
    borderColor: '#0056CC',
  },
  mainButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});