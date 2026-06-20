import { apiRequest } from "../../auth/api/auth.api";

export type OrganizationRecord = {
  id: string;
  name: string;
  code: string;
  domain: string;
  status: "PENDING" | "ACTIVE" | "SUSPENDED" | "ARCHIVED";
  memberCount: number;
};

export type CreateOrganizationInput = {
  name: string;
  code: string;
  domain: string;
  admin: {
    firstName: string;
    lastName: string;
    email: string;
  };
};

export const platformApi = {
  listOrganizations(accessToken: string) {
    return apiRequest<OrganizationRecord[]>(
      "/platform/organizations",
      {},
      accessToken,
    );
  },

  createOrganization(input: CreateOrganizationInput, accessToken: string) {
    return apiRequest<OrganizationRecord>(
      "/platform/organizations",
      {
        method: "POST",
        body: JSON.stringify(input),
      },
      accessToken,
    );
  },
};
