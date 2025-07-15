import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const translations = {
  en: {
    welcomeTitle: "Welcome to Visual DeX",
    appDescription: "AI-powered visual learning assistant",
    whatItDoes: "What does it do?",
    feature1: "📸 Captures and identifies objects",
    feature2: "🧠 Generates contextual sentences with AI", 
    feature3: "🔄 Translates to multiple languages",
    feature4: "🔊 Reads content aloud",
    feature5: "📚 Learns and adapts to your progress",
    howItWorks: "How it works?",
    step1: "Take a photo of any object",
    step2: "AI identifies and analyzes it",
    step3: "Get intelligent example sentences",
    step4: "Translate and practice pronunciation",
    startButton: "START LEARNING",
    languageSettings: "Language Settings",
    aboutApp: "About Visual DeX",
    aboutText: "Visual DeX uses advanced artificial intelligence to help you learn languages through visual recognition. Perfect for students, travelers, and anyone who wants to expand their vocabulary in a fun and interactive way.",
    benefits: "Benefits",
    benefit1: "⚡ Learn vocabulary faster with visual context",
    benefit2: "🎯 Personalized learning that adapts to you",
    benefit3: "🌍 Practice pronunciation in real situations",
    benefit4: "📊 Track your progress automatically",
    getStarted: "Ready to start learning?",
    getStartedText: "Choose your language and begin your visual learning journey!"
  },
  es: {
    welcomeTitle: "Bienvenido a Visual DeX",
    appDescription: "Asistente de aprendizaje visual con IA",
    whatItDoes: "¿Qué hace?",
    feature1: "📸 Captura e identifica objetos",
    feature2: "🧠 Genera oraciones contextuales con IA",
    feature3: "🔄 Traduce a múltiples idiomas", 
    feature4: "🔊 Lee el contenido en voz alta",
    feature5: "📚 Aprende y se adapta a tu progreso",
    howItWorks: "¿Cómo funciona?",
    step1: "Toma una foto de cualquier objeto",
    step2: "La IA lo identifica y analiza",
    step3: "Obtén oraciones de ejemplo inteligentes",
    step4: "Traduce y practica la pronunciación",
    startButton: "COMENZAR A APRENDER",
    languageSettings: "Configuración de Idioma",
    aboutApp: "Acerca de Visual DeX",
    aboutText: "Visual DeX utiliza inteligencia artificial avanzada para ayudarte a aprender idiomas a través del reconocimiento visual. Perfecto para estudiantes, viajeros y cualquier persona que quiera expandir su vocabulario de forma divertida e interactiva.",
    benefits: "Beneficios",
    benefit1: "⚡ Aprende vocabulario más rápido con contexto visual",
    benefit2: "🎯 Aprendizaje personalizado que se adapta a ti",
    benefit3: "🌍 Practica pronunciación en situaciones reales",
    benefit4: "📊 Rastrea tu progreso automáticamente",
    getStarted: "¿Listo para comenzar a aprender?",
    getStartedText: "¡Elige tu idioma y comienza tu viaje de aprendizaje visual!"
  }
};

