# Attendance & Availability Management — Frontend

> Frontend companion for the Attendance & Availability Management System.  
> Portions of this README (architecture, flows, diagrams, API contract notes) are shared with the backend README for consistency.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Directory Structure](#directory-structure)
- [Getting Started (Local Dev)](#getting-started-local-dev)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [i18n (Localization)](#i18n-localization)
- [Auth & API Integration](#auth--api-integration)
- [Mermaid Diagrams (Shared Flows)](#mermaid-diagrams-shared-flows)
- [Troubleshooting & Common Issues](#troubleshooting--common-issues)
- [Contributing & License](#contributing--license)

---

## Project Overview

This repository contains the **frontend** (Next.js + React) for the Attendance & Availability Management System.  
It provides UIs for Engineers, Sales, and Admins to submit and edit daily attendance, view dashboards and reports, trigger monthly report generation, and interact with Slack & the AI chatbot. Many architectural and workflow details are shared with the backend; where content is identical it has been kept consistent.

---

## Tech Stack

- **Next.js** - App router
- **React** - Functional components, hooks
- **Chakra UI** - Component library
- **Axios** - HTTP client
- **react-hook-form + zod** - Forms & validation
- **next-i18next / i18next** - i18n
- **framer-motion** - Animations
- **ESLint, Prettier, Husky** - Tooling
- **TypeScript** - (optional, recommended)

---

## Directory Structure

Important files and folders:

```
├── .env.production
├── .eslintrc.json
├── .github
    └── workflows
    │   └── mirror-to-vercel.yml
├── .gitignore
├── .husky
    └── pre-commit
├── .prettierignore
├── .prettierrc.json
├── .vscode
    └── settings.json
├── README.md
├── eslint.config.mjs
├── next-i18next.config.js
├── next.config.ts
├── package-lock.json
├── package.json
├── public
    ├── file.svg
    ├── globe.svg
    ├── images
    │   └── logo.png
    ├── locales
    │   ├── en
    │   │   ├── admin.json
    │   │   ├── auth.json
    │   │   ├── common.json
    │   │   ├── engineer.json
    │   │   └── sales.json
    │   └── ja
    │   │   ├── admin.json
    │   │   ├── auth.json
    │   │   ├── common.json
    │   │   ├── engineer.json
    │   │   └── sales.json
    ├── next.svg
    ├── vercel.svg
    └── window.svg
├── src
    ├── app
    │   ├── admin
    │   │   ├── dashboard
    │   │   │   └── page.tsx
    │   │   ├── layout.tsx
    │   │   └── users
    │   │   │   └── register
    │   │   │       └── page.tsx
    │   ├── engineer
    │   │   ├── attendance
    │   │   │   └── page.tsx
    │   │   ├── dashboard
    │   │   │   └── page.tsx
    │   │   ├── layout.tsx
    │   │   ├── projects
    │   │   │   └── page.tsx
    │   │   └── reports
    │   │   │   ├── update
    │   │   │       └── page.tsx
    │   │   │   └── view
    │   │   │       └── page.tsx
    │   ├── favicon.ico
    │   ├── first-login-reset
    │   │   └── page.tsx
    │   ├── forgot-password
    │   │   └── page.tsx
    │   ├── globals.css
    │   ├── layout.tsx
    │   ├── login
    │   │   └── page.tsx
    │   ├── page.module.css
    │   ├── page.tsx
    │   ├── providers.tsx
    │   ├── reset-password
    │   │   └── page.tsx
    │   ├── sales
    │   │   ├── assignments
    │   │   │   ├── create
    │   │   │   │   └── page.tsx
    │   │   │   ├── manage
    │   │   │   │   └── page.tsx
    │   │   │   └── page.tsx
    │   │   ├── clients
    │   │   │   ├── add
    │   │   │   │   └── page.tsx
    │   │   │   ├── page.tsx
    │   │   │   ├── projects
    │   │   │   │   └── page.tsx
    │   │   │   └── update
    │   │   │   │   └── page.tsx
    │   │   ├── dashboard
    │   │   │   └── page.tsx
    │   │   ├── engineers
    │   │   │   ├── attendance
    │   │   │   │   ├── components
    │   │   │   │   │   ├── CalendarHeader.tsx
    │   │   │   │   │   ├── CalendarView.tsx
    │   │   │   │   │   ├── EditSlideOver.tsx
    │   │   │   │   │   ├── EngineerSidebar.tsx
    │   │   │   │   │   └── ResizableSplitter.tsx
    │   │   │   │   ├── page-old.tsx
    │   │   │   │   └── page.tsx
    │   │   │   ├── create
    │   │   │   │   └── page.tsx
    │   │   │   ├── page.tsx
    │   │   │   └── update
    │   │   │   │   └── page.tsx
    │   │   ├── layout.tsx
    │   │   ├── projects
    │   │   │   ├── add
    │   │   │   │   └── page.tsx
    │   │   │   ├── page.tsx
    │   │   │   └── update
    │   │   │   │   └── page.tsx
    │   │   └── reports
    │   │   │   ├── components
    │   │   │       ├── GenerateReport.tsx
    │   │   │       └── ViewAllReports.tsx
    │   │   │   └── page.tsx
    │   └── verify-otp
    │   │   └── page.tsx
    ├── components
    │   ├── LanguageSwitcher.tsx
    │   ├── chatbot
    │   │   ├── ChatbotModal.tsx
    │   │   └── SalesAdminChatbotModal.tsx
    │   ├── error-boundaries
    │   │   ├── AuthErrorBoundary.tsx
    │   │   ├── FeatureErrorBoundary.tsx
    │   │   ├── GlobalErrorBoundary.tsx
    │   │   └── index.ts
    │   ├── layout
    │   │   ├── DashboardLayout.tsx
    │   │   ├── Navbar.tsx
    │   │   └── Sidebar.tsx
    │   ├── providers
    │   │   └── NavigationProvider.tsx
    │   ├── slack
    │   │   ├── SlackConnectionCard.tsx
    │   │   └── SlackConnectionModal.tsx
    │   └── ui
    │   │   ├── EnhancedButton.tsx
    │   │   ├── KeyboardShortcutsModal.tsx
    │   │   ├── LoadingSpinner.tsx
    │   │   ├── TabNavigation.tsx
    │   │   ├── alert.tsx
    │   │   └── toaster.tsx
    ├── context
    │   └── AuthContext.tsx
    ├── hooks
    │   ├── useEnhancedToast.ts
    │   ├── useHapticFeedback.ts
    │   ├── useIsHydrated.ts
    │   └── useKeyboardShortcuts.ts
    ├── lib
    │   └── i18n.ts
    ├── shared
    │   ├── config
    │   │   ├── assignmentTabs.ts
    │   │   ├── clientTabs.ts
    │   │   ├── engineerTabs.ts
    │   │   ├── navigation.ts
    │   │   ├── projectTabs.ts
    │   │   ├── reportTabs.ts
    │   │   ├── routes.config.ts
    │   │   └── theme.config.ts
    │   ├── constants
    │   │   ├── errorCodes.tsx
    │   │   └── roles.tsx
    │   ├── lib
    │   │   ├── api-client.ts
    │   │   ├── auth-guard.tsx
    │   │   └── navigation.ts
    │   ├── service
    │   │   ├── adminService.ts
    │   │   ├── assignmentService.ts
    │   │   ├── attendanceService.ts
    │   │   ├── authService.ts
    │   │   ├── chatbotService.ts
    │   │   ├── clientService.ts
    │   │   ├── dashboardService.ts
    │   │   ├── engineerService.ts
    │   │   ├── projectService.ts
    │   │   ├── salesService.ts
    │   │   ├── slackService.ts
    │   │   └── userService.ts
    │   ├── types
    │   │   └── report.types.ts
    │   └── utils
    │   │   └── cache.ts
    └── utils
    │   └── jwtDecode.ts
└── tsconfig.json
```

---

## Getting Started (Local Dev)

### Prerequisites

- **Node.js:** v16.x or higher
- **npm:** v7.x or higher
- **Backend API:** Running and accessible

### Installation

1. **Clone frontend and install:**

   ```bash
   git clone <repo-url>
   cd <repo-root>/frontend
   npm install
   # or yarn / pnpm
   ```

2. **Add environment variables:**

   ```bash
   cp .env.local.example .env.local   # if example present
   # Edit .env.local with your configuration
   ```

3. **Run development server:**

   ```bash
   npm run dev
   # open http://localhost:3000
   ```

4. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

---

## Environment Variables

Frontend uses **public** env vars (prefix `NEXT_PUBLIC_`).

### Example `.env.local`

```env
NEXT_PUBLIC_API_URL=https://attendance-atf.ddns.net/api
NEXT_PUBLIC_APP_NAME="Attendance Management System"
NEXT_PUBLIC_DEFAULT_LOCALE=en
```

> **Note:** Ensure `NEXT_PUBLIC_API_URL` points to your backend (the frontend sends the JWT and API requests to this base). This is consistent with the backend API contract.

---

## Scripts

Typical `package.json` scripts:

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
  "format": "prettier --write ."
}
```

### Available Commands

```bash
# Development
npm run dev              # Start development server with hot reload
npm run build            # Build production bundle
npm start                # Start production server

# Code Quality
npm run lint             # Check linting errors
npm run format           # Format code with Prettier
```

---

## i18n (Localization)

### Supported Languages

- **`en`** - English (default)
- **`ja`** - Japanese

### Configuration

- Translation files: `public/locales/{en|ja}`
- Config file: `next-i18next.config.js`
- Uses `next-i18next` for internationalization

### Implementation

Add a `LanguageSwitcher` component in the header to toggle languages. Persist selection in cookie/localStorage.

**Example:**

```jsx
import { useTranslation } from 'next-i18next';

function MyComponent() {
  const { t } = useTranslation('common');
  return <h1>{t('welcome')}</h1>;
}
```

---

## Auth & API Integration

### Authentication Flow

1. **Login:** Frontend POSTs credentials to backend `/api/auth/login`
2. **Response:** Receives `{ user, token }`
3. **Storage:** Store token (AuthContext/localStorage)
4. **API Calls:** Include `Authorization: Bearer <token>` in all requests

### Axios Setup

Create `src/lib/api.ts` with base configuration:

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Error Handling

Follow backend response envelope:

**Success Response:**

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    /* response data */
  }
}
```

**Error Response:**

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "metadata": {
    /* additional context */
  }
}
```

---

## Mermaid Diagrams (Shared Flows)

Below are the mermaid diagrams taken from the backend README that are relevant to frontend behavior (authentication, attendance submission, report generation, Slack & chatbot flows). These are included _verbatim_ so you can render them in Markdown viewers that support Mermaid.

### 1. User Authentication Flow

```mermaid
flowchart TD
    Start([User Opens App]) --> CheckAuth{Has Valid JWT?}
    CheckAuth -->|Yes| Dashboard[Dashboard]
    CheckAuth -->|No| Login[Login Page]

    Login --> EnterCreds[Enter Email & Password]
    EnterCreds --> SubmitLogin[Submit Login]
    SubmitLogin --> ValidateCreds{Valid Credentials?}

    ValidateCreds -->|No| LoginError[Show Error]
    LoginError --> Login

    ValidateCreds -->|Yes| CheckActive{User Active?}
    CheckActive -->|No| InactiveError[Account Inactive]
    CheckActive -->|Yes| CheckFirstLogin{First Login?}

    CheckFirstLogin -->|Yes| ForceReset[Force Password Reset]
    ForceReset --> ResetPass[Set New Password]
    ResetPass --> Dashboard

    CheckFirstLogin -->|No| Dashboard

    Login --> ForgotPass[Forgot Password?]
    ForgotPass --> EnterEmail[Enter Email]
    EnterEmail --> SendOTP[Send OTP to Email]
    SendOTP --> EnterOTP[Enter OTP Code]
    EnterOTP --> VerifyOTP{Valid OTP?}
    VerifyOTP -->|No| OTPError[Invalid OTP]
    OTPError --> EnterOTP
    VerifyOTP -->|Yes| NewPassword[Set New Password]
    NewPassword --> Login

    Dashboard --> RoleCheck{User Role?}
    RoleCheck -->|Engineer| EngineerView[Engineer Dashboard]
    RoleCheck -->|Sales| SalesView[Sales Dashboard]
    RoleCheck -->|Admin| AdminView[Admin Dashboard]
```

### 2. Attendance Submission Flow (Engineer)

```mermaid
flowchart TD
    Start([Engineer Dashboard]) --> ViewProjects[View Active Projects]
    ViewProjects --> SelectProject[Select Project]
    SelectProject --> SubmitAttendance[Click Submit Attendance]

    SubmitAttendance --> SelectDate[Select Work Date]
    SelectDate --> CheckDateValid{Date Valid?}

    CheckDateValid -->|Future beyond month| DateError[Date Error]
    CheckDateValid -->|Past > 92 days| DateError
    DateError --> SelectDate

    CheckDateValid -->|Valid| CheckDuplicate{Duplicate Entry?}
    CheckDuplicate -->|Yes| DupError[Duplicate Error]
    DupError --> SelectDate

    CheckDuplicate -->|No| SelectType[Select Attendance Type]
    SelectType --> TypeCheck{Type?}

    TypeCheck -->|PRESENT| EnterWorkDetails[Enter Start/End Time<br/>Break Hours<br/>Location<br/>Description]
    TypeCheck -->|PAID_LEAVE| CheckLeaveBalance{Has Leave Balance?}
    TypeCheck -->|ABSENT| SkipDetails[No Details Required]
    TypeCheck -->|LEGAL_HOLIDAY| SkipDetails

    CheckLeaveBalance -->|No| LeaveError[Insufficient Leave]
    LeaveError --> SelectType
    CheckLeaveBalance -->|Yes| SkipDetails

    EnterWorkDetails --> ValidateHours{Hours Valid?}
    ValidateHours -->|No| HoursError[Invalid Hours]
    HoursError --> EnterWorkDetails

    ValidateHours -->|Yes| SubmitRecord[Submit Record]
    SkipDetails --> SubmitRecord

    SubmitRecord --> SaveDB[(Save to Database)]
    SaveDB --> UpdateLeave{Paid Leave?}
    UpdateLeave -->|Yes| DeductLeave[Deduct from Allowance]
    UpdateLeave -->|No| Success
    DeductLeave --> Success[Success Message]
    Success --> End([Return to Dashboard])
```

### 3. Monthly Report Generation Flow (Sales/Admin)

```mermaid
flowchart TD
    Start([Sales Dashboard]) --> SelectEngineer[Select Engineer]
    SelectEngineer --> SelectMonth[Select Year & Month]
    SelectMonth --> ClickGenerate[Click Generate Report]

    ClickGenerate --> CheckAssignment{Assignment Exists?}
    CheckAssignment -->|No| NoAssignment[No Assignment Error]
    NoAssignment --> End([Return])

    CheckAssignment -->|Yes| CheckExisting{Report Already Exists?}
    CheckExisting -->|Yes & Approved| ReportExists[Report Already Approved]
    ReportExists --> End

    CheckExisting -->|Yes & Draft| OverwriteConfirm{Overwrite Draft?}
    OverwriteConfirm -->|No| End
    OverwriteConfirm -->|Yes| FetchData

    CheckExisting -->|No| FetchData[Fetch Attendance Records]
    FetchData --> CheckRecords{Has Attendance?}
    CheckRecords -->|No| NoData[No Attendance Data]
    NoData --> End

    CheckRecords -->|Yes| CalculateHours[Calculate Total Work Hours]
    CalculateHours --> GetProject[Get Project Details]
    GetProject --> CheckMethod{Settlement Method?}

    CheckMethod -->|UP_DOWN| CalcUpDown[Calculate UP_DOWN Settlement<br/>- Check Range<br/>- Calculate Excess/Shortage<br/>- Apply Rates]
    CheckMethod -->|FIXED| CalcFixed[Fixed Amount<br/>No Adjustments]

    CalcUpDown --> GeneratePDF[Generate PDF Report]
    CalcFixed --> GeneratePDF

    GeneratePDF --> SaveReport[(Save Report to DB)]
    SaveReport --> ShowReport[Display Report Preview]
    ShowReport --> Actions{Action?}

    Actions -->|Add Remarks| EditRemarks[Edit Remarks]
    EditRemarks --> UpdateReport[(Update Report)]
    UpdateReport --> ShowReport

    Actions -->|Submit| ChangeStatus[Status: SUBMITTED]
    Actions -->|Approve| ChangeStatus2[Status: APPROVED]
    Actions -->|Export Excel| ExportExcel[Download Excel File]
    Actions -->|Export PDF| ExportPDF[Download PDF File]

    ChangeStatus --> SaveStatus[(Update DB)]
    ChangeStatus2 --> SaveStatus
    SaveStatus --> Success([Report Saved])

    ExportExcel --> Success
    ExportPDF --> Success
```

### 4. Authentication Sequence (Frontend Interaction)

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant AuthController
    participant AuthService
    participant UserRepository
    participant Database
    participant JWT

    User->>Frontend: Enter email & password
    Frontend->>AuthController: POST /api/auth/login
    AuthController->>AuthService: login(email, password)
    AuthService->>UserRepository: findByEmail(email)
    UserRepository->>Database: SELECT * FROM users WHERE email=?
    Database-->>UserRepository: User data
    UserRepository-->>AuthService: User object

    AuthService->>AuthService: bcrypt.compare(password, hashedPassword)
    alt Invalid credentials
        AuthService-->>AuthController: Throw InvalidCredentialsError
        AuthController-->>Frontend: 401 Unauthorized
        Frontend-->>User: Show error message
    else Valid credentials
        AuthService->>AuthService: Check isActive
        alt User inactive
            AuthService-->>AuthController: Throw UserNotActiveError
            AuthController-->>Frontend: 403 Forbidden
        else User active
            AuthService->>JWT: generateToken(userId, email, role)
            JWT-->>AuthService: JWT token
            AuthService-->>AuthController: { user, token, isFirstLogin }
            AuthController-->>Frontend: 200 OK + token
            Frontend->>Frontend: Store token in localStorage
            Frontend-->>User: Redirect to dashboard
        end
    end
```

### 5. Attendance Submission Sequence (Frontend to Backend)

```mermaid
sequenceDiagram
    participant Engineer
    participant Frontend
    participant AuthMiddleware
    participant AttendanceController
    participant AttendanceService
    participant AttendanceRepo
    participant UserRepo
    participant AssignmentRepo
    participant Database
    participant Logger

    Engineer->>Frontend: Fill attendance form & submit
    Frontend->>AttendanceController: POST /api/attendance + JWT
    AttendanceController->>AuthMiddleware: Verify JWT
    AuthMiddleware->>AuthMiddleware: jwt.verify(token)
    AuthMiddleware-->>AttendanceController: User payload

    AttendanceController->>AttendanceService: createAttendance(data, userId)
    AttendanceService->>AssignmentRepo: findById(assignmentId)
    AssignmentRepo->>Database: SELECT with project details
    Database-->>AssignmentRepo: Assignment + Project
    AssignmentRepo-->>AttendanceService: Assignment object

    AttendanceService->>AttendanceService: Validate date range
    AttendanceService->>AttendanceRepo: findExisting(assignmentId, date)
    AttendanceRepo->>Database: Check duplicate
    Database-->>AttendanceRepo: null (no duplicate)

    alt Attendance type is PAID_LEAVE
        AttendanceService->>UserRepo: findById(engineerId)
        UserRepo->>Database: Get user
        Database-->>UserRepo: User with leave balance
        AttendanceService->>AttendanceService: Check leave balance
        alt Insufficient leave
            AttendanceService-->>AttendanceController: Throw InsufficientLeaveError
            AttendanceController-->>Frontend: 400 Bad Request
        end
    end

    AttendanceService->>AttendanceService: Calculate work hours
    AttendanceService->>AttendanceRepo: create(attendanceData)
    AttendanceRepo->>Database: INSERT INTO attendance_records
    Database-->>AttendanceRepo: Created record

    alt PAID_LEAVE
        AttendanceService->>UserRepo: incrementPaidLeaveUsed(userId)
        UserRepo->>Database: UPDATE users SET paidLeaveUsedThisYear++
    end

    AttendanceService->>Logger: Log attendance submission
    Logger->>Logger: Write to logs/attendance-service-combined.log

    AttendanceService-->>AttendanceController: Success + attendance object
    AttendanceController-->>Frontend: 201 Created
    Frontend-->>Engineer: Show success message
```

### 6. Slack Integration Flow

```mermaid
flowchart TD
    Start([Engineer in Slack]) --> Command{Slash Command?}

    Command -->|/log-work| OpenModal[Open Work Log Modal]
    Command -->|/edit-attendance| EditModal[Open Edit Modal]
    Command -->|/my-attendance| ViewSummary[Show Attendance Summary]

    OpenModal --> ShowProjects[Load Active Projects]
    ShowProjects --> FillForm[Fill Attendance Form<br/>- Select Project<br/>- Select Date<br/>- Enter Times]
    FillForm --> SubmitModal[Submit Modal]

    SubmitModal --> VerifySignature{Valid Slack Signature?}
    VerifySignature -->|No| Unauthorized[Unauthorized Error]
    VerifySignature -->|Yes| FindUser[Find User by Slack ID]

    FindUser --> UserExists{User Found?}
    UserExists -->|No| LinkAccount[Prompt to Link Account]
    UserExists -->|Yes| ValidateData{Data Valid?}

    ValidateData -->|No| ValidationError[Show Validation Error]
    ValidateData -->|Yes| SaveAttendance[(Save to Database)]

    SaveAttendance --> SendConfirm[Send Confirmation Message]
    SendConfirm --> End([Done])

    EditModal --> SelectDate2[Select Date to Edit]
    SelectDate2 --> LoadExisting[Load Existing Record]
    LoadExisting --> ModifyData[Modify Fields]
    ModifyData --> UpdateRecord[(Update Database)]
    UpdateRecord --> SendConfirm

    ViewSummary --> FetchRecords[Fetch User's Records]
    FetchRecords --> FormatMessage[Format Summary Message]
    FormatMessage --> SendMessage[Send to Slack]
    SendMessage --> End

    LinkAccount --> ProvideEmail[User Enters Email]
    ProvideEmail --> VerifyEmail{Email Exists?}
    VerifyEmail -->|No| EmailError[Email Not Found]
    VerifyEmail -->|Yes| LinkSlackID[Link Slack ID to User]
    LinkSlackID --> SendConfirm
```

### 7. AI Chatbot Query Flow

```mermaid
flowchart TD
    Start([User Asks Question]) --> ReceiveQuery[Receive Natural Language Query]
    ReceiveQuery --> AuthCheck{Authenticated?}
    AuthCheck -->|No| Unauthorized[Unauthorized Error]
    AuthCheck -->|Yes| ParseQuery[Send to Gemini AI]

    ParseQuery --> ExtractIntent[Extract Intent & Parameters]
    ExtractIntent --> QuestionType{Question Type?}

    QuestionType -->|Attendance Summary| GetAttendance[Query Attendance Records]
    QuestionType -->|Project Info| GetProjects[Query Projects]
    QuestionType -->|Hours Calculation| GetHours[Calculate Total Hours]
    QuestionType -->|Leave Balance| GetLeave[Query Leave Balance]
    QuestionType -->|Report Status| GetReports[Query Reports]
    QuestionType -->|Coaching| ProvideCoaching[Analyze Patterns<br/>Give Suggestions]

    GetAttendance --> FormatResponse[Format AI Response]
    GetProjects --> FormatResponse
    GetHours --> FormatResponse
    GetLeave --> FormatResponse
    GetReports --> FormatResponse
    ProvideCoaching --> FormatResponse

    FormatResponse --> CheckTimeout{Response Time?}
    CheckTimeout -->|> 25s| TimeoutError[Timeout - Retry]
    CheckTimeout -->|< 25s| SendResponse[Send Response to User]

    TimeoutError --> RetryCheck{Retry Count?}
    RetryCheck -->|< 3| ParseQuery
    RetryCheck -->|>= 3| FinalError[Show Error Message]

    SendResponse --> End([Done])
    FinalError --> End
```

---

## Troubleshooting & Common Issues

### CORS / API Calls Failing

**Problem:** API requests return CORS errors or connection refused

**Solution:**

1. Check `NEXT_PUBLIC_API_URL` is correct
2. Verify backend `CORS_ORIGIN` includes your frontend URL
3. Ensure backend is running and accessible

### Authentication 401 Errors

**Problem:** API calls return 401 Unauthorized

**Solution:**

1. Verify token is stored correctly (check localStorage/cookies)
2. Ensure axios includes `Authorization` header
3. Check token hasn't expired
4. Verify JWT_SECRET matches between frontend and backend

### Missing i18n Keys

**Problem:** Translation keys showing as `[missing translation]`

**Solution:**

1. Confirm `public/locales/{en,ja}` namespace files exist
2. Check translation key matches in code
3. Restart development server after adding new translations

### Duplicate Attendance Errors

**Problem:** Frontend shows duplicate attendance submission errors

**Solution:**

1. Frontend should handle backend `DUPLICATE_ATTENDANCE` error code
2. Show user-friendly message with option to edit existing record
3. Prevent form submission while request is pending

### Build Failures

**Problem:** `npm run build` fails

**Solution:**

```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run build
```

### Environment Variables Not Loading

**Problem:** `process.env.NEXT_PUBLIC_*` returns undefined

**Solution:**

1. Ensure variables are prefixed with `NEXT_PUBLIC_`
2. Restart development server after changing `.env.local`
3. Check `.env.local` is in project root (not `/src`)

---

## Contributing & License

### Contributing Guidelines

1. Follow the repo's lint/format rules
2. Run checks before PR:
   ```bash
   npm run lint
   npm run format
   ```
3. Add tests for major UI flows (login, attendance submit, report preview)
4. Update documentation for new features

### Code Style

- Use functional components with hooks
- Follow Chakra UI component patterns
- Keep components small and reusable
- Use TypeScript for type safety (recommended)

### Pull Request Process

1. Create feature branch from `main`
2. Make changes and test locally
3. Commit with clear messages
4. Push and create PR with description
5. Wait for review and CI checks

### License

## Add `LICENSE` file in repo root (e.g., MIT).

## Additional Resources

### Related Documentation

- **Backend README:** For API documentation and server-side details
- **Backend API Docs:** Canonical API contract and endpoints

### External Documentation

- **Next.js:** https://nextjs.org/docs
- **React:** https://react.dev
- **Chakra UI:** https://chakra-ui.com
- **next-i18next:** https://github.com/i18next/next-i18next
- **Axios:** https://axios-http.com

### Support

For questions or issues:

1. Check this README
2. Review component documentation
3. Check existing issues in repository
4. Create new issue with detailed description

---

---

**Last Updated:** October 30, 2025  
**Version:** 1.0.0  
**Node.js Version:** 16+  
**Framework:** Next.js (App Router)
