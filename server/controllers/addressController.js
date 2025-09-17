const Address = require('../models/Address');

// @desc    Get all addresses for a user
// @route   GET /api/addresses
// @access  Private
exports.getUserAddresses = async (req, res) => {
  try {
    const userId = req.user._id;
    const addresses = await Address.findByUser(userId);

    res.json({
      success: true,
      data: { addresses: addresses.map(addr => addr.getPublicData()) }
    });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching addresses' });
  }
};

// @desc    Get default address for a user
// @route   GET /api/addresses/default
// @access  Private
exports.getDefaultAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const address = await Address.findDefaultByUser(userId);

    if (!address) {
      return res.json({
        success: true,
        data: { address: null }
      });
    }

    res.json({
      success: true,
      data: { address: address.getPublicData() }
    });
  } catch (error) {
    console.error('Error fetching default address:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching default address' });
  }
};

// @desc    Get address by ID
// @route   GET /api/addresses/:id
// @access  Private
exports.getAddressById = async (req, res) => {
  try {
    const userId = req.user._id;
    const addressId = req.params.id;

    // Find address and verify ownership
    const address = await Address.findOne({ _id: addressId, user: userId });
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found or you do not have permission to view it'
      });
    }

    res.json({
      success: true,
      data: { address: address.getPublicData() }
    });
  } catch (error) {
    console.error('Error fetching address by ID:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching address' });
  }
};

// @desc    Create new address
// @route   POST /api/addresses
// @access  Private
exports.createAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      name,
      fullName,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      isDefault
    } = req.body;

    // Validate required fields
    if (!name || !fullName || !email || !phone || !address || !city || !state || !pincode) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, fullName, email, phone, address, city, state, pincode'
      });
    }

    // Check if address name already exists for this user
    const existingAddress = await Address.findOne({ user: userId, name: name });
    if (existingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Address name already exists. Please choose a different name.'
      });
    }

    // Create new address
    const newAddress = new Address({
      user: userId,
      name,
      fullName,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      isDefault: isDefault || false
    });

    await newAddress.save();

    res.status(201).json({
      success: true,
      message: 'Address created successfully',
      data: { address: newAddress.getPublicData() }
    });
  } catch (error) {
    console.error('Error creating address:', error);
    console.error('Error stack:', error.stack);
    
    // Handle specific MongoDB validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Address name already exists for this user'
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error during address creation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update address
// @route   PUT /api/addresses/:id
// @access  Private
exports.updateAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const addressId = req.params.id;
    const updateData = req.body;

    // Find address and verify ownership
    const address = await Address.findOne({ _id: addressId, user: userId });
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found or you do not have permission to update it'
      });
    }

    // Check if new name conflicts with existing addresses (if name is being updated)
    if (updateData.name && updateData.name !== address.name) {
      const existingAddress = await Address.findOne({ 
        user: userId, 
        name: updateData.name,
        _id: { $ne: addressId }
      });
      if (existingAddress) {
        return res.status(400).json({
          success: false,
          message: 'Address name already exists. Please choose a different name.'
        });
      }
    }

    // Update address
    Object.assign(address, updateData);
    await address.save();

    res.json({
      success: true,
      message: 'Address updated successfully',
      data: { address: address.getPublicData() }
    });
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ success: false, message: 'Server error during address update' });
  }
};

// @desc    Delete address
// @route   DELETE /api/addresses/:id
// @access  Private
exports.deleteAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const addressId = req.params.id;

    // Find address and verify ownership
    const address = await Address.findOne({ _id: addressId, user: userId });
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found or you do not have permission to delete it'
      });
    }

    await Address.findByIdAndDelete(addressId);

    res.json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({ success: false, message: 'Server error during address deletion' });
  }
};

// @desc    Set default address
// @route   PUT /api/addresses/:id/default
// @access  Private
exports.setDefaultAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const addressId = req.params.id;

    // Find address and verify ownership
    const address = await Address.findOne({ _id: addressId, user: userId });
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found or you do not have permission to modify it'
      });
    }

    // Set this address as default (the pre-save hook will handle unsetting others)
    address.isDefault = true;
    await address.save();

    res.json({
      success: true,
      message: 'Default address updated successfully',
      data: { address: address.getPublicData() }
    });
  } catch (error) {
    console.error('Error setting default address:', error);
    res.status(500).json({ success: false, message: 'Server error during default address update' });
  }
};
