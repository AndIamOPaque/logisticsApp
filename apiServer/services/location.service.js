import mongoose from "mongoose";
import Stock from "../models/stock.model.js";
import Location from "../models/location.model.js";

export const createLocation = async (locationData, userId) => {
    const safeLocation = {
        name: locationData.name,
        type: locationData.type,
        address: locationData.address,
        contact: locationData.contact || {},
        capacity: locationData.capacity || {},
        isActive: true, 
        createdBy: userId,
        updatedBy: userId 
    };
    const location = await Location.create(safeLocation);
    return location;
};
export const updateLocation = async (locationId, updateData, userId) => {
    const safeUpdate = {
        name: updateData.name ?? undefined,
        type: updateData.type ?? undefined,
        address: updateData.address ?? undefined,
        contact: updateData.contact ?? undefined,
        capacity: updateData.capacity ?? undefined,
        updatedBy: userId 
    };

    Object.keys(safeUpdate).forEach(key => safeUpdate[key] === undefined && delete safeUpdate[key]);

    const updatedLocation = await Location.findByIdAndUpdate(
        locationId, 
        safeUpdate, 
        { new: true, runValidators: true }
    );
    if (!updatedLocation) throw new Error("Location not found");
    return updatedLocation;
};

export const deactivateLocation = async (locationId, userId, force = false) => {
    const activeStock = await Stock.find({ 
        location: locationId, 
        quantity: { $gt: 0 } 
    }).populate('item', 'name'); 

    const stockCount = activeStock.length;

    const stockDetails = activeStock.map(stock => ({
        id: stock.item._id,
        name: stock.item ? stock.item.name : 'Unknown Item',
        quantity: stock.quantity
    }));

    if (stockCount > 0) {
        if (!force) {
            const error = new Error(`Cannot deactivate. Location has ${stockCount} active items.`);
            error.code = "STOCK_EXISTS"; 
            error.data = stockDetails;   
            throw error;

        } else {
            await Stock.updateMany(
                { location: locationId }, 
                { quantity: 0 }
            );
            
            console.warn(`[AUDIT] User ${userId} forced deactivation of Loc ${locationId}. Wiped ${stockCount} records.`);
        }
    }

    const updatedLocation = await Location.findByIdAndUpdate(
        locationId, 
        { isActive: false, updatedBy: userId }, 
        { new: true }
    );

    if (!updatedLocation) throw new Error("Location not found");

    return {
        location: updatedLocation,
        archivedStock: force && stockCount > 0 ? stockDetails : []
    };
};