import mongoose from "mongoose";
import Product from "../models/product.model.js";
import ProductionOrder from "../models/productionOrder.model.js";
import { moveInventory } from "./inventory.service.js";
import RawMaterial from "../models/rawMaterial.model.js";

/**
 * ACTION A: Log the Output (The Yield)
 * "I made 50 units."
 * NOTE: This does NOT deduct materials anymore. It only adds product.
 */
export const logProductionOutput = async (orderId, quantityProduced, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await ProductionOrder.findById(orderId).session(session);
    if (!order || ['completed', 'cancelled'].includes(order.status)) {
        throw new Error("Invalid or closed order.");
    }

    // 1. Add Finished Product to Stock
    await moveInventory({
        item: order.product,
        itemModel: 'Product',
        quantity: quantityProduced, // Positive (Add)
        location: order.location,
        purpose: 'production',
        referenceId: order._id,
        referenceModel: 'ProductionOrder',
        userId,
        session
    });

    // 2. Update Log
    order.actualQuantity = (order.actualQuantity || 0) + quantityProduced;
    order.updatedBy = userId;
    
    await order.save({ session });
    await session.commitTransaction();
    return order;

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * ACTION B: Log the Input (The Cost)
 * "I loaded 25kg of Yellow Granules."
 * NOTE: This is totally independent of how many toys you made.
 */
export const logMaterialUsage = async (orderId, materialId, quantityUsed, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await ProductionOrder.findById(orderId).session(session);
    if (!order || ['completed', 'cancelled'].includes(order.status)) {
        throw new Error("Invalid or closed order.");
    }

    // 1. Deduct Raw Material from Stock
    await moveInventory({
        item: materialId,
        itemModel: 'RawMaterial',
        quantity: -quantityUsed, // Negative (Remove)
        location: order.location,
        purpose: 'production',
        referenceId: order._id,
        referenceModel: 'ProductionOrder',
        userId,
        session
    });

    // 2. Update the "Consumed Materials" Ledger in the Order
    // This looks complex but it just finds the material in the array and adds to it
    const existingEntry = order.consumedMaterials.find(
        m => m.material.toString() === materialId
    );

    if (existingEntry) {
        existingEntry.quantity += quantityUsed;
    } else {
        order.consumedMaterials.push({ material: materialId, quantity: quantityUsed });
    }

    order.updatedBy = userId;
    await order.save({ session });
    await session.commitTransaction();
    return order;

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
/**
 * ACTION C: Return Unused Material
 * "I am putting 5kg back into the pile."
 * - Increases Stock (Positive Move).
 * - Decreases 'Consumed' count in the Order Log.
 */
export const returnUnusedMaterial = async (orderId, materialId, quantityReturned, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await ProductionOrder.findById(orderId).session(session);
    if (!order || ['completed', 'cancelled'].includes(order.status)) {
        throw new Error("Invalid or closed order.");
    }

    // 1. Safety Check: Can't return more than you took!
    const entry = order.consumedMaterials.find(
        m => m.material.toString() === materialId
    );
    
    // If we never used this material, or trying to return 6kg when we only took 5kg
    if (!entry || entry.quantity < quantityReturned) {
        throw new Error(`Cannot return ${quantityReturned}. Only ${entry ? entry.quantity : 0} was issued.`);
    }

    // 2. Add Stock Back (Positive Move)
    await moveInventory({
        item: materialId,
        itemModel: 'RawMaterial',
        quantity: quantityReturned, // Positive (Add to shelf)
        location: order.location,
        purpose: 'correction', // or 'return'
        referenceId: order._id,
        referenceModel: 'ProductionOrder',
        userId,
        session
    });

    // 3. Update the Log (Reduce Consumption)
    entry.quantity -= quantityReturned;

    order.updatedBy = userId;
    await order.save({ session });
    await session.commitTransaction();
    return order;

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**ACTION D: create new Order */

export const createProductionOrder = async (orderData, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const safeData = {
      product: orderData.product,
      location: orderData.location,
      targetQuantity: orderData.targetQuantity,
      notes: orderData.notes,
      date: orderData.date || new Date(), 
      createdBy: userId,
      updatedBy: userId,
      
      status: 'pending',
      actualQuantity: 0,
      consumedMaterials: []
    };
    const productExists = await Product.exists({ _id: safeData.product }).session(session);
    if (!productExists) throw new Error(`Product not found: ${safeData.product}`);

    const locationExists = await Location.exists({ _id: safeData.location }).session(session);
    if (!locationExists) throw new Error(`Location not found: ${safeData.location}`);

    const newOrder = new ProductionOrder(safeData);
    await newOrder.save({ session });
    
    await session.commitTransaction();
    return newOrder;

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/** Action E hmm update order status */
export const updateOrderStatus = async (orderId, newStatus, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await ProductionOrder.findById(orderId).session(session);
    if (!order) {
      throw new Error("Order not found.");
    }

    const currentStatus = order.status;

    if (['completed', 'cancelled'].includes(currentStatus)) {
      throw new Error("Cannot change status of completed or cancelled orders.");
    }
    if (currentStatus === "pending" && newStatus !== "in_progress" && newStatus !== "cancelled") {
      throw new Error("Pending orders can only start or be cancelled.");
    }
    if (currentStatus === "in_progress" && newStatus !== "completed" && newStatus !== "cancelled") {
      throw new Error("In-progress orders can only complete or be cancelled.");
    }

    if (newStatus === "completed") {
      const varianceReport = await calculateVarianceReport(session, order);
    
      order.notes = (order.notes || "") + varianceReport;
    }

    order.status = newStatus;
    order.updatedBy = userId;

    await order.save({ session });
    await session.commitTransaction();
    return order;

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const calculateVarianceReport = async (session, order) => {
  const product = await Product.findById(order.product)
    .populate('rawMaterials.material')
    .session(session);

  if (!product) throw new Error("Product definition not found");

  let report = "\n\n--- FINAL VARIANCE REPORT ---\n";

  for (const recipeItem of product.rawMaterials) {
    const standardNeeded = recipeItem.quantity * order.actualQuantity;

    const consumedEntry = order.consumedMaterials.find(
      entry => entry.material.toString() === recipeItem.material._id.toString()
    );
    const actualUsed = consumedEntry ? consumedEntry.quantity : 0;
    const variance = actualUsed - standardNeeded;
    
    report += `\nMaterial: ${recipeItem.material.name}`;
    report += `\n - Standard: ${standardNeeded.toFixed(2)}`;
    if (actualUsed === 0) {
      report += `\n - Variance: N/A (No usage logged)`;
      continue;
    }
    report += `\n - Actual:   ${actualUsed.toFixed(2)}`;
    
    report += `\n - Variance: ${variance.toFixed(2)} ${variance > 0 ? '(WASTE)' : '(EFFICIENT)'}`;
  }

  return report;
};