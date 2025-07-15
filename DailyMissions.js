import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Textos en ambos idiomas
const translations = {
  en: {
    dailyMissions: "Daily Missions",
    todaysMissions: "Today's Missions",
    missionCompleted: "Mission Completed!",
    missionProgress: "Progress",
    completedMissions: "Completed Missions",
    remainingPhotos: "Photos remaining",
    photoLimit: "Daily photo limit reached",
    photoLimitMessage: "You've reached your daily limit of 10 photos. Come back in {hours} hours to continue learning!",
    healthyBreak: "Healthy Break Time",
    breakMessage: "Take a break from the screen! Go outside, play, or do another activity. See you later!",
    nextSession: "Next session in",
    hours: "hours",
    minutes: "minutes",
    findObjects: "Find and photograph these objects",
    missionReward: "Mission reward: +{points} points",
    totalPoints: "Total Points",
    streakDays: "Day Streak",
    dailyGoal: "Daily Goal",
    wellDone: "Well Done!",
    allMissionsCompleted: "All missions completed for today!",
    comeBackTomorrow: "Come back tomorrow for new missions!",
    backToWelcome: "Back to Welcome",
    freePlay: "Free Play Mode",
    freePlayDescription: "Practice without missions",
    environments: {
      kitchen: "Kitchen",
      living_room: "Living Room",
      bedroom: "Bedroom",
      bathroom: "Bathroom",
      garden: "Garden",
      school: "School",
      park: "Park",
      office: "Office"
    },
    objects: {
      // Kitchen objects
      bottle: "Bottle",
      cup: "Cup",
      plate: "Plate",
      spoon: "Spoon",
      refrigerator: "Refrigerator",
      microwave: "Microwave",
      
      // Living room objects
      sofa: "Sofa",
      television: "Television",
      book: "Book",
      pillow: "Pillow",
      lamp: "Lamp",
      remote: "Remote Control",
      
      // Bedroom objects
      bed: "Bed",
      pillow: "Pillow",
      blanket: "Blanket",
      clock: "Clock",
      mirror: "Mirror",
      dresser: "Dresser",
      
      // Bathroom objects
      towel: "Towel",
      toothbrush: "Toothbrush",
      soap: "Soap",
      mirror: "Mirror",
      sink: "Sink",
      shower: "Shower",
      
      // Garden objects
      plant: "Plant",
      flower: "Flower",
      tree: "Tree",
      grass: "Grass",
      pot: "Pot",
      leaf: "Leaf",
      
      // School objects
      pencil: "Pencil",
      pen: "Pen",
      notebook: "Notebook",
      backpack: "Backpack",
      ruler: "Ruler",
      eraser: "Eraser",
      
      // General objects
      phone: "Phone",
      computer: "Computer",
      camera: "Camera",
      bag: "Bag",
      shoe: "Shoe",
      chair: "Chair",
      table: "Table",
      door: "Door",
      window: "Window",
      car: "Car"
    }
  },
  es: {
    dailyMissions: "Misiones Diarias",
    todaysMissions: "Misiones de Hoy",
    missionCompleted: "¡Misión Completada!",
    missionProgress: "Progreso",
    completedMissions: "Misiones Completadas",
    remainingPhotos: "Fotos restantes",
    photoLimit: "Límite diario de fotos alcanzado",
    photoLimitMessage: "Has alcanzado tu límite diario de 10 fotos. ¡Regresa en {hours} horas para continuar aprendiendo!",
    healthyBreak: "Hora de Descanso Saludable",
    breakMessage: "¡Toma un descanso de la pantalla! Sal afuera, juega o haz otra actividad. ¡Nos vemos después!",
    nextSession: "Próxima sesión en",
    hours: "horas",
    minutes: "minutos",
    findObjects: "Encuentra y fotografía estos objetos",
    missionReward: "Recompensa de misión: +{points} puntos",
    totalPoints: "Puntos Totales",
    streakDays: "Días Seguidos",
    dailyGoal: "Meta Diaria",
    wellDone: "¡Muy Bien!",
    allMissionsCompleted: "¡Todas las misiones completadas por hoy!",
    comeBackTomorrow: "¡Regresa mañana para nuevas misiones!",
    backToWelcome: "Volver al Inicio",
    freePlay: "Modo Libre",
    freePlayDescription: "Practica sin misiones",
    environments: {
      kitchen: "Cocina",
      living_room: "Sala de Estar",
      bedroom: "Dormitorio",
      bathroom: "Baño",
      garden: "Jardín",
      school: "Escuela",
      park: "Parque",
      office: "Oficina"
    },
    objects: {
      // Kitchen objects
      bottle: "Botella",
      cup: "Taza",
      plate: "Plato",
      spoon: "Cuchara",
      refrigerator: "Refrigerador",
      microwave: "Microondas",
      
      // Living room objects
      sofa: "Sofá",
      television: "Televisión",
      book: "Libro",
      pillow: "Almohada",
      lamp: "Lámpara",
      remote: "Control Remoto",
      
      // Bedroom objects
      bed: "Cama",
      pillow: "Almohada",
      blanket: "Manta",
      clock: "Reloj",
      mirror: "Espejo",
      dresser: "Cómoda",
      
      // Bathroom objects
      towel: "Toalla",
      toothbrush: "Cepillo de Dientes",
      soap: "Jabón",
      mirror: "Espejo",
      sink: "Lavabo",
      shower: "Ducha",
      
      // Garden objects
      plant: "Planta",
      flower: "Flor",
      tree: "Árbol",
      grass: "Pasto",
      pot: "Maceta",
      leaf: "Hoja",
      
      // School objects
      pencil: "Lápiz",
      pen: "Bolígrafo",
      notebook: "Cuaderno",
      backpack: "Mochila",
      ruler: "Regla",
      eraser: "Borrador",
      
      // General objects
      phone: "Teléfono",
      computer: "Computadora",
      camera: "Cámara",
      bag: "Bolsa",
      shoe: "Zapato",
      chair: "Silla",
      table: "Mesa",
      door: "Puerta",
      window: "Ventana",
      car: "Carro"
    }
  }
};

