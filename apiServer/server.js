import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import assetRoutes from './routes/asset.route.js';
import setupCronJobs from './scheduler.js';
import employeeRoutes from './routes/employee.route.js';
import productRoutes from './routes/product.route.js';
import rawMaterialRoutes from './routes/rawMaterial.route.js';
import locationRoutes from './routes/location.route.js';
import billRoutes from './routes/bill.route.js';
import partyRoutes from './routes/party.route.js';
import attendanceRoutes from './routes/attendance.route.js';
import userRoutes from './routes/user.route.js';
import deliveryRoutes from './routes/delivery.route.js';
import productionRoutes from './routes/production.route.js'
import dashboardRoutes from './routes/dashboard.route.js'
import uploadRoutes from './routes/upload.route.js';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const swaggerDocument = JSON.parse(
  fs.readFileSync('./swagger-output.json', 'utf-8')
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// DEV MODE: Fake Auth Middleware
app.use((req, res, next) => {
  req.user = { _id: "6641a2b3c4d5e6f700000000", name: "Admin", role: "admin" };
  if (req.method === 'POST') {
    if (!req.body) req.body = {};
    req.body.createdBy = req.user._id;
  }
  next();
});

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/user', userRoutes);
app.use('/api/asset', assetRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/product', productRoutes);
app.use('/api/production-order', productionRoutes);
app.use('/api/raw-material', rawMaterialRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/bill', billRoutes);
app.use('/api/party', partyRoutes);
app.use('/api/attendance', attendanceRoutes); 
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/upload', uploadRoutes);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(`[ERROR] ${req.method} ${req.url} →`, err.message);
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

setupCronJobs();
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
