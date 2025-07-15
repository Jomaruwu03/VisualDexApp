import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WelcomeScreen from './WelcomeScreen';
import CameraApp from './CameraApp';
import DailyMissions from './DailyMissions';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome'); // 'welcome', 'missions', 'camera'
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentMission, setCurrentMission] = useState(null);
  const [missionCallback, setMissionCallback] = useState(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Cargar preferencias guardadas
      const savedLanguage = await AsyncStorage.getItem('appLanguage');
      const hasSeenWelcome = await AsyncStorage.getItem('hasSeenWelcome');
      
      if (savedLanguage) {
        setSelectedLanguage(savedLanguage);
      }
      
      // Opcional: ir directo a misiones si ya vio la bienvenida
      /*
      if (hasSeenWelcome === 'true') {
        setCurrentScreen('missions');
      }
      */
      
      setIsInitialized(true);
    } catch (error) {
      console.error('Error inicializando app:', error);
      setIsInitialized(true);
    }
  };

  const handleStartLearning = async (language) => {
    try {
      // Guardar que el usuario ya vio la bienvenida
      await AsyncStorage.setItem('hasSeenWelcome', 'true');
      await AsyncStorage.setItem('appLanguage', language);
      
      // Actualizar el idioma seleccionado
      setSelectedLanguage(language);
      
      // Navegar a misiones diarias
      setCurrentScreen('missions');
    } catch (error) {
      console.error('Error al iniciar aprendizaje:', error);
      // Continuar de todas formas
      setSelectedLanguage(language);
      setCurrentScreen('missions');
    }
  };

  const handleStartMission = (mission, callback) => {
    setCurrentMission(mission);
    setMissionCallback(() => callback);
    setCurrentScreen('camera');
  };

  const handleBackToMissions = () => {
    // Si hay una misión activa y un callback, ejecutarlo
    if (missionCallback) {
      missionCallback();
      setMissionCallback(null);
    }
    setCurrentMission(null);
    setCurrentScreen('missions');
  };

  const handleBackToWelcome = () => {
    setCurrentScreen('welcome');
  };

  // Mostrar pantalla de carga mientras se inicializa
  if (!isInitialized) {
    return null; // O puedes mostrar un splash screen aquí
  }

  return (
    <>
      <StatusBar style="light" />
      {currentScreen === 'welcome' ? (
        <WelcomeScreen onStartLearning={handleStartLearning} />
      ) : currentScreen === 'missions' ? (
        <DailyMissions 
          language={selectedLanguage}
          onStartMission={handleStartMission}
          onBackToWelcome={handleBackToWelcome}
        />
      ) : (
        <CameraApp 
          language={selectedLanguage} 
          onBackToWelcome={handleBackToMissions}
          currentMission={currentMission}
        />
      )}
    </>
  );
}