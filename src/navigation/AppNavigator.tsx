import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen1 from '../screens/OnboardingScreen1';
import OnboardingScreen2 from '../screens/OnboardingScreen2';
import OnboardingScreen3 from '../screens/OnboardingScreen3';
import LoginSignupScreen from '../screens/LoginSignupScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import EmailVerificationScreen from '../screens/EmailVerificationScreen';
import CreatePasswordScreen from '../screens/CreatePasswordScreen';
import LocationPickerScreen from '../screens/LocationPickerScreen';
import MapSelectionScreen from '../screens/MapSelectionScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Splash"
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Stack.Screen name="Splash" component={SplashScreen} />
                <Stack.Screen name="OnboardingScreen1" component={OnboardingScreen1} />
                <Stack.Screen name="OnboardingScreen2" component={OnboardingScreen2} />
                <Stack.Screen name="OnboardingScreen3" component={OnboardingScreen3} />
                <Stack.Screen name="LoginSignup" component={LoginSignupScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="SignUp" component={SignUpScreen} />
                <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
                <Stack.Screen name="CreatePassword" component={CreatePasswordScreen} />
                <Stack.Screen name="LocationPicker" component={LocationPickerScreen} />
                <Stack.Screen name="MapSelection" component={MapSelectionScreen} />
                <Stack.Screen name="Welcome" component={WelcomeScreen} />
                <Stack.Screen name="Home" component={HomeScreen} />
                {/* Add more screens here later */}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;

