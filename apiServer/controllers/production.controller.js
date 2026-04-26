import ProductionOrder from "../models/productionOrder.model.js";
import { createProductionOrder, logMaterialUsage, logProductionOutput, returnUnusedMaterial, updateOrderStatus, getProductionInventoryMoves } from "../services/production.service.js"

export const createNewProductionOrder = async (req, res, next) => {
  try {
    const userId = req.user._id; 
    const orderData = req.body; 
    const newOrder = await createProductionOrder(orderData, userId);
    res.status(201).json({success:true, data:newOrder});
  } catch (err) {
    next(err);
  }
};

export const getProductionOrder = async (req, res, next) => {
   try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const order = await ProductionOrder.find()
      .populate("product", "name code costPerUnit salesPrice")
      .populate("location", "name")
      .populate("createdBy", "name email")
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await ProductionOrder.countDocuments();

    res.json({
      data: order,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  } 
}

export const getProductionOrderById = async (req, res, next) => {
  try{
    const orderId = req.params.id;
    const order = await ProductionOrder.findById(orderId).populate("product", "name code costPerUnit salesPrice")
      .populate("location", "name")
      .populate("createdBy", "name email");
    if(!order){
      res.status(404).json({success:false, message:`Production Order with ID ${orderId} was not found`});
    }else{
      res.status(200).json({success:true, data: order});
    }
  }catch(error){
    next(error);
  }
}

export const recordMaterialUsage = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const orderId = req.params.id;
    const { materialId, quantityUsed } = req.body;
    const updatedOrder = await logMaterialUsage(orderId, materialId, quantityUsed, userId);
    res.status(200).json(updatedOrder);
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
        res.status(200).json(updatedOrder);
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
    res.status(200).json(updatedOrder);
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
    res.status(200).json(updatedOrder);
  } catch (err) {
    next(err);
  }
};

export const getProductionLogs = async (req, res, next) => {
  try {
    const moves = await getProductionInventoryMoves(req.params.id);
    res.status(200).json({ success: true, data: moves });
  } catch (err) {
    next(err);
  }
};