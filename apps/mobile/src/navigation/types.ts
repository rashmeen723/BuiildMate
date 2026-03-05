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
    ServiceCategory: { categoryName?: string };
    ProviderProfile: {
        providerId?: string;
        providerName?: string;
        providerImage?: string;
        providerRating?: number;
        providerReviews?: number;
        role?: string;
    };
    BookService: {
        providerId: string;
        providerName?: string;
        providerImage?: string;
        providerRating?: number;
        providerReviews?: number;
        providerPhone?: string;
        providerEmail?: string;
        role?: string;
        selectedDate?: string;
        selectedTime?: string;
        address?: string;
    };
    BookingConfirmed: {
        providerName: string;
        serviceType: string;
        date: string;
        time: string;
        address: string;
        estimatedTotal: string;
    };
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
    MapSelection: {
        returnScreen?: string;
        email?: string;
        fullName?: string;
        phone?: string;
        role?: string;
        currentAddress?: string;
    };
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
    ServiceProviderDashboard: undefined;

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
    RentalOwnerDashboard: undefined;

    // Tool Rental Screens
    ToolCategory: { categoryName: string };
    ToolDetails: { tool: any; fromDate?: string; toDate?: string };
    RentTool: { tool: any; startDate: string; endDate: string; totalDays: number; totalPrice: number };
    Activity: { updatedRentalId?: number; newStatus?: string } | undefined;
    TrackService: {
        serviceId: string | number;
        providerId?: string;
        providerName: string;
        serviceType: string;
        status?: string;
        arrivedAt?: string;
        serviceImage?: string;
    };
    RentalStatus: { rentalId: number; toolName: string; dueDate: string; image: string };
    Payment: {
        id: string | number;
        title: string;
        amount: number;
        type: 'SERVICE' | 'RENTAL';
        baseAmount?: number;
        additionalCharges?: number;
        serviceFee?: number;
    };
    FinalizeJob: {
        serviceId: string | number;
        serviceType: string;
        serviceFee: number;
        customerName: string;
        arrivedAt?: string;
        hourlyRate?: number;
    };
    BookingRequest: {
        bookingId: string | number;
        customerName: string;
        address: string;
        date: string;
        time: string;
        description?: string;
        estimatedTotal: number;
        phone: string;
        latitude?: number;
        longitude?: number;
        customerImage?: string;
        issueImage?: string;
    };
    Notification: undefined;
    Profile: undefined;
    EditProfile: { selectedLocation?: any; selectedAddress?: string } | undefined;
    OrderHistory: undefined;
    NotificationSettings: undefined;
    WriteReview: {
        serviceId: string;
        providerId: string;
        serviceName: string;
        providerName: string;
        serviceImage: string;
    };
    ServiceProviderMap: {
        providers: any[];
        initialRegion: {
            latitude: number;
            longitude: number;
            latitudeDelta: number;
            longitudeDelta: number;
        };
    };
    ProviderSchedule: undefined;
    ProviderRatings: { providerId?: string; providerName?: string } | undefined;
};

declare global {
    namespace ReactNavigation {
        interface RootParamList extends RootStackParamList { }
    }
}
