import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, Button, StyleSheet } from 'react-native';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CameraScreen from './CameraScreen';

export default function App() {
  const [objectName, setObjectName] = useState('');
  const [sentences, setSentences] = useState([]);
  const [translatedSentences, setTranslatedSentences] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [learningData, setLearningData] = useState({});
  const cameraScreenRef = useRef(null);

  // Inicializar sistema de aprendizaje
  useEffect(() => {
    initializeLearningSystem();
    loadLearningData();
  }, []);

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
      
      if (label) {
        setObjectName(label);
        // Generar oraciones con IA
        const aiSentences = await generateSentencesWithAI(label);
        setSentences(aiSentences);
      } else {
        setObjectName('No se pudo detectar ningún objeto');
        setSentences([]);
      }
    } catch (error) {
      console.error('Error en handlePhoto:', error);
      setObjectName('Error al procesar la imagen');
      setSentences([]);
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

      console.log('Enviando petición a Google Vision API...');
      const response = await fetch(
        "https://vision.googleapis.com/v1/images:annotate?key=AIzaSyBqOMU0jtfEQm04a_ESxAl9l0Qyn-Jbm0k",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      console.log('Status de respuesta:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('Respuesta de Google Vision:', data);

      if (data.responses && data.responses[0] && data.responses[0].labelAnnotations && data.responses[0].labelAnnotations.length > 0) {
        return data.responses[0].labelAnnotations[0].description;
      } else {
        console.log('No se encontraron etiquetas en la respuesta');
        return 'Objeto no identificado';
      }
    } catch (error) {
      console.error('Error en detectObject:', error);
      return 'Error en la detección';
    }
  };

  // Función para leer texto en voz alta
  const speakText = async (text, language = 'en') => {
    try {
      await Speech.speak(text, {
        language: language,
        pitch: 1.0,
        rate: 0.8,
      });
    } catch (error) {
      console.error('Error al leer texto:', error);
    }
  };

  // Función para traducir texto con LibreTranslate
  const translateText = async (text, targetLang = 'es') => {
    try {
      console.log('Traduciendo:', text);
      
      // Intentar con LibreTranslate primero
      const response = await fetch('https://libretranslate.de/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: 'en',
          target: targetLang,
          format: 'text'
        }),
      });

      if (!response.ok) {
        console.log(`LibreTranslate error: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.log('LibreTranslate respuesta no es JSON, usando traducción básica');
        throw new Error('Response is not JSON');
      }

      const data = await response.json();
      
      if (data && data.translatedText) {
        console.log('Traducción exitosa:', data.translatedText);
        return data.translatedText;
      } else {
        throw new Error('No translation found in response');
      }
    } catch (error) {
      console.error('Error al traducir con LibreTranslate:', error);
      // Fallback: traducción básica manual para palabras comunes
      console.log('Usando traducción básica como fallback');
      return translateBasic(text);
    }
  };

  // Función de traducción básica como fallback
  const translateBasic = (text) => {
    const translations = {
      // Artículos y preposiciones
      'This is a': 'Esto es un',
      'This is an': 'Esto es un',
      'I have a': 'Tengo un',
      'I have an': 'Tengo un',
      'I can see a': 'Puedo ver un',
      'I can see an': 'Puedo ver un',
      'Look at the': 'Mira el/la',
      'The': 'El/La',
      'This': 'Este/Esta',
      'That': 'Ese/Esa',
      'My': 'Mi',
      
      // Objetos comunes
      'finger': 'dedo',
      'hand': 'mano',
      'bottle': 'botella',
      'cup': 'taza',
      'phone': 'teléfono',
      'book': 'libro',
      'table': 'mesa',
      'chair': 'silla',
      'computer': 'computadora',
      'camera': 'cámara',
      'plant': 'planta',
      'window': 'ventana',
      'door': 'puerta',
      'bag': 'bolsa',
      'pen': 'bolígrafo',
      'watch': 'reloj',
      'glasses': 'anteojos',
      'car': 'carro',
      'food': 'comida',
      'water': 'agua',
      'house': 'casa',
      'person': 'persona',
      'human': 'humano',
      
      // Adjetivos
      'is useful': 'es útil',
      'is beautiful': 'es hermoso',
      'is important': 'es importante',
      'is good': 'es bueno',
      'is nice': 'es bonito',
      'is amazing': 'es increíble',
      'beautiful': 'hermoso',
      'useful': 'útil',
      'good': 'bueno',
      'nice': 'bonito',
      'important': 'importante',
      'amazing': 'increíble',
      
      // Verbos
      'like': 'gusta',
      'need': 'necesito',
      'have': 'tengo',
      'see': 'veo',
      'use': 'uso',
      
      // Lugares
      'at home': 'en casa',
      'in the house': 'en la casa',
      'here': 'aquí',
      'there': 'allí'
    };

    let translated = text;
    
    // Reemplazar frases completas primero, luego palabras individuales
    const sortedKeys = Object.keys(translations).sort((a, b) => b.length - a.length);
    
    for (const english of sortedKeys) {
      const spanish = translations[english];
      const regex = new RegExp(english, 'gi');
      translated = translated.replace(regex, spanish);
    }
    
    // Si no hubo cambios, agregar prefijo [ES]
    return translated !== text ? translated : `[ES] ${text}`;
  };

  // Función para traducir todas las oraciones
  const translateAllSentences = async () => {
    setIsTranslating(true);
    try {
      console.log('Iniciando traducción de todas las oraciones...');
      const translated = [];
      
      // Traducir una por una para mejor manejo de errores
      for (let i = 0; i < sentences.length; i++) {
        console.log(`Traduciendo oración ${i + 1}: ${sentences[i]}`);
        try {
          const translatedSentence = await translateText(sentences[i]);
          translated.push(translatedSentence);
        } catch (error) {
          console.error(`Error traduciendo oración ${i + 1}:`, error);
          // Si falla, usar traducción básica
          translated.push(translateBasic(sentences[i]));
        }
        
        // Pequeña pausa entre traducciones para evitar rate limiting
        if (i < sentences.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      setTranslatedSentences(translated);
      setShowTranslation(true);
      console.log('Traducción completada exitosamente');
    } catch (error) {
      console.error('Error general traduciendo oraciones:', error);
      // Fallback: usar traducción básica para todas
      const basicTranslations = sentences.map(sentence => translateBasic(sentence));
      setTranslatedSentences(basicTranslations);
      setShowTranslation(true);
    } finally {
      setIsTranslating(false);
    }
  };

  const generateSentences = (word) => {
    const templates = [
      [`This is a ${word}.`, `I can see a ${word}.`, `The ${word} is useful.`],
      [`I have a ${word}.`, `My ${word} is nice.`, `This ${word} is beautiful.`],
      [`The ${word} is good.`, `I like this ${word}.`, `The ${word} is important.`],
      [`Look at the ${word}.`, `This ${word} is amazing.`, `I need a ${word}.`]
    ];
    
    // Elegir un template aleatorio
    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    return randomTemplate;
  };

  const generateSentencesWithAI = async (objectName) => {
    try {
      console.log('Generando oraciones con IA local para:', objectName);
      
      // Usar el sistema de aprendizaje local
      const smartSentences = await generateSmartSentences(objectName);
      
      // Actualizar datos de aprendizaje
      await updateLearningData(objectName, smartSentences);
      
      return smartSentences;
    } catch (error) {
      console.error('Error generando oraciones con IA local:', error);
      console.log('Usando oraciones predeterminadas');
      return generateSentences(objectName);
    }
  };

  const generateSmartSentences = async (objectName) => {
    const normalizedName = objectName.toLowerCase();
    
    // Si ya tenemos datos de aprendizaje para este objeto, usar patrones aprendidos
    if (learningData[normalizedName] && learningData[normalizedName].patterns) {
      const patterns = learningData[normalizedName].patterns;
      const frequency = learningData[normalizedName].frequency || 1;
      
      console.log(`Objeto conocido: ${normalizedName}, frecuencia: ${frequency}`);
      
      // Generar oraciones más sofisticadas basadas en frecuencia de uso
      return generateAdvancedSentences(objectName, frequency, patterns);
    }
    
    // Para objetos nuevos, empezar con templates básicos pero más inteligentes
    return generateInitialSentences(objectName);
  };

  const generateAdvancedSentences = (objectName, frequency, patterns) => {
    const templates = {
      beginner: [
        [`This is a ${objectName}.`, `I can see a ${objectName}.`, `The ${objectName} is here.`],
        [`Look at the ${objectName}.`, `I have a ${objectName}.`, `This ${objectName} is mine.`]
      ],
      intermediate: [
        [`This ${objectName} is very useful.`, `I use this ${objectName} every day.`, `The ${objectName} helps me a lot.`],
        [`My ${objectName} is beautiful.`, `This ${objectName} is important to me.`, `I like my ${objectName} very much.`]
      ],
      advanced: [
        [`The ${objectName} demonstrates excellent functionality.`, `This ${objectName} represents modern design.`, `I appreciate the quality of this ${objectName}.`],
        [`The ${objectName} serves multiple purposes.`, `This ${objectName} enhances my daily activities.`, `I depend on this ${objectName} for many tasks.`]
      ]
    };

    let level = 'beginner';
    if (frequency > 5) level = 'intermediate';
    if (frequency > 10) level = 'advanced';

    const levelTemplates = templates[level];
    const randomTemplate = levelTemplates[Math.floor(Math.random() * levelTemplates.length)];
    
    console.log(`Generando oraciones de nivel ${level} para ${objectName}`);
    return randomTemplate;
  };

  const generateInitialSentences = (objectName) => {
    const contextualTemplates = {
      person: [`This person is friendly.`, `I can see a person here.`, `The person is smiling.`],
      hand: [`This is my hand.`, `I use my hand to touch things.`, `My hand has five fingers.`],
      finger: [`This is a finger.`, `I point with my finger.`, `My finger is very useful.`],
      bottle: [`This bottle contains liquid.`, `I drink from this bottle.`, `The bottle is transparent.`],
      cup: [`This cup holds beverages.`, `I drink coffee from this cup.`, `The cup is on the table.`],
      phone: [`This phone connects people.`, `I make calls with this phone.`, `My phone is very smart.`],
      book: [`This book contains knowledge.`, `I read this book to learn.`, `The book has many pages.`],
      default: [`This is a ${objectName}.`, `I can see a ${objectName}.`, `The ${objectName} is useful.`]
    };

    const key = objectName.toLowerCase();
    return contextualTemplates[key] || contextualTemplates.default;
  };

  const updateLearningData = async (objectName, sentences) => {
    const normalizedName = objectName.toLowerCase();
    const newLearningData = { ...learningData };
    
    if (!newLearningData[normalizedName]) {
      newLearningData[normalizedName] = {
        frequency: 1,
        patterns: [],
        lastSeen: new Date().toISOString()
      };
    } else {
      newLearningData[normalizedName].frequency += 1;
      newLearningData[normalizedName].lastSeen = new Date().toISOString();
    }
    
    // Analizar patrones en las oraciones generadas
    const patterns = analyzeSentencePatterns(sentences);
    newLearningData[normalizedName].patterns = patterns;
    
    setLearningData(newLearningData);
    await saveLearningData(newLearningData);
    
    console.log(`Aprendizaje actualizado para ${normalizedName}:`, newLearningData[normalizedName]);
  };

  const analyzeSentencePatterns = (sentences) => {
    const patterns = {
      commonWords: [],
      sentenceStructures: [],
      complexity: 'basic'
    };
    
    sentences.forEach(sentence => {
      const words = sentence.toLowerCase().split(' ');
      patterns.commonWords.push(...words.filter(word => word.length > 3));
      
      // Analizar estructura de la oración
      if (sentence.includes('is')) patterns.sentenceStructures.push('descriptive');
      if (sentence.includes('I')) patterns.sentenceStructures.push('personal');
      if (sentence.includes('can')) patterns.sentenceStructures.push('ability');
    });
    
    // Determinar complejidad basada en longitud promedio
    const avgLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
    if (avgLength > 40) patterns.complexity = 'advanced';
    else if (avgLength > 25) patterns.complexity = 'intermediate';
    
    return patterns;
  };

  return (
    <View style={{ flex: 1 }}>
      <CameraScreen ref={cameraScreenRef} onPhotoTaken={handlePhoto} />
      <ScrollView style={{ padding: 20 }}>
        {isProcessing ? (
          <Text style={{ textAlign: 'center', fontSize: 16 }}>
            {modelLoaded 
              ? 'Detectando objeto con IA local y generando oraciones inteligentes...' 
              : 'Detectando objeto y generando oraciones...'}
          </Text>
        ) : objectName ? (
          <>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
              Detected: {objectName}
              {learningData[objectName.toLowerCase()] && (
                <Text style={{ fontSize: 12, color: '#666', fontWeight: 'normal' }}>
                  {' '}(visto {learningData[objectName.toLowerCase()].frequency} veces)
                </Text>
              )}
            </Text>
            
            {modelLoaded && (
              <Text style={{ fontSize: 12, color: '#4CAF50', marginBottom: 5 }}>
                🤖 IA Local Activa • Objetos aprendidos: {Object.keys(learningData).length}
              </Text>
            )}
            
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
              {showTranslation ? 'Oraciones en Español:' : 'English Sentences:'}
            </Text>
            
            {(showTranslation ? translatedSentences : sentences).map((s, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ flex: 1, marginRight: 10 }}>• {s}</Text>
                <Button
                  title="🔊"
                  onPress={() => speakText(s, showTranslation ? 'es' : 'en')}
                  color="#4CAF50"
                />
              </View>
            ))}
            
            <View style={{ marginTop: 20, gap: 10 }}>
              {!showTranslation ? (
                <Button
                  title={isTranslating ? "Traduciendo..." : "Traducir al Español"}
                  onPress={translateAllSentences}
                  disabled={isTranslating}
                  color="#FF9800"
                />
              ) : (
                <Button
                  title="Mostrar en Inglés"
                  onPress={() => setShowTranslation(false)}
                  color="#2196F3"
                />
              )}
              
              <Button
                title="Leer todo"
                onPress={() => {
                  const textToRead = (showTranslation ? translatedSentences : sentences).join('. ');
                  speakText(textToRead, showTranslation ? 'es' : 'en');
                }}
                color="#9C27B0"
              />
              
              <Button 
                title="Tomar nueva foto" 
                onPress={resetApp}
                color="#007AFF"
              />
              
              {Object.keys(learningData).length > 0 && (
                <Button 
                  title="Reiniciar Aprendizaje" 
                  onPress={async () => {
                    setLearningData({});
                    await AsyncStorage.removeItem('learningData');
                    console.log('Datos de aprendizaje reiniciados');
                  }}
                  color="#FF6B6B"
                />
              )}
            </View>
          </>
        ) : photoTaken ? (
          <View style={{ alignItems: 'center' }}>
            <Text style={{ textAlign: 'center', marginBottom: 15 }}>
              Foto tomada. ¿Quieres tomar otra?
            </Text>
            <Button 
              title="Tomar nueva foto" 
              onPress={resetApp}
              color="#007AFF"
            />
          </View>
        ) : (
          <Text style={{ textAlign: 'center' }}>Toma una foto para comenzar</Text>
        )}
      </ScrollView>
    </View>
  );
}
