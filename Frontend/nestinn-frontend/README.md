# NestInn – Frontend

**Angular 17** frontend for the NestInn property rental platform.

## Folder Location
Place this folder at: `D:\NestInn\Frontend`

## Requirements
- Node.js v18+
- Angular CLI v17: `npm install -g @angular/cli@17`

## Setup Steps

### 1. Open in VS Code
Right-click the `Frontend` folder → "Open with Code"

### 2. Open Terminal in VS Code (Ctrl + `)
```bash
npm install
```

### 3. Configure API URL
Open: `src/environments/environment.ts`
Change the API URL to match your .NET backend port:
```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',      // ← change port if needed
  signalRUrl: 'http://localhost:5000/hubs/chat'
};
```

### 4. Run the Frontend
```bash
ng serve
```
Opens at: http://localhost:4200

---

## Backend Connection (Visual Studio)

In your .NET `Program.cs`, add CORS **before** `app.UseRouting()`:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("NestInnPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});
```

Then after `app.UseRouting()`:
```csharp
app.UseCors("NestInnPolicy");
```

Run backend from Visual Studio → then run frontend with `ng serve`.

---

## Project Structure
```
Frontend/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── guards/       ← Auth, Owner, CEO guards
│   │   │   ├── interceptors/ ← HTTP interceptor
│   │   │   ├── models/       ← TypeScript interfaces
│   │   │   └── services/     ← All API services
│   │   ├── features/
│   │   │   ├── auth/         ← Login, Register, OTP
│   │   │   ├── home/         ← Home page
│   │   │   ├── properties/   ← List + Detail
│   │   │   ├── booking/      ← Form + My Bookings
│   │   │   ├── owner/        ← Dashboard, Properties, Add
│   │   │   ├── ceo/          ← CEO Dashboard
│   │   │   ├── chat/         ← Real-time messaging
│   │   │   └── profile/      ← User profile
│   │   └── shared/
│   │       └── components/   ← Navbar, Footer, Toast, Card
│   ├── environments/
│   │   └── environment.ts    ← API URL config ← EDIT THIS
│   └── styles.scss           ← Global NestInn teal theme
├── angular.json
├── package.json
└── tsconfig.json
```

## CEO Login
No registration for CEO. Add this directly in your SQL Server:
```sql
-- Run in SSMS after creating the DB
INSERT INTO Users (FullName, Email, Phone, PasswordHash, Role, IsVerified, CreatedAt)
VALUES ('NestInn CEO', 'ceo@nestinn.com', '0000000000', '<bcrypt_hash_of_password>', 'CEO', 1, GETDATE())
```
Or create a seed endpoint in your backend to generate the CEO user.