// Configuración de entornos y objetos
const environments = {
  kitchen: {
    name: 'kitchen',
    emoji: '🍳',
    objects: ['bottle', 'cup', 'plate', 'spoon', 'refrigerator', 'microwave'],
    color: '#e74c3c'
  },
  living_room: {
    name: 'living_room',
    emoji: '🛋️',
    objects: ['sofa', 'television', 'book', 'pillow', 'lamp', 'remote'],
    color: '#3498db'
  },
  bedroom: {
    name: 'bedroom',
    emoji: '🛏️',
    objects: ['bed', 'pillow', 'blanket', 'clock', 'mirror', 'dresser'],
    color: '#9b59b6'
  },
  bathroom: {
    name: 'bathroom',
    emoji: '🚿',
    objects: ['towel', 'toothbrush', 'soap', 'mirror', 'sink', 'shower'],
    color: '#1abc9c'
  },
  garden: {
    name: 'garden',
    emoji: '🌱',
    objects: ['plant', 'flower', 'tree', 'grass', 'pot', 'leaf'],
    color: '#27ae60'
  },
  school: {
    name: 'school',
    emoji: '🎒',
    objects: ['pencil', 'pen', 'notebook', 'backpack', 'ruler', 'eraser'],
    color: '#f39c12'
  }
};

