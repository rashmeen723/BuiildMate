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
    Suspended: undefined;

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
    RentalOwnerSchedule: undefined;
    RentalOwnerRatings: { ownerId?: string; ownerName?: string } | undefined;
    AddTool: { tool?: any } | undefined;
    RentalInventory: undefined;
    RentalRequests: undefined;
    RentalRequestDetails: {
        rentalId: string;
        toolName: string;
        customerName: string;
        startDate: string;
        endDate: string;
        totalAmount: number;
        pickupLocation?: string;
        customerPhone: string;
        toolImage?: string;
        customerImage?: string;
        status: string;
        paymentMethod?: string;
        isPaid?: boolean;
        extensionDays?: number | null;
        extensionStatus?: string | null;
        extensionCost?: number | null;
        pickupPhotos?: string[];
        returnPhotos?: string[];
    };

    // Tool Rental Screens
    ToolCategory: { categoryName: string; selectedLocation?: any; selectedAddress?: string };
    ToolDetails: { tool: any; fromDate?: string; toDate?: string };
    ToolRatings: { toolId: string; toolName: string };
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
    RentalStatus: {
        rentalId: string;
        toolName: string;
        dueDate: string;
        image: string;
        status?: string;
        startDate?: string;
        ownerName?: string;
        ownerId?: string;
        ownerPhone?: string | null;
        ownerAddress?: string;
        paymentMethod?: string;
        isPaid?: boolean;
        totalAmount?: number;
        reviews?: any[];
        extensionDays?: number | null;
        extensionStatus?: string | null;
        extensionCost?: number | null;
    };
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
    OrderHistory: undefined,
    ChangePassword: undefined;
    ForgotPassword: undefined;
    WriteReview: {
        reviewType: 'SERVICE' | 'RENTAL';
        id: string; // bookingId or rentalId
        targetId: string; // providerId or ownerId
        title: string; // serviceName or toolName
        subtitle: string; // providerName or ownerName
        image: string;
    };
    ReportIssue: {
        reportType: 'SERVICE' | 'RENTAL';
        id: string; // bookingId or rentalId
        targetId: string; // providerId or ownerId
        title: string; // serviceName or toolName
        subtitle: string; // providerName or ownerName
        image?: string;
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
    ToolMap: {
        tools: any[];
        initialRegion: {
            latitude: number;
            longitude: number;
            latitudeDelta: number;
            longitudeDelta: number;
        };
        userLocation?: {
            latitude: number;
            longitude: number;
            address?: string;
        };
        singleToolMode?: boolean;
    };
    ProviderSchedule: undefined;
    ProviderRatings: { providerId?: string; providerName?: string } | undefined;
};

declare global {
    namespace ReactNavigation {
        interface RootParamList extends RootStackParamList { }
    }
}
