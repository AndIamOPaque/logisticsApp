import mongoose, { get } from 'mongoose';
import Stock from '../models/stock.model.js';
import InventoryMove from '../models/inventoryMove.model.js';
import StockAdjustment from '../models/stockAdjustment.model.js';

export const moveInventory = async ({ 
  item, 
  itemModel, 
  quantity, 
  location, 
  purpose, 
  referenceId, 
  referenceModel,
  userId, 
  session 
}) => {
  const move = new InventoryMove({
    item,
    itemModel,
    quantity, 
    location,
    purpose,
    referenceId,
    referenceModel,
    createdBy: userId
  });
  await move.save({ session });

  const updatedStock = await Stock.findOneAndUpdate(
    { item, location, itemModel },
    { $inc: { quantity: quantity } },
    { new: true, upsert: true, session }
  );

  if (updatedStock.quantity < 0) {
    throw new Error(`Insufficient stock for item ${item} at location ${location}. Current: ${updatedStock.quantity - quantity}`);
  }

  return updatedStock;
};


export const correctStock = async (adjustmentData, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { item, itemModel, quantity, location, reason, type } = adjustmentData;

    const stockAdjustment = new StockAdjustment({
      item,
      itemModel,
      quantity, 
      location, 
      reason,
      type,
      createdBy: userId
    });

    await stockAdjustment.save({ session });

    await moveInventory({
      item,
      itemModel,
      quantity,
      location,
      purpose: 'correction',
      referenceId: stockAdjustment._id, 
      referenceModel: "StockAdjustment",
      userId,
      session 
    });

    await session.commitTransaction();
    return { success: true };

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const getStockLevels = async (itemModel, itemId) => {
  const model = mongoose.model(itemModel);
  const itemExist = await model.findById(itemId);
  
  if (!itemExist) {
    throw new Error(`${itemModel} not found`);
  }
  const stockEntries = await Stock.find({ itemModel, item: itemId })
    .populate('location', 'name') 
    .lean();
  return stockEntries.map(entry => ({
    locationId: entry.location._id,
    locationName: entry.location.name || 'Unknown Location',
    quantity: entry.quantity
  }));
};

export const getInventoryMovements = async (itemModel, itemId, filters = {}) => {
  const query = { itemModel, item: itemId };
  if (filters.startDate) {
    query.createdAt = { $gte: filters.startDate };
  }if (filters.endDate) {
    query.createdAt = query.createdAt || {};
    query.createdAt.$lte = filters.endDate;
  }
  if (filters.purpose) {
    query.purpose = filters.purpose;
  }
  const movements = await InventoryMove.find(query)
    .populate('location', 'name')
    .populate('createdBy', 'name')
    .populate('referenceId')
    .sort({ createdAt: -1 })
    .lean();
  return movements;
};

//bhai ye function test karlena bharosa nai mujhe ispe
export const recalculateTotalStock = async (itemModel, itemId) => {
  const model = mongoose.model(itemModel);
  const item = await model.findById(itemId);
  if(!item){
    throw new Error(`Item ${itemModel} with id ${itemId} not found for stock recalculation`);
  }
  const stock = await InventoryMove.aggregate([{$match:{item: new mongoose.Types.ObjectId(String(itemId)), itemModel: itemModel}, $group:{_id: "$location", total : {$sum : "$quantity"}}}]);
  for(const entry of stock){
    await Stock.findOneAndUpdate({item: itemId, itemModel:itemModel, location:entry._id}, {quantity: entry.total}, {upsert:true});
    console.log(`updated stock at ${entry._id} with quantity ${entry.total}`);
  }
};

/**
 * Fetch all inventory moves linked to a specific reference document
 * e.g. all moves for a ProductionOrder, or a Delivery
 * Input: referenceModel (string enum), referenceId (ObjectId)
 */
export const getMovesForReference = async (referenceModel, referenceId) => {
  const moves = await InventoryMove.find({ referenceModel, referenceId })
    .populate('item', 'name code')
    .populate('location', 'name')
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 })
    .lean();
  return moves;
};

/**
 * Low Stock Alerts: Find raw materials where total stock across all locations
 * is at or below their reorderLevel.
 */
export const getLowStockAlerts = async () => {
  const RawMaterial = (await import('../models/rawMaterial.model.js')).default;

  // Aggregate total stock per raw material across all locations
  const stockAgg = await Stock.aggregate([
    { $match: { itemModel: 'RawMaterial' } },
    { $group: { _id: '$item', totalStock: { $sum: '$quantity' } } }
  ]);

  // Get all raw materials with a reorderLevel > 0
  const materials = await RawMaterial.find({ reorderLevel: { $gt: 0 } })
    .select('name code category unitOfMeasurement reorderLevel')
    .lean();

  const alerts = [];
  for (const mat of materials) {
    const stockEntry = stockAgg.find(s => s._id.toString() === mat._id.toString());
    const totalStock = stockEntry ? stockEntry.totalStock : 0;
    if (totalStock <= mat.reorderLevel) {
      alerts.push({
        _id: mat._id,
        name: mat.name,
        code: mat.code,
        category: mat.category,
        unit: mat.unitOfMeasurement,
        totalStock,
        reorderLevel: mat.reorderLevel,
        deficit: mat.reorderLevel - totalStock,
      });
    }
  }

  // Sort by deficit descending (most critical first)
  alerts.sort((a, b) => b.deficit - a.deficit);
  return alerts;
};