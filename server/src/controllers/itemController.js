const Item = require('../models/Item');
const cloudinary = require('../config/cloudinary');
const fs = require('fs').promises;

// @desc    Get all items with filters
// @route   GET /api/items
// @access  Public
exports.getItems = async (req, res) => {
  try {
    const {
      search,
      type,
      category,
      status,
      location,
      startDate,
      endDate,
      page = 1,
      limit = 12
    } = req.query;

    // Build query
    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (type) query.type = type;
    if (category) query.category = category;
    if (status) query.status = status;
    if (location) query.location = { $regex: location, $options: 'i' };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Execute query with pagination
    const items = await Item.find(query)
      .populate('userId', 'name email picture')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await Item.countDocuments(query);

    res.json({
      success: true,
      data: items,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching items'
    });
  }
};

// @desc    Get single item
// @route   GET /api/items/:id
// @access  Public
exports.getItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('userId', 'name email picture');

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
    console.error('Get item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching item'
    });
  }
};

// @desc    Create new item
// @route   POST /api/items
// @access  Private
exports.createItem = async (req, res) => {
  try {
    const { title, description, type, category, location, date, tags } = req.body;

    // Upload images to Cloudinary
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'klh-lost-found/items',
            transformation: [
              { width: 800, height: 800, crop: 'limit' },
              { quality: 'auto' }
            ]
          });

          imageUrls.push({
            url: result.secure_url,
            publicId: result.public_id
          });

          // Delete local file
          await fs.unlink(file.path);
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
        }
      }
    }

    // Parse tags
    let parsedTags = [];
    if (tags) {
      parsedTags = typeof tags === 'string' 
        ? tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        : tags;
    }

    const item = await Item.create({
      userId: req.user._id,
      title,
      description,
      type,
      category,
      location,
      date: new Date(date),
      tags: parsedTags,
      images: imageUrls,
      status: 'active'
    });

    const populatedItem = await Item.findById(item._id)
      .populate('userId', 'name email picture');

    res.status(201).json({
      success: true,
      data: populatedItem,
      message: 'Item created successfully'
    });
  } catch (error) {
    console.error('Create item error:', error);
    
    // Clean up uploaded files on error
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          await fs.unlink(file.path);
        } catch (unlinkError) {
          console.error('File cleanup error:', unlinkError);
        }
      }
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Error creating item'
    });
  }
};

// @desc    Update item
// @route   PUT /api/items/:id
// @access  Private
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
    if (item.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this item'
      });
    }

    const { title, description, category, location, date, tags, status } = req.body;

    // Parse tags
    let parsedTags = item.tags;
    if (tags) {
      parsedTags = typeof tags === 'string'
        ? tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        : tags;
    }

    // Update fields
    item.title = title || item.title;
    item.description = description || item.description;
    item.category = category || item.category;
    item.location = location || item.location;
    item.date = date ? new Date(date) : item.date;
    item.tags = parsedTags;
    item.status = status || item.status;

    // Handle new images
    if (req.files && req.files.length > 0) {
      const imageUrls = [];
      for (const file of req.files) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'klh-lost-found/items',
            transformation: [
              { width: 800, height: 800, crop: 'limit' },
              { quality: 'auto' }
            ]
          });

          imageUrls.push({
            url: result.secure_url,
            publicId: result.public_id
          });

          await fs.unlink(file.path);
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
        }
      }

      item.images = [...item.images, ...imageUrls];
    }

    await item.save();

    const updatedItem = await Item.findById(item._id)
      .populate('userId', 'name email picture');

    res.json({
      success: true,
      data: updatedItem,
      message: 'Item updated successfully'
    });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating item'
    });
  }
};

// @desc    Delete item
// @route   DELETE /api/items/:id
// @access  Private
exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Check ownership or admin
    if (item.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this item'
      });
    }

    // Delete images from Cloudinary
    if (item.images && item.images.length > 0) {
      for (const image of item.images) {
        try {
          await cloudinary.uploader.destroy(image.publicId);
        } catch (deleteError) {
          console.error('Image deletion error:', deleteError);
        }
      }
    }

    await item.deleteOne();

    res.json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting item'
    });
  }
};

// @desc    Get user's items
// @route   GET /api/items/my/items
// @access  Private
exports.getMyItems = async (req, res) => {
  try {
    const items = await Item.find({ userId: req.user._id })
      .populate('userId', 'name email picture')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: items
    });
  } catch (error) {
    console.error('Get my items error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching your items'
    });
  }
};

// @desc    Get recent items
// @route   GET /api/items/recent
// @access  Public
exports.getRecentItems = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;

    const items = await Item.find({ status: 'active' })
      .populate('userId', 'name email picture')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({
      success: true,
      data: items
    });
  } catch (error) {
    console.error('Get recent items error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent items'
    });
  }
};

// @desc    Get statistics
// @route   GET /api/items/stats
// @access  Public
exports.getStats = async (req, res) => {
  try {
    const [total, lost, found, resolved] = await Promise.all([
      Item.countDocuments(),
      Item.countDocuments({ type: 'lost' }),
      Item.countDocuments({ type: 'found' }),
      Item.countDocuments({ status: 'resolved' })
    ]);

    res.json({
      success: true,
      data: {
        total,
        lost,
        found,
        resolved
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics'
    });
  }
};