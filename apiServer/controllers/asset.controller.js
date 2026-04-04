import * as assetService from "../services/asset.service.js";
import Asset from "../models/asset.model.js"; 


export const createAsset = async (req, res, next) => {
  try {
    const asset = await assetService.createAsset(req.body, req.user._id);
    res.status(201).json({ success: true, data: asset });
  } catch (err) {
    next(err);
  }
};


export const getAssets = async (req, res, next) => {
  try {
    const filters = {
      name: req.query.name,
      locationId: req.query.locationId,
      status: req.query.status,
      category: req.query.category,
    };

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await assetService.getAssets(filters, page, limit);
    
    res.json({ success: true, data: result.assets });
  } catch (err) {
    next(err);
  }
};


export const getAssetById = async (req, res, next) => {
  try {
    const asset = await Asset.findById(req.params.id)
      .populate("location", "name type")
      .populate("createdBy", "name")
      .populate("updatedBy", "name");

    if (!asset) {
      return res.status(404).json({ success: false, message: "Asset not found" });
    }
    res.json({ success: true, data: asset });
  } catch (err) {
    next(err);
  }
};

export const updateAsset = async (req, res, next) => {
  try {
    const asset = await assetService.updateAsset(req.params.id, req.body, req.user._id);
    res.json({ success: true, data: asset });
  } catch (err) {
    next(err);
  }
};

export const addServiceRecord = async (req, res, next) => {
  try {
    const asset = await assetService.updateServiceRecords(
      req.params.id, 
      req.body, 
      req.user._id
    );
    res.json({ success: true, message: "Service record logged successfully", data: asset });
  } catch (err) {
    next(err);
  }
};