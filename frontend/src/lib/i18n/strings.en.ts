// ── English UI Strings ────────────────────────────────────────────────────────

const en = {
  // App
  appName: "HireRent",
  tagline: "Find trusted professionals for every need",

  // Navigation
  nav: {
    home: "Home",
    login: "Log In",
    register: "Sign Up",
    logout: "Log Out",
    dashboard: "Dashboard",
    jobs: "Jobs",
    bookings: "Bookings",
    messages: "Messages",
    notifications: "Notifications",
    settings: "Settings",
    help: "Help",
    earnings: "Earnings",
    services: "My Services",
    availability: "Availability",
    reviews: "Reviews",
    profile: "Profile",
  },

  // Auth
  auth: {
    loginTitle: "Welcome back",
    loginSubtitle: "Sign in to your account",
    registerTitle: "Create your account",
    registerSubtitle: "Join thousands of customers and providers",
    roleCustomer: "I need a service",
    roleProvider: "I offer services",
    emailLabel: "Email address",
    passwordLabel: "Password",
    nameLabel: "Full name",
    phoneLabel: "Phone number (optional)",
    forgotPassword: "Forgot password?",
    noAccount: "Don't have an account?",
    haveAccount: "Already have an account?",
    signUp: "Sign up",
    signIn: "Sign in",
    termsText: "I agree to the",
    termsLink: "Terms of Service",
    andText: "and",
    privacyLink: "Privacy Policy",
    resetCode: "Reset code",
    newPassword: "New password",
    sendCode: "Send reset code",
    resetPassword: "Reset password",
    forgotTitle: "Forgot your password?",
    forgotSubtitle: "Enter your email and we'll send you a reset code",
    backToLogin: "Back to login",
    passwordHint: "Min 8 characters, 1 uppercase, 1 number",
  },

  // Landing
  landing: {
    heroTitle: "Find trusted professionals for any job",
    heroSubtitle: "Compare offers, book instantly, pay securely — all in one place.",
    searchPlaceholder: "What service do you need?",
    locationPlaceholder: "Your location",
    findButton: "Find Services",
    aiButton: "Describe your problem",
    howItWorksTitle: "How it works",
    step1Title: "Post or Browse",
    step1Desc: "Describe your job or browse available services near you.",
    step2Title: "Compare & Choose",
    step2Desc: "Compare offers by price, rating, and distance. Our AI finds the best match.",
    step3Title: "Book & Pay Safely",
    step3Desc: "Pay securely through escrow — released only when you're satisfied.",
    trustTitle: "Trusted by thousands",
    trustVerified: "Verified providers",
    trustRatings: "Reviews & ratings",
    trustEscrow: "Escrow-protected payments",
    becomeProvider: "Become a Provider",
    browseCategories: "Browse Categories",
  },

  // Roles
  roles: {
    customer: "Customer",
    provider: "Provider",
    admin: "Admin",
  },

  // Common
  common: {
    loading: "Loading...",
    error: "Something went wrong",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    confirm: "Confirm",
    back: "Back",
    next: "Next",
    submit: "Submit",
    search: "Search",
    filter: "Filter",
    clear: "Clear",
    viewAll: "View all",
    noResults: "No results found",
    required: "This field is required",
    optional: "Optional",
  },

  // Errors
  errors: {
    required: "This field is required",
    invalidEmail: "Please enter a valid email address",
    passwordWeak: "Password must be at least 8 characters with 1 uppercase and 1 number",
    passwordMismatch: "Passwords do not match",
    networkError: "Network error. Please check your connection.",
    unauthorized: "Your session has expired. Please log in again.",
    forbidden: "You do not have permission to access this page.",
    notFound: "The requested page was not found.",
  },
} as const;

export default en;

// DeepString: like typeof en but with all leaf values typed as `string`
// so Arabic can supply different actual string values.
type DeepString<T> = { [K in keyof T]: T[K] extends string ? string : DeepString<T[K]> };
export type Strings = DeepString<typeof en>;
