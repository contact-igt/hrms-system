import { apiRequest } from "../../auth/api/auth.api";

export type OrganizationRecord = {
  id: string;
  name: string;
  code: string;
  domain: string;
  status: "NOT_INVITED" | "PENDING" | "ACTIVE" | "SUSPENDED" | "ARCHIVED";
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

  getOrganization(id: string, accessToken: string) {
    return apiRequest<OrganizationRecord>(
      `/platform/organizations/${id}`,
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

  inviteOrganizationAdmin(organizationId: string, admin: {firstName: string; lastName: string; email: string} | undefined, accessToken: string) {
    return apiRequest<unknown>(
      `/platform/organizations/${organizationId}/admin-invitations`,
      {
        method: "POST",
        body: admin ? JSON.stringify(admin) : undefined,
      },
      accessToken,
    );
  },

  deleteOrganization(id: string, accessToken: string) {
    return apiRequest<void>(`/platform/organizations/${id}`,
      {
        method: "DELETE",
      },
      accessToken,
    );
  },
};


