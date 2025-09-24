import ProductionLog from "../models/productionLog.model.js";

export const getAllProductionLogs = async (req, res, next) => {
  try {
    const productionLogs = await ProductionLog.find().populate("product").populate("location").populate("rawMaterialsConsumed.material");
    res.json(productionLogs);
  } catch (err) {
    next(err);
  }
};

export const getProductionLogById = async (req, res, next) => {
  try {
    const productionLog = await ProductionLog.findById(req.params.id).populate("product").populate("location").populate("rawMaterialsConsumed.material");
    if (!productionLog) {
      return res.status(404).json({ message: "ProductionLog not found" });
    }
    res.json(productionLog);
  } catch (err) {
    next(err);
  }
};

export const createProductionLog = async (req, res, next) => {
  try {
    const newProductionLog = new ProductionLog(req.body);
    const savedProductionLog = await newProductionLog.save();
    res.status(201).json(savedProductionLog);
  } catch (err) {
    next(err);
  }
};

export const updateProductionLog = async (req, res, next) => {
  try {
    const updatedProductionLog = await ProductionLog.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedProductionLog) {
      return res.status(404).json({ message: "ProductionLog not found" });
    }
    res.json(updatedProductionLog);
  } catch (err) {
    next(err);
  }
};

export const deleteProductionLog = async (req, res, next) => {
  try {
    const deletedProductionLog = await ProductionLog.findByIdAndDelete(req.params.id);
    if (!deletedProductionLog) {
      return res.status(404).json({ message: "ProductionLog not found" });
    }
    res.json({ message: "ProductionLog deleted successfully" });
  } catch (err) {
    next(err);
  }
};
