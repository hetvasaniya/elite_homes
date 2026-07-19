# EliteEstate — MERN Stack Property Marketplace

A full-stack, dual-ecosystem property marketplace built with **MongoDB, Express, React, Node.js**, and **Tailwind CSS**.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+
- **MongoDB** (local or Atlas)
- **npm** v9+

---

### 1. Backend Setup

```bash
cd server
npm install
```

Edit `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/eliteestate
JWT_SECRET=your_super_secret_jwt_key
```

Start the backend:
```bash
npm run dev
```
Server runs at **http://localhost:5000**

---

### 2. Frontend Setup

```bash
cd client
npm install
npm run dev
```
Frontend runs at **http://localhost:5173**

---

## 🏗️ Architecture

```
eliteEstate/
├── server/              # Node.js + Express Backend
│   ├── models/          # Mongoose schemas
│   ├── controllers/     # Business logic
│   ├── routes/          # API endpoints
│   ├── middleware/       # JWT auth + role guards
│   ├── uploads/         # Multer file storage
│   └── index.js         # App entry point
│
└── client/              # Vite + React Frontend
    └── src/
        ├── context/     # Auth state (React Context)
        ├── hooks/       # Axios API instance
        ├── components/  # Reusable UI components
        └── pages/       # Route-mapped pages
            └── admin/   # Isolated admin workspace
```

---

## 📡 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | — | Register new user |
| POST | /api/auth/login | — | Login, get JWT |
| GET | /api/user/profile | ✅ | Get profile |
| PUT | /api/user/profile | ✅ | Update profile |
| POST | /api/user/save/:id | ✅ | Toggle save property |
| GET | /api/user/saved | ✅ | Get saved properties |
| GET | /api/properties | — | List all (with filters) |
| GET | /api/properties/my | ✅ | My listings |
| POST | /api/properties | ✅ | Create listing (+ images) |
| PUT | /api/properties/:id | ✅ | Update listing |
| DELETE | /api/properties/:id | ✅ | Delete listing |
| POST | /api/messages | ✅ | Send inquiry |
| GET | /api/messages/owner | ✅ | Get received inquiries |
| POST | /api/contact | — | Submit contact form |
| GET | /api/admin/stats | 🛡️ | System metrics |
| GET | /api/admin/users | 🛡️ | All users |
| PUT | /api/admin/users/:id/status | 🛡️ | Toggle user activation |
| GET | /api/admin/messages | 🛡️ | Contact form inbox |
| POST | /api/admin/create-admin | 🛡️ | Create admin account |
| POST | /api/admin/upload-document | 🛡️ | Upload PDF |
| GET | /api/admin/documents | 🛡️ | List documents |
| DELETE | /api/admin/documents/:id | 🛡️ | Delete document |

Legend: ✅ = Auth required | 🛡️ = Admin only

---

## 🎨 Design System

- **Background**: Deep navy (`#030820`)
- **Accent**: Warm gold (`#D4AF37`)
- **Typography**: Playfair Display (headings) + Inter (body)
- **Style**: Glassmorphism cards, backdrop-blur, gold glow shadows

---

## 🔐 Creating Your First Admin

After seeding your first user, run this in MongoDB shell:
```js
db.users.updateOne({ email: "your@email.com" }, { $set: { role: "admin" } })
```

Or use the `POST /api/admin/create-admin` endpoint from an existing admin account.
