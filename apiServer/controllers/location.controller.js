import Location from "../models/location.model.js"; 
import * as locationService from "../services/location.service.js"; 

export const getAllLocations = async (req, res, next) => {
  try {
    const query = {};
    // By default, only return active locations.
    // The locations management page passes includeInactive=true to see all.
    if (req.query.includeInactive !== 'true') {
      query.isActive = { $ne: false };
    }
    const locations = await Location.find(query).sort({ name: 1 });
    res.json({ success: true, data: locations });
  } catch (err) {
    next(err);
  }
};

export const getLocationById = async (req, res, next) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ success: false, message: "Location not found" });
    }
    res.json({ success: true, data: location });
  } catch (err) {
    next(err);
  }
};


export const createLocation = async (req, res, next) => {
  try {
    const result = await locationService.createLocation(req.body, req.user._id);
    
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    if (err.code === 11000) {
        return res.status(409).json({ success: false, message: "Location name already exists." });
    }
    next(err);
  }
};

export const updateLocation = async (req, res, next) => {
  try {
    const result = await locationService.updateLocation(req.params.id, req.body, req.user._id);
    if (!result) return res.status(404).json({ success: false, message: "Location not found" });

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const deleteLocation = async (req, res, next) => {
  try {
    const force = req.query.force === 'true';
    
    const result = await locationService.deactivateLocation(req.params.id, req.user._id, force);
    
    res.json({ 
        success: true, 
        message: "Location deactivated successfully",
        data: result 
    });

  } catch (err) {
    if (err.code === "STOCK_EXISTS") {
        return res.status(400).json({
            success: false,
            message: err.message,
            blockingItems: err.data 
        });
    }
    next(err);
  }
};