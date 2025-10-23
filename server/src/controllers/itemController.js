const Item = require('../models/Item');
const Notification = require('../models/Notification');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/cloudinaryService');

// @desc    Create new item
// @route   POST /api/items
exports.createItem = async (req, res) => {
  try {
    const { type, title, description, category, location, date, tags } = req.body;
    
    // Upload images to Cloudinary
    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer, 'items');
        images.push({
          url: result.secure_url,
          publicId: result.public_id
        });
      }
    }

    const item = await Item.create({
      type,
      title,
      description,
      category,
      location,
      date,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      images,
      userId: req.user._id
    });

    res.status(201).json({
      success: true,
      data: item
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating item'
    });
  }
};

// @desc    Get all items with filters
// @route   GET /api/items
exports.getItems = async (req, res) => {
  try {
    const { type, category, status, search, page = 1, limit = 12 } = req.query;
    
    const query = {};
    
    if (type) query.type = type;
    if (category) query.category = category;
    if (status) query.status = status;
    else query.status = 'active'; // Default to active items
    
    if (search) {
      query.$text = { $search: search };
    }
    
    const items = await Item.find(query)
      .populate('userId', 'name email picture')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    const count = await Item.countDocuments(query);
    
    res.json({
      success: true,
      data: items,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching items'
    });
  }
};

// @desc    Get single item
// @route   GET /api/items/:id
exports.getItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('userId', 'name email picture')
      .populate('resolvedBy', 'name email');
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }
    
    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching item'
    });
  }
};

// @desc    Get user's items
// @route   GET /api/items/my/items
exports.getMyItems = async (req, res) => {
  try {
    const items = await Item.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching your items'
    });
  }
};

// @desc    Update item
// @route   PUT /api/items/:id
exports.updateItem = async (req, res) => {
  try {
    let item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }
    
    // Check ownership
    if (item.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this item'
      });
    }
    
    const { title, description, category, location, date, tags } = req.body;
    
    if (title) item.title = title;
    if (description) item.description = description;
    if (category) item.category = category;
    if (location) item.location = location;
    if (date) item.date = date;
    if (tags) item.tags = tags.split(',').map(tag => tag.trim());
    
    // Handle new images
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer, 'items');
        item.images.push({
          url: result.secure_url,
          publicId: result.public_id
        });
      }
    }
    
    await item.save();
    
    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating item'
    });
  }
};

// @desc    Delete item
// @route   DELETE /api/items/:id
exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }
    
    // Check ownership
    if (item.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this item'
      });
    }
    
    // Delete images from Cloudinary
    for (const image of item.images) {
      await deleteFromCloudinary(image.publicId);
    }
    
    await item.deleteOne();
    
    res.json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting item'
    });
  }
};