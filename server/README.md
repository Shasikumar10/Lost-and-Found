# KLH Lost and Found - Backend

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the server directory and add:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
SESSION_SECRET=your_session_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLIENT_URL=http://localhost:3000
ALLOWED_EMAIL_DOMAIN=klh.edu.in
```

### 3. Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
6. Copy Client ID and Client Secret to `.env`

### 4. Cloudinary Setup
1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Get your Cloud Name, API Key, and API Secret from dashboard
3. Add to `.env` file

### 5. MongoDB Setup
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string and add to `.env`

### 6. Run Development Server
```bash
npm run dev
```

## API Endpoints

### Authentication
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user
- `PUT /api/auth/profile` - Update profile

### Items
- `GET /api/items` - Get all items (with filters)
- `GET /api/items/:id` - Get single item
- `POST /api/items` - Create item (protected)
- `GET /api/items/my/items` - Get user's items (protected)
- `PUT /api/items/:id` - Update item (protected)
- `DELETE /api/items/:id` - Delete item (protected)

### Claims
- `POST /api/claims` - Create claim (protected)
- `GET /api/claims/item/:itemId` - Get claims for item (protected)
- `GET /api/claims/my` - Get user's claims (protected)
- `PUT /api/claims/:id/status` - Update claim status (protected)
- `DELETE /api/claims/:id` - Delete claim (protected)

### Admin
- `GET /api/admin/stats` - Get dashboard stats (admin)
- `GET /api/admin/users` - Get all users (admin)
- `PUT /api/admin/users/:id/role` - Update user role (admin)
- `PUT /api/admin/users/:id/toggle-status` - Toggle user status (admin)
- `GET /api/admin/claims` - Get all claims (admin)
- `PUT /api/admin/claims/:id/dispute` - Mark claim as disputed (admin)
- `DELETE /api/admin/items/:id` - Delete item (admin)