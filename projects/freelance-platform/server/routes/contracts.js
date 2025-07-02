const express = require('express');
const Contract = require('../models/Contract');
const Project = require('../models/Project');
const { auth, requireClient, requireFreelancer } = require('../middleware/auth');
const router = express.Router();

// Get user's contracts
router.get('/', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    
    if (req.user.role === 'client') {
      filter.client = req.user._id;
    } else if (req.user.role === 'freelancer') {
      filter.freelancer = req.user._id;
    }

    if (status) filter.status = status;

    const [contracts, total] = await Promise.all([
      Contract.find(filter)
        .populate('project', 'title description')
        .populate('client', 'name avatar rating')
        .populate('freelancer', 'name avatar rating hourlyRate')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Contract.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      contracts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('Get contracts error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Get single contract
router.get('/:id', auth, async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('project', 'title description')
      .populate('client', 'name avatar rating')
      .populate('freelancer', 'name avatar rating hourlyRate')
      .populate('communication.messages.sender', 'name avatar')
      .populate('files.uploadedBy', 'name')
      .populate('disputes.raisedBy', 'name')
      .populate('disputes.resolvedBy', 'name');

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found.' });
    }

    // Check if user has access to this contract
    if (contract.client.toString() !== req.user._id.toString() && 
        contract.freelancer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to view this contract.' });
    }

    res.json({ contract });
  } catch (error) {
    console.error('Get contract error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Create contract (hire freelancer)
router.post('/', auth, requireClient, async (req, res) => {
  try {
    const { projectId, freelancerId, terms, startDate, endDate } = req.body;

    if (!projectId || !freelancerId || !terms || !startDate) {
      return res.status(400).json({ error: 'Please provide all required fields.' });
    }

    // Check if project exists and belongs to client
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    if (project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to hire for this project.' });
    }

    if (project.status !== 'open') {
      return res.status(400).json({ error: 'Project is not open for hiring.' });
    }

    // Check if freelancer has submitted a proposal
    const proposal = project.proposals.find(
      p => p.freelancer.toString() === freelancerId && p.status === 'pending'
    );

    if (!proposal) {
      return res.status(400).json({ error: 'Freelancer has not submitted a valid proposal.' });
    }

    // Check if contract already exists
    const existingContract = await Contract.findOne({
      project: projectId,
      freelancer: freelancerId,
      status: { $in: ['draft', 'pending', 'active'] }
    });

    if (existingContract) {
      return res.status(400).json({ error: 'Contract already exists for this project and freelancer.' });
    }

    // Create contract
    const contract = new Contract({
      project: projectId,
      client: req.user._id,
      freelancer: freelancerId,
      title: project.title,
      description: project.description,
      terms,
      budget: {
        type: project.budget.type,
        amount: proposal.proposedAmount,
        currency: 'USD'
      },
      hourlyRate: proposal.proposedAmount / 160, // Assuming 160 hours per month
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      status: 'pending'
    });

    await contract.save();

    // Update project status and hired freelancer
    project.status = 'in-progress';
    project.hiredFreelancer = freelancerId;
    project.hiredAt = new Date();
    await project.save();

    // Update proposal status
    proposal.status = 'accepted';
    await project.save();

    const populatedContract = await contract.getPopulatedContract();

    res.status(201).json({
      message: 'Contract created successfully.',
      contract: populatedContract
    });
  } catch (error) {
    console.error('Create contract error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Update contract status
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required.' });
    }

    const contract = await Contract.findById(req.params.id);

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found.' });
    }

    // Check authorization
    if (contract.client.toString() !== req.user._id.toString() && 
        contract.freelancer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this contract.' });
    }

    // Validate status transition
    const validTransitions = {
      'pending': ['active', 'cancelled'],
      'active': ['paused', 'completed', 'disputed'],
      'paused': ['active', 'cancelled'],
      'completed': [],
      'cancelled': [],
      'disputed': ['active', 'cancelled']
    };

    if (!validTransitions[contract.status].includes(status)) {
      return res.status(400).json({ error: 'Invalid status transition.' });
    }

    contract.status = status;

    if (status === 'completed') {
      contract.completedAt = new Date();
    }

    await contract.save();

    const populatedContract = await contract.getPopulatedContract();

    res.json({
      message: 'Contract status updated successfully.',
      contract: populatedContract
    });
  } catch (error) {
    console.error('Update contract status error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Add time tracking entry
router.post('/:id/time-tracking', auth, requireFreelancer, async (req, res) => {
  try {
    const { date, hours, description } = req.body;

    if (!date || !hours || hours <= 0) {
      return res.status(400).json({ error: 'Please provide valid date and hours.' });
    }

    const contract = await Contract.findById(req.params.id);

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found.' });
    }

    if (contract.freelancer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to add time tracking.' });
    }

    if (contract.status !== 'active') {
      return res.status(400).json({ error: 'Contract must be active to add time tracking.' });
    }

    // Check if entry already exists for this date
    const existingEntry = contract.timeTracking.find(
      entry => entry.date.toDateString() === new Date(date).toDateString()
    );

    if (existingEntry) {
      return res.status(400).json({ error: 'Time tracking entry already exists for this date.' });
    }

    contract.timeTracking.push({
      date: new Date(date),
      hours,
      description: description || ''
    });

    await contract.save();
    await contract.calculateTotalHours();

    const populatedContract = await contract.getPopulatedContract();

    res.json({
      message: 'Time tracking entry added successfully.',
      contract: populatedContract
    });
  } catch (error) {
    console.error('Add time tracking error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Approve time tracking entry
router.put('/:id/time-tracking/:entryId/approve', auth, requireClient, async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found.' });
    }

    if (contract.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to approve time tracking.' });
    }

    const entry = contract.timeTracking.id(req.params.entryId);
    if (!entry) {
      return res.status(404).json({ error: 'Time tracking entry not found.' });
    }

    if (entry.isApproved) {
      return res.status(400).json({ error: 'Entry is already approved.' });
    }

    entry.isApproved = true;
    entry.approvedAt = new Date();
    entry.approvedBy = req.user._id;

    await contract.save();
    await contract.calculateTotalHours();

    const populatedContract = await contract.getPopulatedContract();

    res.json({
      message: 'Time tracking entry approved successfully.',
      contract: populatedContract
    });
  } catch (error) {
    console.error('Approve time tracking error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Add message to contract communication
router.post('/:id/messages', auth, async (req, res) => {
  try {
    const { message, attachments } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const contract = await Contract.findById(req.params.id);

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found.' });
    }

    // Check if user is part of this contract
    if (contract.client.toString() !== req.user._id.toString() && 
        contract.freelancer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to send messages.' });
    }

    await contract.addMessage(req.user._id, message, attachments || []);

    const populatedContract = await contract.getPopulatedContract();

    res.json({
      message: 'Message sent successfully.',
      contract: populatedContract
    });
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Upload file to contract
router.post('/:id/files', auth, async (req, res) => {
  try {
    const { filename, url, size, description } = req.body;

    if (!filename || !url) {
      return res.status(400).json({ error: 'Filename and URL are required.' });
    }

    const contract = await Contract.findById(req.params.id);

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found.' });
    }

    // Check if user is part of this contract
    if (contract.client.toString() !== req.user._id.toString() && 
        contract.freelancer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to upload files.' });
    }

    contract.files.push({
      filename,
      url,
      size: size || 0,
      uploadedBy: req.user._id,
      description: description || ''
    });

    await contract.save();

    const populatedContract = await contract.getPopulatedContract();

    res.json({
      message: 'File uploaded successfully.',
      contract: populatedContract
    });
  } catch (error) {
    console.error('Upload file error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Submit review
router.post('/:id/review', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Please provide a valid rating (1-5).' });
    }

    const contract = await Contract.findById(req.params.id);

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found.' });
    }

    // Check if user is part of this contract
    if (contract.client.toString() !== req.user._id.toString() && 
        contract.freelancer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to submit review.' });
    }

    if (contract.status !== 'completed') {
      return res.status(400).json({ error: 'Contract must be completed to submit review.' });
    }

    // Determine which review to update
    const reviewField = contract.client.toString() === req.user._id.toString() 
      ? 'clientReview' 
      : 'freelancerReview';

    if (contract.reviews[reviewField].rating) {
      return res.status(400).json({ error: 'Review already submitted.' });
    }

    contract.reviews[reviewField] = {
      rating,
      comment: comment || '',
      submittedAt: new Date()
    };

    await contract.save();

    const populatedContract = await contract.getPopulatedContract();

    res.json({
      message: 'Review submitted successfully.',
      contract: populatedContract
    });
  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router; 