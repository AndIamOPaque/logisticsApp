import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

import employeeRoutes from './routes/employee.route.js';
import productRoutes from './routes/product.route.js';
import rawMaterialRoutes from './routes/rawMaterial.route.js';
import stockSnapRoutes from './routes/stockSnap.route.js';
import locationRoutes from './routes/location.route.js';
import productionLogRoutes from './routes/productionLog.route.js';
import billRoutes from './routes/bill.route.js';
import partyRoutes from './routes/party.route.js';
// import attendanceRoutes from './routes/attendance.js';

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

// Routes
app.use('/api/employee', employeeRoutes);
app.use('/api/product', productRoutes);
app.use('/api/raw-material', rawMaterialRoutes);
app.use('/api/stock-snap', stockSnapRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/production-log', productionLogRoutes);
app.use('/api/bill', billRoutes);
app.use('/api/party', partyRoutes);
// app.use('/api/attendance', attendanceRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
