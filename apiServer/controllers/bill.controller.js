import Bill from "../models/bill.model.js";

export const getAllBills = async (req, res, next) => {
  try {
    const bills = await Bill.find().populate("from.party").populate("to.party").populate("items.item");
    res.json(bills);
  } catch (err) {
    next(err);
  }
};

export const getBillById = async (req, res, next) => {
  try {
    const bill = await Bill.findById(req.params.id).populate("from.party").populate("to.party").populate("items.item");
    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }
    res.json(bill);
  } catch (err) {
    next(err);
  }
};

export const createBill = async (req, res, next) => {
  try {
    const newBill = new Bill(req.body);
    const savedBill = await newBill.save();
    res.status(201).json(savedBill);
  } catch (err) {
    next(err);
  }
};

export const updateBill = async (req, res, next) => {
  try {
    const updatedBill = await Bill.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedBill) {
      return res.status(404).json({ message: "Bill not found" });
    }
    res.json(updatedBill);
  } catch (err) {
    next(err);
  }
};

export const deleteBill = async (req, res, next) => {
  try {
    const deletedBill = await Bill.findByIdAndDelete(req.params.id);
    if (!deletedBill) {
      return res.status(404).json({ message: "Bill not found" });
    }
    res.json({ message: "Bill deleted successfully" });
  } catch (err) {
    next(err);
  }
};
