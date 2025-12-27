import mongoose from 'mongoose';
import Stock from '../models/stock.model.js';
import InventoryMove from '../models/inventoryMove.model.js';

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