export default function DailyMissions({ language = 'en', onStartMission, onBackToWelcome, onStartFreePlay }) {
  const [missions, setMissions] = useState([]);
  const [completedMissions, setCompletedMissions] = useState([]);
  const [dailyPhotos, setDailyPhotos] = useState(0);
  const [canTakePhotos, setCanTakePhotos] = useState(true);
  const [nextResetTime, setNextResetTime] = useState(null);
  const [timeUntilReset, setTimeUntilReset] = useState('');
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);

  const t = (key, params = {}) => {
    let text = translations[language][key] || translations.en[key] || key;
    Object.keys(params).forEach(param => {
      text = text.replace(`{${param}}`, params[param]);
    });
    return text;
  };

  const getObjectTranslation = (objectKey) => {
    return translations[language].objects[objectKey] || translations.en.objects[objectKey] || objectKey;
  };

  const getEnvironmentTranslation = (envKey) => {
    return translations[language].environments[envKey] || translations.en.environments[envKey] || envKey;
  };

  useEffect(() => {
    initializeDailyMissions();
    loadUserProgress();
    
    // Actualizar contador cada minuto
    const interval = setInterval(updateTimeUntilReset, 60000);
    return () => clearInterval(interval);
  }, []);

  const initializeDailyMissions = async () => {
    try {
      const today = new Date().toDateString();
      const savedMissions = await AsyncStorage.getItem('dailyMissions');
      const savedDate = await AsyncStorage.getItem('missionsDate');
      
      if (savedDate === today && savedMissions) {
        const parsedMissions = JSON.parse(savedMissions);
        setMissions(parsedMissions);
        setCompletedMissions(parsedMissions.filter(m => m.completed));
      } else {
        // Generar nuevas misiones para hoy
        const newMissions = generateDailyMissions();
        setMissions(newMissions);
        setCompletedMissions([]);
        await AsyncStorage.setItem('dailyMissions', JSON.stringify(newMissions));
        await AsyncStorage.setItem('missionsDate', today);
      }
    } catch (error) {
      console.error('Error initializing daily missions:', error);
    }
  };

  const loadUserProgress = async () => {
    try {
      const savedPhotos = await AsyncStorage.getItem('dailyPhotos');
      const savedPhotosDate = await AsyncStorage.getItem('photosDate');
      const savedNextReset = await AsyncStorage.getItem('nextPhotoReset');
      const savedPoints = await AsyncStorage.getItem('userPoints');
      const savedStreak = await AsyncStorage.getItem('userStreak');
      
      const today = new Date().toDateString();
      
      if (savedPhotosDate === today && savedPhotos) {
        const photoCount = parseInt(savedPhotos);
        setDailyPhotos(photoCount);
        
        if (photoCount >= 10 && savedNextReset) {
          const resetTime = new Date(savedNextReset);
          const now = new Date();
          
          if (now < resetTime) {
            setCanTakePhotos(false);
            setNextResetTime(resetTime);
            updateTimeUntilReset();
          } else {
            // Reset photos
            await resetPhotoCount();
          }
        }
      }
      
      if (savedPoints) setPoints(parseInt(savedPoints));
      if (savedStreak) setStreak(parseInt(savedStreak));
      
    } catch (error) {
      console.error('Error loading user progress:', error);
    }
  };

  const generateDailyMissions = () => {
    const envKeys = Object.keys(environments);
    const selectedEnv = envKeys[Math.floor(Math.random() * envKeys.length)];
    const env = environments[selectedEnv];
    
    // Seleccionar 3 objetos aleatorios del entorno
    const shuffledObjects = [...env.objects].sort(() => 0.5 - Math.random());
    const selectedObjects = shuffledObjects.slice(0, 3);
    
    return selectedObjects.map((obj, index) => ({
      id: `mission_${index}`,
      environment: selectedEnv,
      environmentName: env.name,
      environmentEmoji: env.emoji,
      environmentColor: env.color,
      objectKey: obj,
      objectName: obj,
      completed: false,
      points: 50,
      completedAt: null
    }));
  };

  const updateTimeUntilReset = () => {
    if (nextResetTime) {
      const now = new Date();
      const diff = nextResetTime - now;
      
      if (diff <= 0) {
        resetPhotoCount();
        return;
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeUntilReset(`${hours}h ${minutes}m`);
    }
  };

  const resetPhotoCount = async () => {
    try {
      await AsyncStorage.removeItem('dailyPhotos');
      await AsyncStorage.removeItem('photosDate');
      await AsyncStorage.removeItem('nextPhotoReset');
      setDailyPhotos(0);
      setCanTakePhotos(true);
      setNextResetTime(null);
      setTimeUntilReset('');
    } catch (error) {
      console.error('Error resetting photo count:', error);
    }
  };

  const handlePhotoTaken = async (detectedObject) => {
    try {
      const newPhotoCount = dailyPhotos + 1;
      const today = new Date().toDateString();
      
      // Actualizar contador de fotos
      setDailyPhotos(newPhotoCount);
      await AsyncStorage.setItem('dailyPhotos', newPhotoCount.toString());
      await AsyncStorage.setItem('photosDate', today);
      
      // Verificar si se completó una misión
      const updatedMissions = missions.map(mission => {
        if (!mission.completed && mission.objectKey === detectedObject.toLowerCase()) {
          const completedMission = {
            ...mission,
            completed: true,
            completedAt: new Date().toISOString()
          };
          
          // Añadir puntos
          const newPoints = points + mission.points;
          setPoints(newPoints);
          AsyncStorage.setItem('userPoints', newPoints.toString());
          
          // Mostrar mensaje de éxito
          Alert.alert(
            t('missionCompleted'),
            t('missionReward', { points: mission.points }),
            [{ text: 'OK', style: 'default' }]
          );
          
          return completedMission;
        }
        return mission;
      });
      
      setMissions(updatedMissions);
      setCompletedMissions(updatedMissions.filter(m => m.completed));
      await AsyncStorage.setItem('dailyMissions', JSON.stringify(updatedMissions));
      
      // Verificar límite de fotos
      if (newPhotoCount >= 10) {
        const nextReset = new Date();
        nextReset.setHours(nextReset.getHours() + 12);
        
        setCanTakePhotos(false);
        setNextResetTime(nextReset);
        await AsyncStorage.setItem('nextPhotoReset', nextReset.toISOString());
        
        Alert.alert(
          t('healthyBreak'),
          t('photoLimitMessage', { hours: 12 }),
          [{ text: 'OK', style: 'default' }]
        );
      }
      
      // Verificar si todas las misiones están completadas
      const allCompleted = updatedMissions.every(m => m.completed);
      if (allCompleted) {
        Alert.alert(
          t('wellDone'),
          t('allMissionsCompleted'),
          [{ text: 'OK', style: 'default' }]
        );
      }
      
    } catch (error) {
      console.error('Error handling photo taken:', error);
    }
  };

  const handleStartMission = (mission) => {
    if (!canTakePhotos) {
      Alert.alert(
        t('photoLimit'),
        t('photoLimitMessage', { hours: Math.ceil((nextResetTime - new Date()) / (1000 * 60 * 60)) }),
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }
    
    if (onStartMission) {
      onStartMission(mission, handlePhotoTaken);
    }
  };

  const handleFreePlay = () => {
    if (!canTakePhotos) {
      const hoursUntilReset = Math.ceil((nextResetTime - new Date()) / (1000 * 60 * 60));
      Alert.alert(
        t('photoLimit'),
        t('photoLimitMessage', { hours: hoursUntilReset }),
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }
    
    if (onStartFreePlay) {
      onStartFreePlay();
    }
  };

  const renderMissionCard = (mission, index) => (
    <View key={mission.id} style={[styles.missionCard, { borderLeftColor: mission.environmentColor }]}>
      <View style={styles.missionHeader}>
        <View style={styles.missionEnvironment}>
          <Text style={styles.environmentEmoji}>{mission.environmentEmoji}</Text>
          <Text style={styles.environmentName}>
            {getEnvironmentTranslation(mission.environmentName)}
          </Text>
        </View>
        
        {mission.completed ? (
          <View style={styles.completedBadge}>
            <Text style={styles.completedText}>✓</Text>
          </View>
        ) : (
          <View style={styles.pointsBadge}>
            <Text style={styles.pointsText}>+{mission.points}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.missionContent}>
        <Text style={styles.objectName}>
          {getObjectTranslation(mission.objectKey)}
        </Text>
        
        <TouchableOpacity
          style={[
            styles.missionButton,
            mission.completed && styles.missionButtonCompleted,
            !canTakePhotos && styles.missionButtonDisabled
          ]}
          onPress={() => handleStartMission(mission)}
          disabled={mission.completed || !canTakePhotos}
        >
          <Text style={[
            styles.missionButtonText,
            mission.completed && styles.missionButtonTextCompleted
          ]}>
            {mission.completed ? t('missionCompleted') : '📸 Buscar'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const completedCount = completedMissions.length;
  const totalMissions = missions.length;
  const progressPercentage = totalMissions > 0 ? (completedCount / totalMissions) * 100 : 0;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#2c3e50', '#3498db', '#5dade2']}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <TouchableOpacity 
                onPress={onBackToWelcome}
                style={styles.backButton}
              >
                <Text style={styles.backButtonText}>←</Text>
              </TouchableOpacity>
              <Text style={styles.title}>{t('dailyMissions')}</Text>
              <View style={styles.placeholder} />
            </View>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{points}</Text>
                <Text style={styles.statLabel}>{t('totalPoints')}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{streak}</Text>
                <Text style={styles.statLabel}>{t('streakDays')}</Text>
              </View>
            </View>
          </View>

          {/* Progress Section */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>{t('dailyGoal')}</Text>
              <Text style={styles.progressText}>
                {completedCount}/{totalMissions} {t('completedMissions')}
              </Text>
            </View>
            
            <View style={styles.progressBar}>
              <View 
                style={[styles.progressFill, { width: `${progressPercentage}%` }]}
              />
            </View>
            
            <View style={styles.photoLimitContainer}>
              <Text style={styles.photoLimitText}>
                {t('remainingPhotos')}: {Math.max(0, 10 - dailyPhotos)}
              </Text>
              {!canTakePhotos && (
                <Text style={styles.nextSessionText}>
                  {t('nextSession')}: {timeUntilReset}
                </Text>
              )}
            </View>
          </View>

          {/* Missions List */}
          <View style={styles.missionsContainer}>
            <Text style={styles.sectionTitle}>{t('todaysMissions')}</Text>
            <Text style={styles.sectionSubtitle}>{t('findObjects')}</Text>
            
            {missions.map((mission, index) => renderMissionCard(mission, index))}
            
            {/* Free Play Button */}
            <TouchableOpacity
              style={[
                styles.freePlayButton,
                !canTakePhotos && styles.freePlayButtonDisabled
              ]}
              onPress={handleFreePlay}
              disabled={!canTakePhotos}
            >
              <LinearGradient
                colors={['#8e44ad', '#9b59b6']}
                style={styles.freePlayGradient}
              >
                <Text style={styles.freePlayTitle}>{t('freePlay')}</Text>
                <Text style={styles.freePlaySubtitle}>{t('freePlayDescription')}</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            {totalMissions > 0 && completedCount === totalMissions && (
              <View style={styles.allCompletedContainer}>
                <Text style={styles.allCompletedEmoji}>🎉</Text>
                <Text style={styles.allCompletedText}>{t('allMissionsCompleted')}</Text>
                <Text style={styles.allCompletedSubtext}>{t('comeBackTomorrow')}</Text>
              </View>
            )}
          </View>
        </ScrollView>
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
  scrollContainer: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 50,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 12,
    color: '#ecf0f1',
    marginTop: 2,
  },
  progressSection: {
    margin: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 15,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#27ae60',
    borderRadius: 4,
  },
  photoLimitContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  photoLimitText: {
    fontSize: 12,
    color: '#ecf0f1',
  },
  nextSessionText: {
    fontSize: 12,
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  missionsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#ecf0f1',
    marginBottom: 20,
  },
  missionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 5,
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  missionEnvironment: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  environmentEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  environmentName: {
    fontSize: 14,
    color: '#ecf0f1',
    fontWeight: '500',
  },
  completedBadge: {
    backgroundColor: '#27ae60',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pointsBadge: {
    backgroundColor: '#f39c12',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pointsText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  missionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  objectName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
  },
  missionButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 10,
  },
  missionButtonCompleted: {
    backgroundColor: '#27ae60',
  },
  missionButtonDisabled: {
    backgroundColor: '#7f8c8d',
    opacity: 0.5,
  },
  missionButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  missionButtonTextCompleted: {
    color: '#ffffff',
  },
  freePlayButton: {
    borderRadius: 15,
    overflow: 'hidden',
    marginTop: 20,
    marginBottom: 20,
  },
  freePlayButtonDisabled: {
    opacity: 0.5,
  },
  freePlayGradient: {
    padding: 20,
    alignItems: 'center',
  },
  freePlayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  freePlaySubtitle: {
    fontSize: 14,
    color: '#ecf0f1',
    textAlign: 'center',
  },
  allCompletedContainer: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: 'rgba(39, 174, 96, 0.2)',
    borderRadius: 15,
    marginTop: 20,
  },
  allCompletedEmoji: {
    fontSize: 50,
    marginBottom: 15,
  },
  allCompletedText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 5,
  },
  allCompletedSubtext: {
    fontSize: 14,
    color: '#ecf0f1',
    textAlign: 'center',
  },
});