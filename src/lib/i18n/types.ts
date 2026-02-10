// This file is generated based on the messages structure
export interface Messages {
  common: {
    loading: string
    error: string
    success: string
    cancel: string
    save: string
    edit: string
    delete: string
    search: string
    back: string
    next: string
    previous: string
    yes: string
    no: string
  }
  navigation: {
    home: string
    domains: string
    search: string
    cart: string
    admin: string
    login: string
    register: string
    profile: string
    logout: string
  }
  domain: {
    search: string
    searchPlaceholder: string
    available: string
    unavailable: string
    price: string
    addToCart: string
    getItNow: string
    suggestions: string
    results: string
    noResults: string
    searchError: string
  }
  cart: {
    title: string
    empty: string
    checkout: string
    total: string
    remove: string
    update: string
    quantity: string
  }
  auth: {
    signin: string
    signup: string
    email: string
    password: string
    confirmPassword: string
    firstName: string
    lastName: string
    forgotPassword: string
    alreadyHaveAccount: string
    dontHaveAccount: string
    createAccount: string
  }
  profile: {
    title: string
    personalInfo: string
    contactInfo: string
    address: string
    city: string
    state: string
    postCode: string
    country: string
    phone: string
    fax: string
    companyName: string
    updateProfile: string
    profileUpdated: string
  }
  admin: {
    dashboard: string
    users: string
    domains: string
    orders: string
    settings: string
  }
  errors: {
    invalidEmail: string
    passwordTooShort: string
    passwordsDontMatch: string
    requiredField: string
    networkError: string
    serverError: string
  }
}

declare global {
  // Use type safe message keys with `next-intl`
  interface IntlMessages extends Messages {}
}
