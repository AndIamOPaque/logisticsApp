import StockSnap from "../models/stockSnap.model.js";

export const getAllStockSnaps = async (req, res, next) => {
  try {
    const stockSnaps = await StockSnap.find().populate("item").populate("location");
    res.json(stockSnaps);
  } catch (err) {
    next(err);
  }
};

export const getStockSnapById = async (req, res, next) => {
  try {
    const stockSnap = await StockSnap.findById(req.params.id).populate("item").populate("location");
    if (!stockSnap) {
      return res.status(404).json({ message: "StockSnap not found" });
    }
    res.json(stockSnap);
  } catch (err) {
    next(err);
  }
};

export const createStockSnap = async (req, res, next) => {
  try {
    const newStockSnap = new StockSnap(req.body);
    const savedStockSnap = await newStockSnap.save();
    res.status(201).json(savedStockSnap);
  } catch (err) {
    next(err);
  }
};

export const updateStockSnap = async (req, res, next) => {
  try {
    const updatedStockSnap = await StockSnap.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedStockSnap) {
      return res.status(404).json({ message: "StockSnap not found" });
    }
    res.json(updatedStockSnap);
  } catch (err) {
    next(err);
  }
};

export const deleteStockSnap = async (req, res, next) => {
  try {
    const deletedStockSnap = await StockSnap.findByIdAndDelete(req.params.id);
    if (!deletedStockSnap) {
      return res.status(404).json({ message: "StockSnap not found" });
    }
    res.json({ message: "StockSnap deleted successfully" });
  } catch (err) {
    next(err);
  }
};
