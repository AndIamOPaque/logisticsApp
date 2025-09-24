import Party from "../models/party.model.js";

export const getAllParties = async (req, res, next) => {
  try {
    const parties = await Party.find();
    res.json(parties);
  } catch (err) {
    next(err);
  }
};

export const getPartyById = async (req, res, next) => {
  try {
    const party = await Party.findById(req.params.id);
    if (!party) {
      return res.status(404).json({ message: "Party not found" });
    }
    res.json(party);
  } catch (err) {
    next(err);
  }
};

export const createParty = async (req, res, next) => {
  try {
    const newParty = new Party(req.body);
    const savedParty = await newParty.save();
    res.status(201).json(savedParty);
  } catch (err) {
    next(err);
  }
};

export const updateParty = async (req, res, next) => {
  try {
    const updatedParty = await Party.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedParty) {
      return res.status(404).json({ message: "Party not found" });
    }
    res.json(updatedParty);
  } catch (err) {
    next(err);
  }
};

export const deleteParty = async (req, res, next) => {
  try {
    const deletedParty = await Party.findByIdAndDelete(req.params.id);
    if (!deletedParty) {
      return res.status(404).json({ message: "Party not found" });
    }
    res.json({ message: "Party deleted successfully" });
  } catch (err) {
    next(err);
  }
};
