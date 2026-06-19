# HRMS Dashboard

## Design Reference

![HRMS operations dashboard](./assets/hrms-dashboard-design.png)

> Image location: `Docs/assets/hrms-dashboard-design.png`

---

## Dashboard Purpose

This dashboard gives HR administrators a quick view of attendance, payroll,
performance, vacancies, employee status, interviews, and meetings.

## Main Sections

### Sidebar

- Dashboard
- Attendance
- Payroll
- Performance
- Employees
- Recruitment
- Meetings and Events
- Reports and Analytics
- Support
- Logout
- Light and dark theme switch

### Header

- Welcome message
- Global search
- Settings
- Help or information
- Notifications

### Attendance

- Present employees
- Late employees
- Employees on leave
- Absent employees
- Attendance percentage chart

### Payroll

- Employee photo and name
- Employee ID
- Salary amount
- Paid or pending status

### Performance Statistics

- Team-based performance chart
- Last seven days filter
- Development, design, marketing, and management team data

### Current Vacancies

- Job title
- Hiring platform
- Scheduled candidate count
- Link to vacancy details

### Employee Performance

- Excellent, good, fair, and improved categories
- Percentage distribution
- Performance reminder or recommendation

### Employment Status

- Total employee count
- Permanent employees
- Contract employees
- Employees on probation

### Interviews

- Candidate profile pictures
- Total interview count
- Link to interview details

### Meetings and Events

- Meeting title
- Department
- Meeting time
- Participant list
- Meeting platform
- Join-now button

---

## Suggested Frontend Structure

```text
features/dashboard/
├── api/
│   ├── dashboard.api.ts
│   └── dashboard.queries.ts
├── components/
│   ├── AttendanceCard.tsx
│   ├── PayrollCard.tsx
│   ├── PerformanceChart.tsx
│   ├── VacancyList.tsx
│   ├── EmploymentStatus.tsx
│   ├── InterviewCard.tsx
│   └── MeetingsCard.tsx
├── pages/
│   └── DashboardPage.tsx
└── dashboard.types.ts
```

## API Endpoints

```http
GET /api/v1/dashboard/attendance
GET /api/v1/dashboard/payroll
GET /api/v1/dashboard/performance
GET /api/v1/dashboard/vacancies
GET /api/v1/dashboard/employment-status
GET /api/v1/dashboard/interviews
GET /api/v1/dashboard/meetings
```

## Responsive Design

- Desktop: fixed sidebar and three-column widget layout
- Tablet: collapsible sidebar and two-column layout
- Mobile: drawer navigation and one-column layout
- Charts must resize to fit their containers
- Every widget must include loading, empty, and error states

## Implementation Order

1. Create the sidebar and dashboard layout.
2. Add attendance and payroll widgets.
3. Add performance charts.
4. Add vacancies and employment status.
5. Add interviews and meeting cards.
6. Connect dashboard APIs.
7. Add role-based data access.
8. Add responsive styles and tests.

