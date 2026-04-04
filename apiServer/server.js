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
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

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

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
  throw err;
});
setupCronJobs();
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
