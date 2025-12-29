//Make it responsive for mobile devices by fixing the header-content and header-actions
//learn backend to make an actual working database
//Scrollbar on item viewer must be removed (find the name in CSS)

cd "root files"
npm run dev


# Lost & Found Backend API

A complete Node.js + Express + PostgreSQL backend for the University Lost & Found System.

## 📋 Features

- ✅ User Authentication (Register, Login, JWT)
- ✅ CRUD operations for Lost/Found items
- ✅ Comments system
- ✅ Image upload
- ✅ Advanced filtering and search
- ✅ Protected routes
- ✅ Input validation
- ✅ Security best practices

## 🛠️ Tech Stack

- **Node.js** - Runtime environment
- **Express** - Web framework
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload

## 📁 Project Structure

```
lost-and-found-backend/
├── config/
│   └── database.js          # Database connection
├── middleware/
│   └── auth.js              # Authentication middleware
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── items.js             # Items routes
│   ├── comments.js          # Comments routes
│   └── upload.js            # File upload routes
├── uploads/                 # Uploaded images (created automatically)
├── .env                     # Environment variables
├── server.js                # Main server file
├── database.sql             # Database schema
├── package.json             # Dependencies
└── README.md                # This file
```

## 🚀 Getting Started

### Prerequisites

1. **Node.js** (v14 or higher)
   - Download: https://nodejs.org/

2. **PostgreSQL** (v12 or higher)
   - Download: https://www.postgresql.org/download/

### Installation Steps

#### 1. Install Dependencies

```bash
npm install
```

#### 2. Setup PostgreSQL Database

Open PostgreSQL command line (psql) or use pgAdmin:

```bash
# Login to PostgreSQL
psql -U postgres

# Run the database.sql file
\i /path/to/database.sql
```

Or manually run the SQL commands from `database.sql`.

#### 3. Configure Environment Variables

Copy `.env` and update with your settings:

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lost_and_found
DB_USER=postgres
DB_PASSWORD=your_actual_password

# JWT Secret (generate a random string!)
JWT_SECRET=your_super_secret_key_here

# Server
PORT=5000
```

**⚠️ IMPORTANT:** Change `JWT_SECRET` to a random, secure string in production!

#### 4. Start the Server

Development mode (with auto-restart):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

You should see:
```
🚀 Server running on port 5000
✅ Connected to PostgreSQL database
```

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes |

### Items

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/items` | Get all items (with filters) | No |
| GET | `/api/items/:id` | Get single item | No |
| POST | `/api/items` | Create new item | Yes |
| PUT | `/api/items/:id` | Update item | Yes (owner) |
| DELETE | `/api/items/:id` | Delete item | Yes (owner) |
| PATCH | `/api/items/:id/claim` | Mark as claimed | Yes |
| PATCH | `/api/items/:id/reactivate` | Reactivate item | Yes (owner) |

### Comments

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/comments/:itemId` | Get item comments | No |
| POST | `/api/comments/:itemId` | Add comment | Yes |
| DELETE | `/api/comments/:commentId` | Delete comment | Yes (owner) |

### Upload

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/upload` | Upload image | Yes |
| DELETE | `/api/upload/:filename` | Delete image | Yes |

## 🔐 Authentication

This API uses JWT (JSON Web Tokens) for authentication.

### How to Authenticate:

1. **Register or Login** to get a token
2. **Include the token** in requests:

```javascript
headers: {
  'Authorization': 'Bearer YOUR_TOKEN_HERE'
}
```

### Example: Register

```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "studentId": "2024-12345",
  "username": "john_doe",
  "email": "john@university.edu",
  "password": "password123",
  "fullName": "John Doe",
  "phone": "555-1234"
}
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "studentId": "2024-12345",
    "username": "john_doe",
    "email": "john@university.edu",
    "fullName": "John Doe"
  }
}
```

### Example: Login

```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "identifier": "john_doe",  // Can be studentId, username, or email
  "password": "password123"
}
```

## 📝 API Examples

### Get All Lost Items

```bash
GET http://localhost:5000/api/items?type=lost&status=active&sort=newest
```

### Create New Item

```bash
POST http://localhost:5000/api/items
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "title": "Black Wallet",
  "description": "Black leather wallet with ID",
  "category": "Personal Items",
  "location": "Library 3rd Floor",
  "dateLostFound": "2024-12-20",
  "itemType": "lost",
  "contactEmail": "john@university.edu",
  "emoji": "🎒"
}
```

### Add Comment

```bash
POST http://localhost:5000/api/comments/1
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "text": "I think I saw this yesterday!"
}
```

### Upload Image

```bash
POST http://localhost:5000/api/upload
Authorization: Bearer YOUR_TOKEN
Content-Type: multipart/form-data

[Include image file with key "image"]
```

## 🔍 Query Parameters for GET /api/items

- `type` - Filter by item type: `lost` or `found`
- `status` - Filter by status: `active`, `claimed`, `archived`
- `category` - Filter by category (e.g., `Electronics`)
- `search` - Search in title, description, location
- `sort` - Sort order: `newest` or `oldest`
- `limit` - Number of results (default: 50)
- `offset` - Pagination offset (default: 0)

Example:
```
GET /api/items?type=lost&category=Electronics&search=iphone&sort=newest&limit=20
```

## 🧪 Testing

You can test the API using:
- **Postman** - Import endpoints and test
- **Thunder Client** (VS Code extension)
- **cURL** command line
- Your frontend application

### Test User Credentials

The database comes with 3 demo users (password: `password123`):
- Student ID: `2021-12345` / Username: `john_doe`
- Student ID: `2021-67890` / Username: `jane_smith`
- Student ID: `2022-11111` / Username: `mike_wilson`

## 🔒 Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Input validation
- ✅ SQL injection protection (parameterized queries)
- ✅ CORS protection
- ✅ File type validation
- ✅ File size limits

## 📊 Database Schema

### users
- id, student_id, username, email, password, full_name, phone, created_at

### items
- id, user_id, title, description, category, location, date_lost_found, item_type, status, contact_email, contact_phone, image_url, emoji, created_at

### comments
- id, item_id, user_id, text, created_at

## 🚨 Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution:** Make sure PostgreSQL is running:
```bash
# Windows
net start postgresql

# Mac/Linux
sudo systemctl start postgresql
```

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:** Change PORT in `.env` or kill the process using port 5000.

### Module Not Found
```
Error: Cannot find module 'express'
```
**Solution:** Run `npm install` to install all dependencies.

## 📦 Deployment

### Heroku Deployment

1. Create a Heroku app
2. Add PostgreSQL addon
3. Set environment variables
4. Deploy:

```bash
git init
heroku create your-app-name
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
```

### Environment Variables for Production

Make sure to set these on your hosting platform:
- `NODE_ENV=production`
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET` (use a strong random string!)
- `CLIENT_URL` (your frontend URL)

## 🤝 Contributing

This is a university project. Feel free to fork and modify for your needs!

## 📄 License

MIT License - Feel free to use for your university project.

## 🆘 Support

If you encounter issues:
1. Check the console for error messages
2. Verify database connection
3. Check `.env` configuration
4. Make sure all dependencies are installed

## 🎓 Next Steps

1. Connect this backend to your HTML frontend
2. Add email notifications
3. Integrate with university authentication system
4. Add analytics dashboard
5. Deploy to production server

Happy coding! 🚀