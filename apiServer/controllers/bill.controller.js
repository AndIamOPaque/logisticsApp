import * as BillService from "../services/bill.service.js"; // Import the logic you wrote

// 1. Create Bill
export const createBill = async (req, res) => {
  try {
    // Assumption: Your auth middleware adds 'user' to req
    const userId = req.user._id; 
    
    const newBill = await BillService.createNewBill(req.body, userId);
    return res.status(201).json({ success: true, data: newBill });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const getBillById = async (req, res) => {
  try {
    const { id } = req.params;
    const bill = await BillService.getBillById(id);
    if (!bill) {
      return res.status(404).json({ success: false, message: "Bill not found" });
    }
    return res.status(200).json({ success: true, data: bill });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteBill = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBill = await BillService.deleteBill(id);
    if (!deletedBill) {
      return res.status(404).json({ success: false, message: "Bill not found" });
    }
    return res.status(200).json({ success: true, data: deletedBill });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Get Bills (Filter/Sort/Paginate)
export const getBills = async (req, res) => {
  try {
    const { 
      page, limit, sortBy, sortOrder, 
      type, category, status, 
      dateStart, dateEnd, partyId 
    } = req.query;

    const filters = {
      type,
      category,
      status,
      dateStart,
      dateEnd,
      partyId
    };
    
    // Handle status list (e.g., ?statusList=PENDING,OVERDUE)
    if (req.query.statusList) {
      filters.statusList = req.query.statusList.split(',');
    }

    const result = await BillService.getBills({
      filters,
      page,
      limit,
      sortBy,
      sortOrder
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const markPaid = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod, paymentDate, notes } = req.body;

    const updatedBill = await BillService.markBillAsPaid(id, { 
      paymentMethod, 
      paymentDate, 
      notes 
    });

    return res.status(200).json({ success: true, data: updatedBill });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const updateBill = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const updatedBill = await BillService.updateExistingBill(id, {
        ...req.body,
        updatedBy: userId
    });

    return res.status(200).json({ success: true, data: updatedBill });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const addItems = async (req, res) => {
  try {
    const { id } = req.params;
    const { items } = req.body; // Expects array of items

    const updatedBill = await BillService.addItemsToBill(id, items);
    return res.status(200).json({ success: true, data: updatedBill });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const removeItems = async (req, res) => {
  try {
    const { id } = req.params;
    const { itemIds } = req.body; 

    const updatedBill = await BillService.removeItemsFromBill(id, itemIds);
    return res.status(200).json({ success: true, data: updatedBill });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const addAttachment = async (req, res) => {
  try {
    const { id } = req.params;
    const attachment = req.body; // { url, fileType, caption }

    const updatedBill = await BillService.addAttachmentToBill(id, attachment);
    return res.status(200).json({ success: true, data: updatedBill });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const removeAttachment = async (req, res) => {
  try {
    const { id, attachmentId } = req.params; // /:id/attachment/:attachmentId

    const updatedBill = await BillService.removeAttachmentFromBill(id, attachmentId);
    return res.status(200).json({ success: true, data: updatedBill });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};