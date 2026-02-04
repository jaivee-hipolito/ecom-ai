# MongoDB Setup Guide

## Issue Fixed
The `.env.local` file had a placeholder MongoDB connection string. It's now updated to use the correct format.

## MongoDB Connection String Format

The connection string should follow one of these formats:

### Local MongoDB
```
MONGODB_URI=mongodb://localhost:27017/teezee
```

### MongoDB Atlas (Cloud)
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/teezee?retryWrites=true&w=majority
```

## Setup Options

### Option 1: Local MongoDB (Recommended for Development)

1. **Install MongoDB locally:**
   - Windows: Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - Or use MongoDB via Docker:
     ```bash
     docker run -d -p 27017:27017 --name mongodb mongo
     ```

2. **Start MongoDB:**
   - Windows: MongoDB should start automatically as a service
   - Or manually: `mongod` in terminal

3. **Verify connection:**
   - The connection string `mongodb://localhost:27017/teezee` should work
   - Database `teezee` will be created automatically on first use

### Option 2: MongoDB Atlas (Cloud - Free Tier Available)

1. **Create account:** Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

2. **Create a cluster:** Follow the setup wizard

3. **Get connection string:**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password
   - Replace `<dbname>` with `teezee`

4. **Update `.env.local`:**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/teezee?retryWrites=true&w=majority
   ```

## Current Configuration

Your `.env.local` is now set to:
```
MONGODB_URI=mongodb://localhost:27017/teezee
```

## Next Steps

1. **Make sure MongoDB is running:**
   - If using local MongoDB, ensure the service is running
   - If using MongoDB Atlas, ensure your IP is whitelisted

2. **Restart your Next.js dev server:**
   ```bash
   npm run dev
   ```

3. **Test registration:**
   - Visit `http://localhost:3000/register`
   - Try creating an account

## Troubleshooting

### Error: "Invalid scheme"
- Make sure the connection string starts with `mongodb://` or `mongodb+srv://`
- Check for any extra spaces or characters

### Error: "ECONNREFUSED"
- MongoDB is not running
- Check if MongoDB service is started
- Verify the port (default: 27017)

### Error: "Authentication failed"
- Check MongoDB username/password
- For Atlas, ensure IP is whitelisted
- Verify database user has correct permissions

