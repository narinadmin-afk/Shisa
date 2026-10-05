# Enterprise Chat Starter

ระบบแชทสำหรับองค์กร รองรับ ไทย / English / 中文

## Stack
- Frontend: React + Vite
- Styling: Tailwind CSS
- Backend: Node.js + Express
- Realtime: Socket.IO
- Database: PostgreSQL
- Auth: JWT (starter)
- Translation: Provider interface พร้อม mock translation สำหรับพัฒนา

## Requirements
- Node.js 20+
- PostgreSQL 15+

## Run

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:4000

## Database
สร้าง database ชื่อ `enterprise_chat` แล้วรัน:
```bash
psql -U postgres -d enterprise_chat -f backend/sql/schema.sql
```

จากนั้นตั้งค่า DATABASE_URL ใน backend/.env

## หมายเหตุ
ระบบแปลภาษาใน starter นี้เป็น mock provider เพื่อให้โปรเจกต์รันได้โดยไม่ต้องมี API key
สามารถเปลี่ยนไปใช้ OpenAI หรือบริการแปลอื่นได้ใน `backend/src/services/translation.js`
