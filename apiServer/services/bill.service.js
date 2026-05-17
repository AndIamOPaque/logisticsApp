import mongoose from "mongoose";
import Bill from "../models/bill.model.js"; 

const handleItems = async (items) => {
    const processedItems = [];

    for (const item of items) {
        if (item.itemRef && !item.modelRef) {
            throw new Error(`Item ${item.name || 'Unknown'} has an ID but no Model Ref.`);
        }

        if (item.itemRef && item.modelRef) {
            const Model = mongoose.model(item.modelRef);
            const product = await Model.findById(item.itemRef);
            
            if (!product) {
                throw new Error(`Item not found: ${item.name} (ID: ${item.itemRef})`);
            }
            if (!item.name) item.name = product.name;
        }

        item.quantity = Number(item.quantity) || 1;
        item.price = Number(item.price) || 0;
        item.total = item.quantity * item.price;
        processedItems.push(item);
    }
    
    return processedItems;
};

export const createNewBill = async (billData, userId) => {
    const validatedItems = await handleItems(billData.items);
    const bill = await Bill.create({
        ...billData,
        items: validatedItems,
        createdBy: userId,
        updatedBy: userId,
    });
    
    return bill;
};

export const addItemsToBill = async (billId, newItems) => {
    const validatedItems = await handleItems(newItems);
    const bill = await Bill.findById(billId);
    if (!bill) throw new Error("Bill not found");
    bill.items.push(...validatedItems);
    await bill.save(); 
    
    return bill;
};

export const removeItemsFromBill = async (billId, itemIds) => {
    const bill = await Bill.findById(billId);
    if (!bill) throw new Error("Bill not found");
    bill.items = bill.items.filter(item => !itemIds.includes(item._id.toString()));
    await bill.save();
    
    return bill;
};


export const addAttachmentToBill = async (billId, attachment) => {
    const bill = await Bill.findById(billId);
    if (!bill) throw new Error("Bill not found");
    
    bill.attachments.push(attachment);
    await bill.save(); 
    return bill;
};

export const removeAttachmentFromBill = async (billId, attachmentId) => {
    const bill = await Bill.findById(billId);
    if (!bill) throw new Error("Bill not found");

    bill.attachments.pull({ _id: attachmentId });
    
    await bill.save();
    return bill;
};

export const markBillAsPaid = async (billId, { paymentMethod, paymentDate, notes }) => {
    const bill = await mongoose.model('Bill').findById(billId);
    
    if (!bill) {
        throw new Error("Bill not found.");
    }

    if (bill.status === 'PAID') {
        throw new Error(`Bill is already marked as PAID on ${bill.paymentDate}`);
    }
    if (!paymentMethod) {
        throw new Error("Cannot mark as paid without a Payment Method (Cash, UPI, etc.)");
    }
    bill.status = 'PAID';
    bill.paymentMethod = paymentMethod;
    bill.paymentDate = paymentDate || new Date(); 
    if (notes) {
        bill.notes = bill.notes 
            ? `${bill.notes}\n[Payment Note]: ${notes}` 
            : `[Payment Note]: ${notes}`;
    }
    await bill.save();
    if (bill.type === 'EXPENSE' && bill.status === 'PAID' && bill.to.model === 'Employee') {
    await mongoose.model('Employee').findByIdAndUpdate(bill.to.party, {
        $inc: { balance: -bill.grandTotal }
    });
}
    return bill;
};

export const updateExistingBill = async (billId, billData) => {
    const bill = await Bill.findById(billId);
    if (!bill) throw new Error("Bill not found");

    if (billData.type) bill.type = billData.type;
    if (billData.category) bill.category = billData.category;
    if (billData.dueDate) bill.dueDate = billData.dueDate;
    if (billData.notes) bill.notes = billData.notes;
    if (billData.status) bill.status = billData.status;
    
    // Handle linkedDelivery changes — sync Delivery.billIds
    if (billData.linkedDelivery !== undefined) {
        const Delivery = mongoose.model('Delivery');
        const oldDeliveryId = bill.linkedDelivery;
        const newDeliveryId = billData.linkedDelivery;

        // Remove from old delivery's billIds
        if (oldDeliveryId && String(oldDeliveryId) !== String(newDeliveryId)) {
            await Delivery.findByIdAndUpdate(oldDeliveryId, {
                $pull: { billIds: bill._id }
            });
        }
        // Add to new delivery's billIds
        if (newDeliveryId) {
            await Delivery.findByIdAndUpdate(newDeliveryId, {
                $addToSet: { billIds: bill._id }
            });
        }
        bill.linkedDelivery = newDeliveryId;
    }
    
    bill.updatedBy = billData.updatedBy;

    await bill.save();
    return bill;
};

export const getBillById = async (billId) => {
    const bill = await Bill.findById(billId)
        .populate('from.party', 'name')
        .populate('to.party', 'name')
        .populate('linkedDelivery', '_id status direction')
        .lean();
    return bill;
};

export const deleteBill = async (billId) => {
    return await Bill.findByIdAndDelete(billId);
};

export const getBills = async ({ 
    filters = {}, 
    page = 1, 
    limit = 20, 
    sortBy = 'dueDate', 
    sortOrder = 'desc' 
}) => {
    
    // 1. Build the Query Object (Ruthless Sanitization)
    // We do NOT pass 'filters' directly to find(). That is a security risk.
    const query = {};

    // --- Enum / Exact Matches ---
    if (filters.type) query.type = filters.type; // "INCOME" or "EXPENSE"
    if (filters.category) query.category = filters.category;
    if (filters.status) query.status = filters.status; // "PENDING", "OVERDUE", "PAID"
    
    // --- Array Checks (e.g. "Get me all PENDING and OVERDUE bills") ---
    if (filters.statusList && Array.isArray(filters.statusList)) {
        query.status = { $in: filters.statusList };
    }

    // --- Date Ranges (The most important part) ---
    // Frontend sends: { dateStart: '2023-01-01', dateEnd: '2023-01-31' }
    if (filters.dateStart || filters.dateEnd) {
        query.dueDate = {};
        if (filters.dateStart) query.dueDate.$gte = new Date(filters.dateStart);
        if (filters.dateEnd)   query.dueDate.$lte = new Date(filters.dateEnd);
    }

    // --- Party Search (Who owes me / Who do I owe?) ---
    // Checks both FROM and TO fields for the Party ID
    if (filters.partyId) {
        query.$or = [
            { 'from.party': filters.partyId },
            { 'to.party': filters.partyId }
        ];
    }

    // 2. Execute Query with Pagination
    const skip = (page - 1) * limit;

    const bills = await Bill.find(query)
        .populate('from.party', 'name') // Only fetch names, not full party history
        .populate('to.party', 'name')
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .lean(); // .lean() converts Mongoose Docs to plain JS objects (Much Faster)

    // 3. Get Total Count (For Frontend Pagination UI)
    const totalCount = await Bill.countDocuments(query);

    return {
        data: bills,
        meta: {
            total: totalCount,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(totalCount / limit)
        }
    };
};