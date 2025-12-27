import Delivery from "../models/delivery.model.js";
import { createDelivery, updateDeliveryStatus, queryDeliveries } from "../services/delivery.services.js";

export const createNewDelivery = async (req, res, next) => {
  try {
    const userId = req.user._id; 
    const deliveryData = req.body; 
    const newDelivery = await createDelivery(deliveryData, userId);
    res.status(201).json(newDelivery);
  } catch (err) {
    next(err);
  }
};

export const changeDeliveryStatus = async (req, res, next) => {
  try {
    const userId = req.user._id; 
    const deliveryId = req.params.id;
    const { newStatus } = req.body;
    const updatedDelivery = await updateDeliveryStatus(deliveryId, newStatus, userId);
    res.json(updatedDelivery);
  } catch (err) {   
    next(err);
  }
};

export const getDeliveryById = async (req, res, next) => {
  try {
    const delivery = await Delivery.findById(req.params.id)
        .populate("buyerId supplierId locationId vehicleId driverId billIds createdBy updatedBy");
    if (!delivery) {
      return res.status(404).json({ message: "Delivery not found" });
    }
    res.json(delivery);
    } catch (err) {
        next(err);
    }
};

export const getDeliveries = async (req, res, next) => {
  try {
    const filters = {
      locationId: req.query.locationId,
      status: req.query.status,
      direction: req.query.direction, 
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      partyId: req.query.partyId 
    };

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await queryDeliveries(filters, page, limit);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};