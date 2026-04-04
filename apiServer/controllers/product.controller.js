import Product from "../models/product.model.js";
import { correctStock, getStockLevels } from "../services/inventory.service.js";

export const getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const products = await Product.find()
      .populate("rawMaterials.material", "name code costPerUnit")
      .populate("createdBy", "name email")
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Product.countDocuments();

    res.status(200).json({
      data: products,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("rawMaterials.material")
      .populate("createdBy", "name")
      .lean();

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({success:true, data:product});
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const productData = {
      ...req.body,
      createdBy: req.user._id,
      updatedBy: req.user._id
    };

    const newProduct = new Product(productData);
    const savedProduct = await newProduct.save();

    res.status(201).json({success:true, data:savedProduct});
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const updateData = {
      ...req.body,
      updatedBy: req.user._id
    };

    delete updateData.createdBy;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    );

    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({success:true, data: updatedProduct});
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const deletedProduct = await Product.findByIdAndUpdate(req.params.id, {isActive : false});
    
    if (!deletedProduct) {
      return res.status(404).json({ success:false, message: "Product not found" });
    }
    res.json({ success:true, message: "Product deleted successfully" });
  } catch (err) {
    next(err);
  }
};

export const correctProductStock = async (req, res, next) => {
  try {
    const safeUpdate = {
      ...req.body,
      item: req.params.id,
      itemModel: "Product",
      createdBy: req.user_id,
    }
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success:false, message: "Product not found" });
    }
    await correctStock(safeUpdate, req.user._id);

    res.json({ success: true, message: "Stock corrected successfully" });
  } catch (error) {
    next(error);
  }
};

export const getProductStockLevels = async (req, res, next) =>{
  try{
    const stockByLocation = await getStockLevels('Product', req.params.id);
    res.status(200).json({success:true, data: stockByLocation});
  }catch(error){
    next(error);
  }
};