export type RootStackParamList = {
    Splash: undefined;
    OnboardingScreen1: undefined;
    OnboardingScreen2: undefined;
    OnboardingScreen3: undefined;
    LoginSignup: undefined;
    Login: undefined;
    SignUp: { role: string };
    RoleSelection: undefined;
    Home: undefined;
    Details: undefined; // Placeholder for now
    EmailVerification: { email: string; fullName: string; phone: string; role: string };
    CreatePassword: {
        email?: string;
        fullName?: string;
        phone?: string;
        role?: string;
        // Service Provider specific data
        professionalDetails?: any;
        rentalDetails?: any;
        documents?: any;
        serviceArea?: any;
        // Household specific
        address?: string;
        location?: any;
    };
    LocationPicker: { selectedLocation?: any; selectedAddress?: string; email?: string; fullName?: string; phone?: string; role?: string } | undefined;
    MapSelection: { returnScreen?: string };
    Welcome: undefined;

    // Service Provider Screens
    ServiceProviderDetails: {
        email: string;
        fullName: string;
        phone: string;
        role: string;
        currentDetails?: any;
    };
    ServiceProviderDocuments: {
        email: string;
        fullName: string;
        phone: string;
        role: string;
        professionalDetails: any;
        currentDocuments?: any;
    };
    ServiceProviderServiceArea: {
        email: string;
        fullName: string;
        phone: string;
        role: string;
        professionalDetails: any;
        documents: any;
        selectedLocation?: any;
        selectedAddress?: string;
        currentServiceArea?: any;
    };
    ServiceProviderReview: {
        email: string;
        fullName: string;
        phone: string;
        role: string;
        professionalDetails: any;
        documents: any;
        serviceArea: any;
        password?: string;
    };
    ServiceProviderPending: undefined;

    // Rental Owner Screens
    RentalOwnerDetails: { email: string; fullName: string; phone: string; role: string; currentDetails?: any };
    RentalOwnerDocuments: { email: string; fullName: string; phone: string; role: string; rentalDetails: any; currentDocuments?: any };
    RentalOwnerServiceArea: {
        email: string;
        fullName: string;
        phone: string;
        role: string;
        rentalDetails: any;
        documents: any;
        selectedLocation?: any;
        selectedAddress?: string;
        currentServiceArea?: any;
    };
    RentalOwnerReview: {
        email: string;
        fullName: string;
        phone: string;
        role: string;
        rentalDetails: any;
        documents: any;
        serviceArea: any;
        password?: string;
    };
};

declare global {
    namespace ReactNavigation {
        interface RootParamList extends RootStackParamList { }
    }
}
