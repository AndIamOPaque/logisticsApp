import { getLowStockAlerts } from '../services/inventory.service.js';

export const lowStockAlerts = async (req, res, next) => {
  try {
    const alerts = await getLowStockAlerts();
    res.status(200).json({ success: true, data: alerts });
  } catch (error) {
    next(error);
  }
};
