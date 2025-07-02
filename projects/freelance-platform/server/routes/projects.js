const express = require('express');
const Project = require('../models/Project');
const { auth, requireClient, requireFreelancer } = require('../middleware/auth');
const router = express.Router();

// Get all projects (with filters)
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      skills,
      budgetMin,
      budgetMax,
      experience,
      duration,
      location,
      search,
      sort = 'newest'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter object
    const filter = { status: 'open' };
    
    if (category) filter.category = category;
    if (experience) filter.experience = experience;
    if (duration) filter.duration = duration;
    if (location) filter.location = location;
    
    if (budgetMin || budgetMax) {
      filter['budget.amount'] = {};
      if (budgetMin) filter['budget.amount'].$gte = parseFloat(budgetMin);
      if (budgetMax) filter['budget.amount'].$lte = parseFloat(budgetMax);
    }

    if (skills) {
      const skillsArray = skills.split(',').map(skill => skill.trim());
      filter.skills = { $in: skillsArray };
    }

    if (search) {
      filter.$text = { $search: search };
    }

    // Build sort object
    let sortObj = {};
    switch (sort) {
      case 'budget-high':
        sortObj = { 'budget.amount': -1 };
        break;
      case 'budget-low':
        sortObj = { 'budget.amount': 1 };
        break;
      case 'oldest':
        sortObj = { createdAt: 1 };
        break;
      case 'applications':
        sortObj = { applications: -1 };
        break;
      default:
        sortObj = { createdAt: -1 };
    }

    const [projects, total] = await Promise.all([
      Project.find(filter)
        .populate('client', 'name avatar rating')
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit)),
      Project.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      projects,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Get single project
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('client', 'name avatar rating totalEarnings completedProjects')
      .populate('hiredFreelancer', 'name avatar rating')
      .populate('proposals.freelancer', 'name avatar rating hourlyRate');

    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    // Increment views
    project.views += 1;
    await project.save();

    res.json({ project });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Create new project
router.post('/', auth, requireClient, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      skills,
      budget,
      duration,
      experience,
      projectType,
      location,
      timezone,
      deadline,
      requirements,
      benefits,
      tags,
      attachments
    } = req.body;

    // Validate required fields
    if (!title || !description || !category || !budget || !duration || !experience) {
      return res.status(400).json({ error: 'Please provide all required fields.' });
    }

    const project = new Project({
      title,
      description,
      client: req.user._id,
      category,
      skills: skills || [],
      budget,
      duration,
      experience,
      projectType: projectType || 'one-time',
      location: location || 'remote',
      timezone,
      deadline: deadline ? new Date(deadline) : null,
      requirements: requirements || [],
      benefits: benefits || [],
      tags: tags || [],
      attachments: attachments || []
    });

    await project.save();

    const populatedProject = await project.getPopulatedProject();

    res.status(201).json({
      message: 'Project created successfully.',
      project: populatedProject
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Update project
router.put('/:id', auth, requireClient, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    if (project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this project.' });
    }

    if (project.status !== 'open') {
      return res.status(400).json({ error: 'Cannot update project that is not open.' });
    }

    const updateData = req.body;
    delete updateData.client; // Prevent changing client
    delete updateData.proposals; // Prevent changing proposals
    delete updateData.hiredFreelancer; // Prevent changing hired freelancer

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('client', 'name avatar rating');

    res.json({
      message: 'Project updated successfully.',
      project: updatedProject
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Delete project
router.delete('/:id', auth, requireClient, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    if (project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this project.' });
    }

    if (project.status !== 'open') {
      return res.status(400).json({ error: 'Cannot delete project that is not open.' });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.json({ message: 'Project deleted successfully.' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Submit proposal
router.post('/:id/proposals', auth, requireFreelancer, async (req, res) => {
  try {
    const { coverLetter, proposedAmount, estimatedDuration, attachments } = req.body;

    if (!coverLetter || !proposedAmount || !estimatedDuration) {
      return res.status(400).json({ error: 'Please provide all required fields.' });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    if (!project.isOpenForProposals()) {
      return res.status(400).json({ error: 'Project is not accepting proposals.' });
    }

    // Check if user already submitted a proposal
    const existingProposal = project.proposals.find(
      proposal => proposal.freelancer.toString() === req.user._id.toString()
    );

    if (existingProposal) {
      return res.status(400).json({ error: 'You have already submitted a proposal for this project.' });
    }

    // Add proposal
    project.proposals.push({
      freelancer: req.user._id,
      coverLetter,
      proposedAmount,
      estimatedDuration,
      attachments: attachments || []
    });

    await project.save();
    await project.updateApplicationsCount();

    const populatedProject = await project.getPopulatedProject();

    res.status(201).json({
      message: 'Proposal submitted successfully.',
      project: populatedProject
    });
  } catch (error) {
    console.error('Submit proposal error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Get user's projects
router.get('/user/my-projects', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    
    if (req.user.role === 'client') {
      filter.client = req.user._id;
    } else if (req.user.role === 'freelancer') {
      filter['proposals.freelancer'] = req.user._id;
    }

    if (status) filter.status = status;

    const [projects, total] = await Promise.all([
      Project.find(filter)
        .populate('client', 'name avatar rating')
        .populate('hiredFreelancer', 'name avatar rating')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Project.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      projects,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('Get user projects error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Get project categories
router.get('/categories/list', async (req, res) => {
  try {
    const categories = [
      { value: 'web-development', label: 'Web Development' },
      { value: 'mobile-development', label: 'Mobile Development' },
      { value: 'design', label: 'Design' },
      { value: 'writing', label: 'Writing' },
      { value: 'marketing', label: 'Marketing' },
      { value: 'data-science', label: 'Data Science' },
      { value: 'ai-ml', label: 'AI & Machine Learning' },
      { value: 'consulting', label: 'Consulting' },
      { value: 'translation', label: 'Translation' },
      { value: 'other', label: 'Other' }
    ];

    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router; 