export default function WelcomeScreen({ onStartLearning }) {
  const [language, setLanguage] = useState('en');
  const [welcomeAnimation] = useState(new Animated.Value(0));
  const [fadeAnimation] = useState(new Animated.Value(0));

  // Función para obtener texto traducido
  const t = (key) => {
    return translations[language][key] || translations.en[key] || key;
  };

  useEffect(() => {
    loadLanguagePreference();
    startAnimations();
  }, []);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(welcomeAnimation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ]).start();
  };

  const loadLanguagePreference = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('appLanguage');
      if (savedLanguage) {
        setLanguage(savedLanguage);
      }
    } catch (error) {
      console.error('Error loading language preference:', error);
    }
  };

  const saveLanguagePreference = async (lang) => {
    try {
      await AsyncStorage.setItem('appLanguage', lang);
      setLanguage(lang);
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  };

  const handleStartLearning = () => {
    Animated.timing(welcomeAnimation, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      onStartLearning(language);
    });
  };

  return (
    <Animated.View style={[styles.container, { opacity: welcomeAnimation }]}>
      <LinearGradient
        colors={['#1e3c72', '#2a5298', '#4a90e2']}
        style={styles.gradient}
      >
        <ScrollView 
          contentContainerStyle={styles.welcomeContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Header con logo animado */}
          <Animated.View style={[styles.welcomeHeader, { opacity: fadeAnimation }]}>
            <View style={styles.logoContainer}>
              <View style={styles.bigLight} />
              <View style={styles.smallLights}>
                <View style={[styles.smallLight, { backgroundColor: '#ff6b6b' }]} />
                <View style={[styles.smallLight, { backgroundColor: '#ffd93d' }]} />
                <View style={[styles.smallLight, { backgroundColor: '#6bcf7f' }]} />
              </View>
            </View>
            <Text style={styles.logoText}>Visual DeX</Text>
            <Text style={styles.tagline}>{t('appDescription')}</Text>
          </Animated.View>

          {/* Selector de idioma */}
          <Animated.View style={[styles.languageSelector, { opacity: fadeAnimation }]}>
            <Text style={styles.languageSelectorTitle}>{t('languageSettings')}</Text>
            <View style={styles.languageButtons}>
              <TouchableOpacity
                style={[
                  styles.languageButton,
                  language === 'en' && styles.languageButtonActive
                ]}
                onPress={() => saveLanguagePreference('en')}
              >
                <Text style={[
                  styles.languageButtonText,
                  language === 'en' && styles.languageButtonTextActive
                ]}>🇺🇸 English</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.languageButton,
                  language === 'es' && styles.languageButtonActive
                ]}
                onPress={() => saveLanguagePreference('es')}
              >
                <Text style={[
                  styles.languageButtonText,
                  language === 'es' && styles.languageButtonTextActive
                ]}>🇪🇸 Español</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Acerca de la app */}
          <Animated.View style={[styles.featureSection, { opacity: fadeAnimation }]}>
            <Text style={styles.sectionTitle}>{t('aboutApp')}</Text>
            <Text style={styles.aboutText}>{t('aboutText')}</Text>
          </Animated.View>

          {/* Qué hace la app */}
          <Animated.View style={[styles.featureSection, { opacity: fadeAnimation }]}>
            <Text style={styles.sectionTitle}>{t('whatItDoes')}</Text>
            <View style={styles.featureList}>
              <Text style={styles.featureItem}>{t('feature1')}</Text>
              <Text style={styles.featureItem}>{t('feature2')}</Text>
              <Text style={styles.featureItem}>{t('feature3')}</Text>
              <Text style={styles.featureItem}>{t('feature4')}</Text>
              <Text style={styles.featureItem}>{t('feature5')}</Text>
            </View>
          </Animated.View>

          {/* Beneficios */}
          <Animated.View style={[styles.featureSection, { opacity: fadeAnimation }]}>
            <Text style={styles.sectionTitle}>{t('benefits')}</Text>
            <View style={styles.featureList}>
              <Text style={styles.featureItem}>{t('benefit1')}</Text>
              <Text style={styles.featureItem}>{t('benefit2')}</Text>
              <Text style={styles.featureItem}>{t('benefit3')}</Text>
              <Text style={styles.featureItem}>{t('benefit4')}</Text>
            </View>
          </Animated.View>

          {/* Cómo funciona */}
          <Animated.View style={[styles.featureSection, { opacity: fadeAnimation }]}>
            <Text style={styles.sectionTitle}>{t('howItWorks')}</Text>
            <View style={styles.stepsList}>
              <View style={styles.stepItem}>
                <View style={[styles.stepNumber, { backgroundColor: '#ff6b6b' }]}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={styles.stepText}>{t('step1')}</Text>
              </View>
              <View style={styles.stepItem}>
                <View style={[styles.stepNumber, { backgroundColor: '#ffd93d' }]}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={styles.stepText}>{t('step2')}</Text>
              </View>
              <View style={styles.stepItem}>
                <View style={[styles.stepNumber, { backgroundColor: '#6bcf7f' }]}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={styles.stepText}>{t('step3')}</Text>
              </View>
              <View style={styles.stepItem}>
                <View style={[styles.stepNumber, { backgroundColor: '#00ccff' }]}>
                  <Text style={styles.stepNumberText}>4</Text>
                </View>
                <Text style={styles.stepText}>{t('step4')}</Text>
              </View>
            </View>
          </Animated.View>

          {/* Call to action */}
          <Animated.View style={[styles.ctaSection, { opacity: fadeAnimation }]}>
            <Text style={styles.ctaTitle}>{t('getStarted')}</Text>
            <Text style={styles.ctaText}>{t('getStartedText')}</Text>
          </Animated.View>

          {/* Botón de inicio */}
          <Animated.View style={[styles.startButtonContainer, { opacity: fadeAnimation }]}>
            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStartLearning}
            >
              <LinearGradient
                colors={['#ff6b6b', '#ff8e53']}
                style={styles.startButtonGradient}
              >
                <Text style={styles.startButtonText}>{t('startButton')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  welcomeContainer: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 50,
  },
  welcomeHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  bigLight: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#00ccff',
    marginRight: 15,
    shadowColor: '#00ccff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },
  smallLights: {
    flexDirection: 'row',
    gap: 10,
    marginLeft: 10,
  },
  smallLight: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    marginBottom: 10,
  },
  tagline: {
    fontSize: 18,
    color: '#e3f2fd',
    textAlign: 'center',
    fontStyle: 'italic',
    fontWeight: '300',
  },
  
  // Language Selector
  languageSelector: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  languageSelectorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 15,
  },
  languageButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  languageButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  languageButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderColor: '#ffffff',
  },
  languageButtonText: {
    color: '#cccccc',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  languageButtonTextActive: {
    color: '#ffffff',
  },
  
  // Feature Section
  featureSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
    textAlign: 'center',
  },
  aboutText: {
    fontSize: 16,
    color: '#e3f2fd',
    lineHeight: 24,
    textAlign: 'center',
  },
  featureList: {
    gap: 12,
  },
  featureItem: {
    fontSize: 16,
    color: '#e3f2fd',
    lineHeight: 24,
  },
  
  // Steps Section
  stepsList: {
    gap: 18,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumber: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  stepNumberText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    color: '#e3f2fd',
    lineHeight: 22,
  },
  
  // CTA Section
  ctaSection: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 10,
  },
  ctaText: {
    fontSize: 16,
    color: '#e3f2fd',
    textAlign: 'center',
    lineHeight: 22,
  },
  
  // Start Button
  startButtonContainer: {
    marginBottom: 20,
  },
  startButton: {
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  startButtonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});