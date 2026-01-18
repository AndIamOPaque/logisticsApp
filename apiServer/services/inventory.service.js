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
  if(!itemExist){
    throw new Error(`${itemModel} not found`);
  } 
  const stockEntries = await Stock.find({ itemModel, item: itemId });
  const stockByLocation = {};
  stockEntries.forEach(entry => {
    stockByLocation[entry.location] = entry.quantity;
  });
  return stockByLocation;
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
  const movements = await InventoryMove.find(query).sort({ createdAt: -1 });
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