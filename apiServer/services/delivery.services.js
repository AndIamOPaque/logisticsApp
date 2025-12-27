import mongoose from "mongoose";
import Delivery from "../models/delivery.model.js";
import Product from "../models/product.model.js";
import RawMaterial from "../models/rawMaterial.model.js";
import Stock from "../models/stock.model.js";
import { moveInventory } from "./inventory.service.js";

export const updateDeliveryStatus = async (deliveryId, newStatus, userId) => { 
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const delivery = await Delivery.findById(deliveryId).session(session);
    if (!delivery) throw new Error("Delivery not found");

    if (!delivery.locationId) {
        throw new Error("Critical Data Error: Delivery record is missing locationId.");
    }

    if (delivery.status === 'delivered' || delivery.status === 'cancelled') {
        throw new Error(`Delivery is already ${delivery.status}`);
    }

    if (delivery.direction === 'out' && newStatus === 'in-transit') {
        await processStockMovement(delivery, -1, userId, session); 
    }
    
    else if (delivery.direction === 'in' && newStatus === 'delivered') {
        await processStockMovement(delivery, 1, userId, session); 
    }

    delivery.status = newStatus;
    if (newStatus === 'in-transit') delivery.departureTime = new Date();
    if (newStatus === 'delivered') delivery.arrivalTime = new Date();
    delivery.updatedBy = userId;
    
    await delivery.save({ session });
    await session.commitTransaction();
    
    return delivery;

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const processStockMovement = async (delivery, multiplier, userId, session) => {
    for (const item of delivery.content) {
        await moveInventory({
            item: item.itemId,
            itemModel: item.itemType, 
            quantity: item.quantity * multiplier, 
            location: delivery.locationId, 
            purpose: delivery.direction === 'in' ? 'intake' : 'sale',
            referenceId: delivery._id,    
            referenceModel: 'Delivery',   
            userId,
            session
        });
    }
};

export const createDelivery = async (deliveryData, userId) => {
    
    const session = await mongoose.startSession();
    session.startTransaction();
  
    try {
      if (deliveryData.content.length === 0) {
        throw new Error("Delivery must contain at least one item.");
      }
      
      for (const item of deliveryData.content) {
        const Model = item.itemType === 'Product' ? Product : RawMaterial;
        const validItem = await Model.findById(item.itemId).session(session);
        if (!validItem) {
          throw new Error(`Item not found: ${item.itemId} (${item.itemType})`);
        }
  
        if (deliveryData.direction === 'out') {
          const stock = await Stock.findOne({
            item: item.itemId,
            location: deliveryData.locationId 
          }).session(session);
  
          const currentQty = stock ? stock.quantity : 0;
          if (currentQty < item.quantity) {
            throw new Error(`Insufficient stock for ${validItem.name}. Required: ${item.quantity}, Available: ${currentQty}`);
          }
        }
      }
  
      const newDelivery = new Delivery({
        ...deliveryData,
        status: 'pending', 
        createdBy: userId,
        updatedBy: userId
      });
  
      await newDelivery.save({ session });
      await session.commitTransaction();
      
      return newDelivery;
  
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
};

import Delivery from "../models/delivery.model.js";

export const queryDeliveries = async (filters, page = 1, limit = 20) => {
  const query = {};

  // 1. Exact Matches (Simple)
  if (filters.status) query.status = filters.status;
  if (filters.direction) query.direction = filters.direction;
  if (filters.locationId) query.locationId = filters.locationId;

  // 2. Date Range (Complex)
  // "From startDate TO endDate"
  if (filters.startDate || filters.endDate) {
    query.createdAt = {};
    if (filters.startDate) {
      query.createdAt.$gte = new Date(filters.startDate); // Greater Than or Equal
    }
    if (filters.endDate) {
      // PRO TIP: Set endDate to the END of that day (23:59:59) to include items from that day
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      query.createdAt.$lte = end; // Less Than or Equal
    }
  }

  // 3. "OR" Logic (Smart)
  // If the user searches for a "Party" (Client/Vendor), it could be in buyerId OR supplierId
  if (filters.partyId) {
    query.$or = [
      { buyerId: filters.partyId },
      { supplierId: filters.partyId }
    ];
  }

  const skip = (page - 1) * limit;

  const deliveries = await Delivery.find(query)
    .sort({ createdAt: -1 }) // Newest first
    .skip(skip)
    .limit(limit)
    .populate('locationId', 'name')
    .populate('buyerId', 'name')
    .populate('supplierId', 'name');

  // Optional: Get total count for frontend pagination UI
  const total = await Delivery.countDocuments(query);

  return {
    deliveries,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit)
    }
  };
};