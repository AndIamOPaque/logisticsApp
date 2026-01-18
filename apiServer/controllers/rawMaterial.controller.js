import RawMaterial from "../models/rawMaterial.model.js";
import mongoose from "mongoose";
import { correctStock, getStockLevels } from "../services/inventory.service.js";

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const getRawMaterials = async (req, res, next) => {
  try {
    const { name, category } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};

    if (name) {
      const safeName = escapeRegExp(name);
      query.name = new RegExp('^' + safeName, 'i');
    }

    if (category) {
      // Validate category against schema enum to prevent DB errors
      const validCategories = RawMaterial.schema.path('category').enumValues;
      if (validCategories.includes(category)) {
        query.category = category;
      } else {
        return res.status(400).json({
          success: false,
          errors: [`Invalid category. Must be one of: ${validCategories.join(', ')}`]
        });
      }
    }

    const materials = await RawMaterial.find(query)
      .populate("createdBy", "name email") 
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await RawMaterial.countDocuments(query);

    res.status(200).json({
      success: true,
      data: materials,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    next(error);
  }
};

export const getRawMaterialById = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, errors: ['Invalid ID format'] });
  }

  try {
    const material = await RawMaterial.findOne({ _id: id })
      .populate("createdBy", "name")
      .lean();

    if (!material) {
      return res.status(404).json({
        success: false,
        errors: ["Raw material not found"]
      });
    }

    res.status(200).json({ success: true, data: material });

  } catch (error) {
    next(error);
  }
};

export const createRawMaterial = async (req, res, next) => {

  try {
    const materialData = {
      ...req.body,
      createdBy: req.user._id,
      updatedBy: req.user._id
    };

    const newMaterial = new RawMaterial(materialData);
    const savedMaterial = await newMaterial.save();

    res.status(201).json({ success: true, data: savedMaterial });

  } catch (error) {
    // Handle Duplicate Key Error (E.g. unique name/code)
    if (error.code === 11000) {
      const conflictingField = Object.keys(error.keyPattern)[0];
      
      const existing = await RawMaterial.findOne({
        [conflictingField]: req.body[conflictingField]
      }).select('+isActive');

      if (existing && !existing.isActive) {
        return res.status(409).json({
          success: false,
          errors: [`Material with this ${conflictingField} exists but is inactive. Use PATCH to reactivate.`]
        });
      }
      return res.status(409).json({
        success: false,
        errors: [`A raw material with this ${conflictingField} already exists.`]
      });
    }
    next(error);
  }
};

export const updateRawMaterial = async (req, res, next) => {
  delete req.body.createdBy; 

  try {
    const updateData = {
      ...req.body,
      updatedBy: req.user._id
    };

    const material = await RawMaterial.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    if (!material) {
      return res.status(404).json({
        success: false,
        errors: ["Raw material not found"]
      });
    }

    res.json({ success: true, data: material });

  } catch (error) {
    if (error.code === 11000) {
      const conflictingField = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        success: false,
        errors: [`A raw material with this ${conflictingField} already exists.`]
      });
    }
    next(error);
  }
};

export const correctRawMaterialStock = async (req, res, next) => {
  try {
    const safeUpdate = {
      ...req.body,
      itemModel: "RawMaterial",
      item: req.params.id,
      createdBy: req.user_id,
    }
    const materialId = req.params.id;
    const material = await RawMaterial.findById(materialId);
    if (!material) {
      return res.status(404).json({ success:false, message: "Raw material not found" });
    }
    await correctStock(safeUpdate, req.user._id);

    res.json({ success: true, message: "Stock corrected successfully" });
  } catch (error) {
    next(error);
  }
};

export const getRawMaterialStockLevels = async (req, res, next) => {
  try{
  const stockByLocation = await getStockLevels('RawMaterial', req.params.id);
  res.status(200).json({success:true, data: stockByLocation});
  }catch(error){
    next(error);
  }
}