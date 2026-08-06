export type AuthStackParamList = {
  RoleSelect: undefined;
  Login: { role: 'farmer' | 'agency' | 'admin' };
  FarmerRegister: undefined;
  AgencyRegister: undefined;
  OtpVerify: { phone: string; purpose: 'REGISTRATION' | 'BOOKING'; role: 'farmer' | 'agency' };
};

export type FarmerTabParamList = {
  FarmerDashboard: undefined;
  PackageList: undefined;
  PackageDetails: { packageId: number };
  BookingForm: { packageId: number; vegetableName: string; initialPrice: number };
  MyBookings: undefined;
  FarmerProfile: undefined;
  RateAgency: { bookingId: number; agencyName: string; marketDestination: string };
};

export type AgencyTabParamList = {
  AgencyDashboard:  undefined;
  NicUpload:        undefined;
  ActivationPayment: undefined;
  CreatePackage:    undefined;
  ManagePackages:   undefined;
  UpdatePrice:      { packageId: number };
  BookingRequests:  undefined;
  Earnings:         undefined;
  AgencyProfile:    undefined;
  // Package detail + assignment
  PackageDetail:    { packageId: number };
  AssignDriver:     { packageId: number };
  // Driver management
  DriverList:       undefined;
  AddDriver:        undefined;
  DriverDetail:     { driverId: number };
  EditDriver:       { driverId: number };
  // Vehicle fleet management
  VehicleList:      undefined;
  AddVehicle:       undefined;
  VehicleDetail:    { vehicleId: number };
};

export type AdminTabParamList = {
  AdminDashboard:           undefined;
  AgencyVerification:       undefined;
  ActivationPaymentMonitor: undefined;
  RevenueAnalytics:         undefined;
  UserManagement:           undefined;
  DriverRegistry:           undefined;
  VehicleRegistry:          undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Farmer: undefined;
  Agency: undefined;
  Admin: undefined;
};
