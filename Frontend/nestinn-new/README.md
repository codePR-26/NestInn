# NestInn — New Frontend (nestinn-new)

Redesigned Angular 17 frontend — Netflix dark theme + Angular Material.
Your **original Frontend folder is untouched**. This is a brand new separate folder.

---

## 📁 Folder Structure

```
D:\NestInn\
├── Frontend\          ← YOUR OLD FRONTEND (untouched, runs on port 4200)
└── nestinn-new\       ← THIS NEW FRONTEND (runs on port 4201)
    ├── src\
    │   ├── app\
    │   │   ├── core\
    │   │   │   ├── guards\        ← auth, owner, ceo, guest guards
    │   │   │   ├── interceptors\  ← HTTP interceptor (withCredentials)
    │   │   │   ├── models\        ← TypeScript interfaces
    │   │   │   └── services\      ← All API services + ThemeService
    │   │   ├── features\
    │   │   │   ├── auth\          ← Login, Register, Verify OTP
    │   │   │   ├── home\          ← Netflix-style homepage
    │   │   │   ├── properties\    ← Property list + detail
    │   │   │   ├── booking\       ← Booking form (stepper) + My bookings
    │   │   │   ├── owner\         ← Dashboard, Properties, Add Property
    │   │   │   ├── ceo\           ← CEO Dashboard (5 tabs)
    │   │   │   ├── chat\          ← Real-time chat
    │   │   │   └── profile\       ← User profile
    │   │   └── shared\
    │   │       └── components\
    │   │           ├── navbar\    ← Top navbar with dark/light toggle
    │   │           ├── footer\    ← 4-col footer
    │   │           ├── loader\    ← Animated bounce loader on startup
    │   │           └── toast\     ← Notification toasts
    │   ├── environments\
    │   └── styles.scss            ← Global dark/light theme vars
    ├── package.json
    ├── angular.json
    ├── start.bat                  ← Double-click to install & run
    └── README.md
```

---

## 🚀 Setup Steps

### Option A — Double-click (Windows)
1. Extract `nestinn-new.zip` to `D:\NestInn\nestinn-new\`
2. Double-click `start.bat`
3. Opens at **http://localhost:4201**

### Option B — VS Code terminal
```bash
# 1. Open this folder in VS Code
cd D:\NestInn\nestinn-new

# 2. Install packages (one time only)
npm install

# 3. Run on port 4201 (so old frontend still works on 4200)
ng serve --port 4201
```

---

## 🔗 Backend Connection

- **API URL:** `http://localhost:5103/api`
- **Auth:** JWT via HttpOnly cookie (`nestinn_token`)
- **CORS:** Already configured in your backend for `http://localhost:4200`

> ⚠️ **Add port 4201 to your backend CORS policy:**
> In your `Program.cs`, update the CORS origins:
> ```csharp
> policy.WithOrigins(
>     "http://localhost:4200",
>     "http://localhost:4201"   // ← ADD THIS
> )
> ```

---

## ✨ New Features

| Feature | Description |
|---------|-------------|
| 🌙 Dark / Light Mode | Toggle in navbar. Saved to localStorage. |
| 🎬 Netflix-style UI | Horizontal scrolling property rows, billboard hero |
| ✨ Startup Loader | Bouncing dots animation with NestInn logo |
| 🎨 Angular Material | mat-button, mat-form-field, mat-table, mat-tabs, mat-stepper, mat-chips, mat-menu, mat-snackbar |
| 📱 Responsive | Mobile-friendly navbar with hamburger menu |
| 🦶 Full Footer | 4-column footer with all important links |
| 🔗 All Routes | Every page and link is fully functional |

## 🎨 Design

- **Dark Mode:** Netflix-inspired `#141414` base, teal `#4ecdc4` accents
- **Light Mode:** Clean white/teal theme
- **Fonts:** `Playfair Display` (headings) + `DM Sans` (UI)

---

## 📋 All Routes

| Route | Access |
|-------|--------|
| `/` | Public |
| `/properties` | Public |
| `/properties/:id` | Public |
| `/auth/login` | Guest only |
| `/auth/register` | Guest only |
| `/auth/verify-otp` | Public |
| `/booking/new` | Renter only |
| `/bookings` | Logged in |
| `/owner/dashboard` | Owner only |
| `/owner/properties` | Owner only |
| `/owner/add-property` | Owner only |
| `/ceo/dashboard` | CEO only |
| `/chat/:bookingId` | Logged in |
| `/profile` | Logged in |

---

## 🐛 Troubleshooting

**`ng: command not found`**
```bash
npm install -g @angular/cli@17
```

**CORS error**
Add `http://localhost:4201` to your backend CORS origins (see above).

**Module not found errors**
```bash
npm install
```
