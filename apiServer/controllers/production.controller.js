import ProductionOrder from "../models/productionOrder.model.js";
import {createProductionOrder ,logMaterialUsage, logProductionOutput, returnUnusedMaterial, updateOrderStatus } from "../services/production.services.js";

export const createNewProductionOrder = async (req, res, next) => {
  try {
    const userId = req.user._id; 
    const orderData = req.body; 
    const newOrder = await createProductionOrder(orderData, userId);
    res.status(201).json(newOrder);
  } catch (err) {
    next(err);
  }
};

export const recordMaterialUsage = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const orderId = req.params.id;
    const { materialId, quantityUsed } = req.body;
    const updatedOrder = await logMaterialUsage(orderId, materialId, quantityUsed, userId);
    res.json(updatedOrder);
  } catch (err) {
    next(err);
  }
};

export const recordProductionOutput = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const orderId = req.params.id;
        const { quantityProduced } = req.body;
        const updatedOrder = await logProductionOutput(orderId, quantityProduced, userId);
        res.json(updatedOrder);
    } catch (err) {
        next(err);
    }
};

export const returnUnusedMaterials = async (req, res, next) => {
  try {
    const userId = req.user._id; 
    const orderId = req.params.id;
    const { materialId, quantityReturned } = req.body;
    const updatedOrder = await returnUnusedMaterial(orderId, materialId, quantityReturned, userId);
    res.json(updatedOrder);
  } catch (err) {
    next(err);
  }
};

export const changeProductionOrderStatus = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const orderId = req.params.id;
    const { status } = req.body;
    const updatedOrder = await updateOrderStatus(orderId, status, userId);
    res.json(updatedOrder);
  } catch (err) {
    next(err);
  }
};