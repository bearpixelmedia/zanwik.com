/**
 * Community Routes
 * Routes for API submissions, reviews, and community features
 */

const express = require('express');
const router = express.Router();
const communityService = require('../services/communityService');

// Submit new API
router.post('/apis/submit', async (req, res) => {
  try {
    const submissionData = req.body;
    
    if (!submissionData.name || !submissionData.description || !submissionData.category) {
      return res.status(400).json({
        success: false,
        error: 'Name, description, and category are required'
      });
    }

    const submission = communityService.submitApi(submissionData);
    
    res.status(201).json({
      success: true,
      data: submission
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to submit API'
    });
  }
});

// Get API submissions
router.get('/apis/submissions', async (req, res) => {
  try {
    const { status } = req.query;
    const submissions = communityService.getApiSubmissions(status);
    
    res.json({
      success: true,
      data: submissions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get API submissions'
    });
  }
});

// Get API submission by ID
router.get('/apis/submissions/:submissionId', async (req, res) => {
  try {
    const { submissionId } = req.params;
    const submission = communityService.getApiSubmission(submissionId);
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }
    
    res.json({
      success: true,
      data: submission
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get API submission'
    });
  }
});

// Review API submission
router.post('/apis/submissions/:submissionId/review', async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { status, reviewerId, notes } = req.body;
    
    if (!status || !reviewerId) {
      return res.status(400).json({
        success: false,
        error: 'Status and reviewer ID are required'
      });
    }

    const submission = communityService.reviewApiSubmission(submissionId, status, reviewerId, notes);
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }
    
    res.json({
      success: true,
      data: submission
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to review API submission'
    });
  }
});

// Vote on API submission
router.post('/apis/submissions/:submissionId/vote', async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { userId, voteType } = req.body;
    
    if (!userId || !voteType) {
      return res.status(400).json({
        success: false,
        error: 'User ID and vote type are required'
      });
    }

    const submission = communityService.voteOnSubmission(submissionId, userId, voteType);
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }
    
    res.json({
      success: true,
      data: submission
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to vote on submission'
    });
  }
});

// Submit API review
router.post('/apis/:apiId/reviews', async (req, res) => {
  try {
    const { apiId } = req.params;
    const reviewData = { ...req.body, apiId };
    
    if (!reviewData.userId || !reviewData.rating || !reviewData.title) {
      return res.status(400).json({
        success: false,
        error: 'User ID, rating, and title are required'
      });
    }

    const review = communityService.submitApiReview(reviewData);
    
    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to submit API review'
    });
  }
});

// Get API reviews
router.get('/apis/:apiId/reviews', async (req, res) => {
  try {
    const { apiId } = req.params;
    const reviews = communityService.getApiReviews(apiId);
    
    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get API reviews'
    });
  }
});

// Rate review helpfulness
router.post('/reviews/:reviewId/helpful', async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { userId, helpful } = req.body;
    
    if (userId === undefined || helpful === undefined) {
      return res.status(400).json({
        success: false,
        error: 'User ID and helpful status are required'
      });
    }

    const review = communityService.rateReviewHelpfulness(reviewId, userId, helpful);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }
    
    res.json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to rate review helpfulness'
    });
  }
});

// Create community post
router.post('/posts', async (req, res) => {
  try {
    const postData = req.body;
    
    if (!postData.userId || !postData.title || !postData.content) {
      return res.status(400).json({
        success: false,
        error: 'User ID, title, and content are required'
      });
    }

    const post = communityService.createCommunityPost(postData);
    
    res.status(201).json({
      success: true,
      data: post
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create community post'
    });
  }
});

// Get community posts
router.get('/posts', async (req, res) => {
  try {
    const { category } = req.query;
    const posts = communityService.getCommunityPosts(category);
    
    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get community posts'
    });
  }
});

// Like community post
router.post('/posts/:postId/like', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const post = communityService.likeCommunityPost(postId, userId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }
    
    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to like post'
    });
  }
});

// Get user contributions
router.get('/users/:userId/contributions', async (req, res) => {
  try {
    const { userId } = req.params;
    const contributions = communityService.getUserContributions(userId);
    
    res.json({
      success: true,
      data: contributions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get user contributions'
    });
  }
});

// Get community statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = communityService.getCommunityStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get community statistics'
    });
  }
});

// Get top contributors
router.get('/contributors', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const contributors = communityService.getTopContributors(parseInt(limit));
    
    res.json({
      success: true,
      data: contributors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get top contributors'
    });
  }
});

module.exports = router;
