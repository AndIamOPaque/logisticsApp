import RawMaterial from "../models/rawMaterial.model.js";

export const getAllRawMaterials = async (req, res, next) => {
  try {
    const rawMaterials = await RawMaterial.find();
    res.json(rawMaterials);
  } catch (err) {
    next(err);
  }
};

export const getRawMaterialById = async (req, res, next) => {
  try {
    const rawMaterial = await RawMaterial.findById(req.params.id);
    if (!rawMaterial) {
      return res.status(404).json({ message: "RawMaterial not found" });
    }
    res.json(rawMaterial);
  } catch (err) {
    next(err);
  }
};

export const createRawMaterial = async (req, res, next) => {
  try {
    const newRawMaterial = new RawMaterial(req.body);
    const savedRawMaterial = await newRawMaterial.save();
    res.status(201).json(savedRawMaterial);
  } catch (err) {
    next(err);
  }
};

export const updateRawMaterial = async (req, res, next) => {
  try {
    const updatedRawMaterial = await RawMaterial.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedRawMaterial) {
      return res.status(404).json({ message: "RawMaterial not found" });
    }
    res.json(updatedRawMaterial);
  } catch (err) {
    next(err);
  }
};

export const deleteRawMaterial = async (req, res, next) => {
  try {
    const deletedRawMaterial = await RawMaterial.findByIdAndDelete(req.params.id);
    if (!deletedRawMaterial) {
      return res.status(404).json({ message: "RawMaterial not found" });
    }
    res.json({ message: "RawMaterial deleted successfully" });
  } catch (err) {
    next(err);
  }
};
