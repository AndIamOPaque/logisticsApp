import RawMaterial from "../models/rawMaterial.model.js";
import mongoose from "mongoose";

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const getRawMaterials = async (req, res, next) => {
  try {
    const { name, category } = req.query;
    const query = {name: null}; 

    if (name) {
      const safeName = escapeRegExp(name);
      query.name = new RegExp('^' + safeName, 'i');
    }

    if (category) {
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

    const materials = await RawMaterial.find(query);
    res.status(200).json({ success: true, data: materials });

  } catch (error) {
    console.error("Failed to get raw materials:", error);
    res.status(500).json({
      success: false,
      errors: ['Server error. Failed to retrieve data.']
    });
  }
};

export const getRawMaterialById = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, errors: ['Invalid ID format'] });
  }

  try {
    const material = await RawMaterial.findOne({ _id: id, isActive: true });

    if (!material) {
      return res.status(404).json({
        success: false,
        errors: ["Raw material not found"]
      });
    }

    res.status(200).json({ success: true, data: material });

  } catch (error) {
    console.error("Failed to get raw material by ID:", error);
    res.status(500).json({
      success: false,
      errors: ['Server error. Failed to retrieve data.']
    });
  }
};

export const createRawMaterial = async (req, res, next) => {
  delete req.body.quantityOnHand;

  try {
    // shourya bhai 'createdBy' is added by auth middleware req.user.id
    // newMaterial.createdBy = req.user.id; 
    
    const newMaterial = new RawMaterial(req.body);
    const savedMaterial = await newMaterial.save();

    res.status(201).json({ success: true, data: savedMaterial });

  } catch (error) {
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

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, errors: messages });
    }

    console.error(error);
    res.status(500).json({ success: false, errors: ['Server error'] });
  }
};


export const updateRawMaterial = async (req, res, next) => {
  delete req.body.quantityOnHand;
  delete req.body.createdBy;

  //'updatedBy' auth middleware se daal do please 
  // req.body.updatedBy = req.user.id;

  try {
    const material = await RawMaterial.findByIdAndUpdate(
      req.params.id,
      req.body,
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
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, errors: messages });
    }
    console.error(error);
    res.status(500).json({ success: false, errors: ['Server error'] });
  }
};
