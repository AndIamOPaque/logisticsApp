import Location from "../models/location.model.js";

export const getAllLocations = async (req, res, next) => {
  try {
    const locations = await Location.find();
    res.json(locations);
  } catch (err) {
    next(err);
  }
};

export const getLocationById = async (req, res, next) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }
    res.json(location);
  } catch (err) {
    next(err);
  }
};

export const createLocation = async (req, res, next) => {
  try {
    const newLocation = new Location(req.body);
    const savedLocation = await newLocation.save();
    res.status(201).json(savedLocation);
  } catch (err) {
    next(err);
  }
};

export const updateLocation = async (req, res, next) => {
  try {
    const updatedLocation = await Location.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedLocation) {
      return res.status(404).json({ message: "Location not found" });
    }
    res.json(updatedLocation);
  } catch (err) {
    next(err);
  }
};

export const deleteLocation = async (req, res, next) => {
  try {
    const deletedLocation = await Location.findByIdAndDelete(req.params.id);
    if (!deletedLocation) {
      return res.status(404).json({ message: "Location not found" });
    }
    res.json({ message: "Location deleted successfully" });
  } catch (err) {
    next(err);
  }
};
