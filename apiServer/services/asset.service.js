import Asset from "../models/asset.model.js";
import Location from "../models/location.model.js";

export const createAsset = async (assetData, userId) => {
    const locationExists = await Location.exists({ _id: assetData.location });
    if (!locationExists) {
        throw new Error(`Location not found: ${assetData.location}`);
    }

    
    const safeData = {
        name: assetData.name,
        category: assetData.category,
        location: assetData.location,
        status: assetData.status || 'active', 
        purchaseDate: assetData.purchaseDate,
        cost: assetData.cost,
        notes: assetData.notes,
        serviceRecords: [], 
        createdBy: userId,
        updatedBy: userId,
    };

    const newAsset = await Asset.create(safeData);
    return newAsset;
};

export const updateAsset = async (assetId, updateData, userId) => {

    const asset = await Asset.findById(assetId);
    if (!asset) {
        throw new Error(`Asset not found: ${assetId}`);
    }

    if (updateData.location) {
        const locationExists = await Location.exists({ _id: updateData.location });
        if (!locationExists) {
            throw new Error(`Location not found: ${updateData.location}`);
        }
    }


    const assetUpdate = {
        name: updateData.name ?? undefined,
        category: updateData.category ?? undefined, 
        location: updateData.location ?? undefined,
        status: updateData.status ?? undefined,
        purchaseDate: updateData.purchaseDate ?? undefined, 
        cost: updateData.cost ?? undefined, 
        notes: updateData.notes ?? undefined, 
        updatedBy: userId,
    };

    Object.keys(assetUpdate).forEach(key => assetUpdate[key] === undefined && delete assetUpdate[key]);

    const updatedAsset = await Asset.findByIdAndUpdate(
        assetId,
        assetUpdate,
        { new: true, runValidators: true }
    );

    return updatedAsset;
};

export const getAssets = async (filters, page = 1, limit = 20) => {
    const query = {
        name: filters.name ? { $regex: filters.name, $options: "i" } : undefined,
        location: filters.locationId || undefined,
        status: filters.status || undefined,
        category: filters.category || undefined, 
    };

    Object.keys(query).forEach(key => query[key] === undefined && delete query[key]);
    
    const skip = (page - 1) * limit;

    const assets = await Asset.find(query)
        .populate("location", "name type") 
        .populate("createdBy", "name")     
        .populate("updatedBy", "name")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

    const total = await Asset.countDocuments(query);

    return {
        assets,
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
    };
};

export const updateServiceRecords = async (assetId, serviceRecordData, userId) => {
    const asset = await Asset.findById(assetId);
    if (!asset) {
        throw new Error(`Asset not found: ${assetId}`);
    }

    if (!serviceRecordData.description) {
        throw new Error("Service record must have a description");
    }

    const newRecord = {
        date: serviceRecordData.date || new Date(),
        description: serviceRecordData.description,
        bills: serviceRecordData.bills || [], 
    };

    asset.serviceRecords.push(newRecord);
    
  //auto update status jab service log ho rha maybe
    
    asset.updatedBy = userId;
    await asset.save();
    
    return asset;
};