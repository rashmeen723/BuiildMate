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
import RoleSelectionScreen from '../screens/RoleSelectionScreen';
import EmailVerificationScreen from '../screens/EmailVerificationScreen';
import CreatePasswordScreen from '../screens/CreatePasswordScreen';
import LocationPickerScreen from '../screens/LocationPickerScreen';
import MapSelectionScreen from '../screens/MapSelectionScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import ServiceProviderDetailsScreen from '../screens/ServiceProviderDetailsScreen';
import ServiceProviderDocumentsScreen from '../screens/ServiceProviderDocumentsScreen';
import ServiceProviderServiceAreaScreen from '../screens/ServiceProviderServiceAreaScreen';
import ServiceProviderReviewScreen from '../screens/ServiceProviderReviewScreen';
import ServiceProviderPendingScreen from '../screens/ServiceProviderPendingScreen';
import ServiceProviderDashboardScreen from '../screens/ServiceProviderDashboardScreen';
import RentalOwnerDetailsScreen from '../screens/RentalOwnerDetailsScreen';
import RentalOwnerDocumentsScreen from '../screens/RentalOwnerDocumentsScreen';
import RentalOwnerServiceAreaScreen from '../screens/RentalOwnerServiceAreaScreen';
import RentalOwnerReviewScreen from '../screens/RentalOwnerReviewScreen';
import RentalOwnerDashboardScreen from '../screens/RentalOwnerDashboardScreen';
import RentalOwnerScheduleScreen from '../screens/RentalOwnerScheduleScreen';
import RentalOwnerRatingsScreen from '../screens/RentalOwnerRatingsScreen';
import AddToolScreen from '../screens/AddToolScreen';
import RentalInventoryScreen from '../screens/RentalInventoryScreen';
import RentalRequestsScreen from '../screens/RentalRequestsScreen';
import RentalRequestDetailsScreen from '../screens/RentalRequestDetailsScreen';
import ServiceCategoryScreen from '../screens/ServiceCategoryScreen';
import ProviderProfileScreen from '../screens/ProviderProfileScreen';
import BookServiceScreen from '../screens/BookServiceScreen';
import BookingConfirmedScreen from '../screens/BookingConfirmedScreen';
import ToolCategoryScreen from '../screens/ToolCategoryScreen';
import ToolDetailsScreen from '../screens/ToolDetailsScreen';
import RentToolScreen from '../screens/RentToolScreen';
import ActivityScreen from '../screens/ActivityScreen';
import TrackServiceScreen from '../screens/TrackServiceScreen';
import RentalStatusScreen from '../screens/RentalStatusScreen';
import PaymentScreen from '../screens/PaymentScreen';
import NotificationScreen from '../screens/NotificationScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';
import OrderHistoryScreen from '../screens/OrderHistoryScreen';
import WriteReviewScreen from '../screens/WriteReviewScreen';
import ServiceProviderMapScreen from '../screens/ServiceProviderMapScreen';
import FinalizeJobScreen from '../screens/FinalizeJobScreen';
import BookingRequestScreen from '../screens/BookingRequestScreen';
import ProviderScheduleScreen from '../screens/ProviderScheduleScreen';
import ProviderRatingsScreen from '../screens/ProviderRatingsScreen';
import ToolRatingsScreen from '../screens/ToolRatingsScreen';
import ToolMapScreen from '../screens/ToolMapScreen';
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
                <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
                <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
                <Stack.Screen name="CreatePassword" component={CreatePasswordScreen} />
                <Stack.Screen name="LocationPicker" component={LocationPickerScreen} />
                <Stack.Screen name="MapSelection" component={MapSelectionScreen} />
                <Stack.Screen name="Welcome" component={WelcomeScreen} />
                <Stack.Screen name="ServiceProviderDetails" component={ServiceProviderDetailsScreen} />
                <Stack.Screen name="ServiceProviderDocuments" component={ServiceProviderDocumentsScreen} />
                <Stack.Screen name="ServiceProviderServiceArea" component={ServiceProviderServiceAreaScreen} />
                <Stack.Screen name="ServiceProviderReview" component={ServiceProviderReviewScreen} />
                <Stack.Screen name="ServiceProviderPending" component={ServiceProviderPendingScreen} />
                <Stack.Screen name="ServiceProviderDashboard" component={ServiceProviderDashboardScreen} />
                <Stack.Screen name="RentalOwnerDetails" component={RentalOwnerDetailsScreen} />
                <Stack.Screen name="RentalOwnerDocuments" component={RentalOwnerDocumentsScreen} />
                <Stack.Screen name="RentalOwnerServiceArea" component={RentalOwnerServiceAreaScreen} />
                <Stack.Screen name="RentalOwnerReview" component={RentalOwnerReviewScreen} />
                <Stack.Screen name="RentalOwnerDashboard" component={RentalOwnerDashboardScreen} />
                <Stack.Screen name="RentalOwnerSchedule" component={RentalOwnerScheduleScreen} />
                <Stack.Screen name="RentalOwnerRatings" component={RentalOwnerRatingsScreen} />
                <Stack.Screen name="AddTool" component={AddToolScreen} />
                <Stack.Screen name="RentalInventory" component={RentalInventoryScreen} />
                <Stack.Screen name="RentalRequests" component={RentalRequestsScreen} />
                <Stack.Screen name="RentalRequestDetails" component={RentalRequestDetailsScreen} />
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="ServiceCategory" component={ServiceCategoryScreen} />
                <Stack.Screen name="ProviderProfile" component={ProviderProfileScreen} />
                <Stack.Screen name="BookService" component={BookServiceScreen} />
                <Stack.Screen name="BookingConfirmed" component={BookingConfirmedScreen} options={{ headerShown: false }} />
                <Stack.Screen name="ToolCategory" component={ToolCategoryScreen} />
                <Stack.Screen name="ToolDetails" component={ToolDetailsScreen} />
                <Stack.Screen name="RentTool" component={RentToolScreen} />
                <Stack.Screen name="Activity" component={ActivityScreen} />
                <Stack.Screen name="TrackService" component={TrackServiceScreen} />
                <Stack.Screen name="RentalStatus" component={RentalStatusScreen} />
                <Stack.Screen name="Payment" component={PaymentScreen} />
                <Stack.Screen name="Notification" component={NotificationScreen} />
                <Stack.Screen name="Profile" component={ProfileScreen} />
                <Stack.Screen name="EditProfile" component={EditProfileScreen} />
                <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
                <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
                <Stack.Screen name="WriteReview" component={WriteReviewScreen} />
                <Stack.Screen name="ServiceProviderMap" component={ServiceProviderMapScreen} />
                <Stack.Screen name="FinalizeJob" component={FinalizeJobScreen} />
                <Stack.Screen name="BookingRequest" component={BookingRequestScreen} />
                <Stack.Screen name="ProviderSchedule" component={ProviderScheduleScreen} />
                <Stack.Screen name="ProviderRatings" component={ProviderRatingsScreen} />
                <Stack.Screen name="ToolRatings" component={ToolRatingsScreen} />
                <Stack.Screen name="ToolMap" component={ToolMapScreen} />
                {/* Add more screens here later */}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;

