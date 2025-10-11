# Frontend Setup Guide

Prerequisites

- **Before you begin, ensure you have the following installed:**
- **Node.js (version 18 or higher)**
- **npm (comes with Node.js)**

---

## Quick Setup

- **Clone the Repository**

```bash
git clone https://github.com/atf-inc/fall25_intern_a_sales_frontend
cd folder-name
```

- **Environment Setup:** Create a .env.local file in the frontend directory:\*\*

```bash
cp .env.example .env.local
```

- Or create it manually with the following content:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_NAME="Attendance Management System"
```

- **Start Development Server**

```bash
npm run dev
```
