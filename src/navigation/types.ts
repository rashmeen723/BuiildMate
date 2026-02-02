export type RootStackParamList = {
    Splash: undefined;
    OnboardingScreen1: undefined;
    OnboardingScreen2: undefined;
    OnboardingScreen3: undefined;
    LoginSignup: undefined;
    Login: undefined;
    SignUp: undefined;
    Home: undefined;
    Details: undefined; // Placeholder for now
    EmailVerification: { email: string };
    CreatePassword: undefined;
    LocationPicker: { selectedLocation?: any; selectedAddress?: string } | undefined;
    MapSelection: undefined;
    Welcome: undefined;
};

declare global {
    namespace ReactNavigation {
        interface RootParamList extends RootStackParamList { }
    }
}
