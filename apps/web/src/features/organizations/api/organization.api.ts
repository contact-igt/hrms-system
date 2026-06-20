import { apiRequest } from "../../auth/api/auth.api";

export type OrganizationMember = {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  role: string;
  status: "INVITED" | "ACTIVE" | "SUSPENDED";
};

export type InviteEmployeeInput = {
  firstName: string;
  lastName: string;
  email: string;
  employeeCode: string;
  departmentId: string;
  designationId: string;
  role: string;
};

export const organizationApi = {
  listMembers(accessToken: string) {
    return apiRequest<OrganizationMember[]>(
      "/organization/members",
      {},
      accessToken,
    );
  },

  inviteEmployee(input: InviteEmployeeInput, accessToken: string) {
    return apiRequest<{ invitationId: string }>(
      "/organization/employee-invitations",
      {
        method: "POST",
        body: JSON.stringify(input),
      },
      accessToken,
    );
  },

  updateSettings(
    input: { name: string; domain: string; timezone: string },
    accessToken: string,
  ) {
    return apiRequest<{ updated: true }>(
      "/organization",
      {
        method: "PATCH",
        body: JSON.stringify(input),
      },
      accessToken,
    );
  },
};
