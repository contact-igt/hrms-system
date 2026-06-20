export type AuthScope = "PLATFORM" | "ORGANIZATION";

export type OrganizationSummary = {
  id: string;
  name: string;
  code: string;
};

export type AuthUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  scopeType: AuthScope;
  organization?: OrganizationSummary;
  roles: string[];
  permissions: string[];
};

export type AuthSession = {
  accessToken: string;
  user: AuthUser;
};

export type LoginInput = {
  email: string;
  password: string;
  organizationCode?: string;
};

export type RegisterInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  invitationToken: string;
};

export type OtpPurpose =
  | "EMAIL_VERIFICATION"
  | "LOGIN"
  | "PASSWORD_RESET";

export type OtpFlowState = {
  challengeId: string;
  purpose: OtpPurpose;
  maskedDestination: string;
  email?: string;
};

export type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
};

export type ApiFailure = {
  success: false;
  message: string;
  code?: string;
  errors?: Array<{ field: string; message: string }>;
};
