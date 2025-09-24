/**
 * Community Service
 * Handles user contributions, API submissions, reviews, and community features
 */

class CommunityService {
  constructor() {
    this.apiSubmissions = new Map();
    this.apiReviews = new Map();
    this.userContributions = new Map();
    this.communityPosts = new Map();
    this.ratings = new Map();
  }

  /**
   * Submit a new API
   * @param {Object} submissionData - API submission data
   * @returns {Object} Created submission
   */
  submitApi(submissionData) {
    const submissionId = this.generateSubmissionId();
    const submission = {
      id: submissionId,
      userId: submissionData.userId,
      apiData: {
        name: submissionData.name,
        description: submissionData.description,
        category: submissionData.category,
        baseUrl: submissionData.baseUrl,
        authentication: submissionData.authentication,
        cors: submissionData.cors,
        https: submissionData.https,
        documentation: submissionData.documentation,
        features: submissionData.features || [],
        pricing: submissionData.pricing || 'Free',
        rateLimit: submissionData.rateLimit || 'Unknown'
      },
      status: 'pending', // pending, approved, rejected
      submittedAt: new Date().toISOString(),
      reviewedAt: null,
      reviewedBy: null,
      reviewNotes: null,
      votes: 0,
      upvotes: 0,
      downvotes: 0
    };

    this.apiSubmissions.set(submissionId, submission);
    return submission;
  }

  /**
   * Get API submission by ID
   * @param {string} submissionId - Submission ID
   * @returns {Object|null} Submission or null
   */
  getApiSubmission(submissionId) {
    return this.apiSubmissions.get(submissionId) || null;
  }

  /**
   * Get all API submissions
   * @param {string} status - Filter by status (optional)
   * @returns {Array} API submissions
   */
  getApiSubmissions(status = null) {
    const submissions = Array.from(this.apiSubmissions.values());
    if (status) {
      return submissions.filter(sub => sub.status === status);
    }
    return submissions;
  }

  /**
   * Review API submission
   * @param {string} submissionId - Submission ID
   * @param {string} status - Review status (approved, rejected)
   * @param {string} reviewerId - Reviewer user ID
   * @param {string} notes - Review notes
   * @returns {Object|null} Updated submission or null
   */
  reviewApiSubmission(submissionId, status, reviewerId, notes = '') {
    const submission = this.apiSubmissions.get(submissionId);
    if (!submission) return null;

    submission.status = status;
    submission.reviewedAt = new Date().toISOString();
    submission.reviewedBy = reviewerId;
    submission.reviewNotes = notes;

    this.apiSubmissions.set(submissionId, submission);
    return submission;
  }

  /**
   * Vote on API submission
   * @param {string} submissionId - Submission ID
   * @param {string} userId - User ID
   * @param {string} voteType - upvote, downvote, or remove
   * @returns {Object} Updated submission
   */
  voteOnSubmission(submissionId, userId, voteType) {
    const submission = this.apiSubmissions.get(submissionId);
    if (!submission) return null;

    const voteKey = `${submissionId}_${userId}`;
    const existingVote = this.ratings.get(voteKey);

    // Remove existing vote if any
    if (existingVote) {
      if (existingVote === 'upvote') {
        submission.upvotes = Math.max(0, submission.upvotes - 1);
      } else if (existingVote === 'downvote') {
        submission.downvotes = Math.max(0, submission.downvotes - 1);
      }
      this.ratings.delete(voteKey);
    }

    // Add new vote
    if (voteType !== 'remove') {
      this.ratings.set(voteKey, voteType);
      if (voteType === 'upvote') {
        submission.upvotes += 1;
      } else if (voteType === 'downvote') {
        submission.downvotes += 1;
      }
    }

    submission.votes = submission.upvotes - submission.downvotes;
    this.apiSubmissions.set(submissionId, submission);
    return submission;
  }

  /**
   * Submit API review
   * @param {Object} reviewData - Review data
   * @returns {Object} Created review
   */
  submitApiReview(reviewData) {
    const reviewId = this.generateReviewId();
    const review = {
      id: reviewId,
      apiId: reviewData.apiId,
      userId: reviewData.userId,
      rating: reviewData.rating, // 1-5 stars
      title: reviewData.title,
      content: reviewData.content,
      pros: reviewData.pros || [],
      cons: reviewData.cons || [],
      helpful: 0,
      notHelpful: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.apiReviews.set(reviewId, review);
    return review;
  }

  /**
   * Get API reviews
   * @param {string} apiId - API ID
   * @returns {Array} API reviews
   */
  getApiReviews(apiId) {
    return Array.from(this.apiReviews.values())
      .filter(review => review.apiId === apiId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  /**
   * Rate review helpfulness
   * @param {string} reviewId - Review ID
   * @param {string} userId - User ID
   * @param {boolean} helpful - Is helpful
   * @returns {Object} Updated review
   */
  rateReviewHelpfulness(reviewId, userId, helpful) {
    const review = this.apiReviews.get(reviewId);
    if (!review) return null;

    const ratingKey = `review_${reviewId}_${userId}`;
    const existingRating = this.ratings.get(ratingKey);

    // Remove existing rating
    if (existingRating) {
      if (existingRating === 'helpful') {
        review.helpful = Math.max(0, review.helpful - 1);
      } else if (existingRating === 'not_helpful') {
        review.notHelpful = Math.max(0, review.notHelpful - 1);
      }
    }

    // Add new rating
    if (helpful) {
      review.helpful += 1;
      this.ratings.set(ratingKey, 'helpful');
    } else {
      review.notHelpful += 1;
      this.ratings.set(ratingKey, 'not_helpful');
    }

    this.apiReviews.set(reviewId, review);
    return review;
  }

  /**
   * Create community post
   * @param {Object} postData - Post data
   * @returns {Object} Created post
   */
  createCommunityPost(postData) {
    const postId = this.generatePostId();
    const post = {
      id: postId,
      userId: postData.userId,
      title: postData.title,
      content: postData.content,
      category: postData.category, // discussion, question, announcement, showcase
      tags: postData.tags || [],
      likes: 0,
      comments: 0,
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.communityPosts.set(postId, post);
    return post;
  }

  /**
   * Get community posts
   * @param {string} category - Filter by category (optional)
   * @returns {Array} Community posts
   */
  getCommunityPosts(category = null) {
    const posts = Array.from(this.communityPosts.values());
    if (category) {
      return posts.filter(post => post.category === category);
    }
    return posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  /**
   * Like community post
   * @param {string} postId - Post ID
   * @param {string} userId - User ID
   * @returns {Object} Updated post
   */
  likeCommunityPost(postId, userId) {
    const post = this.communityPosts.get(postId);
    if (!post) return null;

    const likeKey = `post_${postId}_${userId}`;
    const existingLike = this.ratings.get(likeKey);

    if (existingLike) {
      // Unlike
      post.likes = Math.max(0, post.likes - 1);
      this.ratings.delete(likeKey);
    } else {
      // Like
      post.likes += 1;
      this.ratings.set(likeKey, 'like');
    }

    this.communityPosts.set(postId, post);
    return post;
  }

  /**
   * Get user contributions
   * @param {string} userId - User ID
   * @returns {Object} User contributions
   */
  getUserContributions(userId) {
    const submissions = Array.from(this.apiSubmissions.values())
      .filter(sub => sub.userId === userId);
    
    const reviews = Array.from(this.apiReviews.values())
      .filter(review => review.userId === userId);
    
    const posts = Array.from(this.communityPosts.values())
      .filter(post => post.userId === userId);

    return {
      submissions: submissions.length,
      reviews: reviews.length,
      posts: posts.length,
      totalVotes: submissions.reduce((sum, sub) => sum + sub.votes, 0),
      totalLikes: posts.reduce((sum, post) => sum + post.likes, 0)
    };
  }

  /**
   * Get community statistics
   * @returns {Object} Community statistics
   */
  getCommunityStats() {
    const submissions = Array.from(this.apiSubmissions.values());
    const reviews = Array.from(this.apiReviews.values());
    const posts = Array.from(this.communityPosts.values());

    return {
      totalSubmissions: submissions.length,
      pendingSubmissions: submissions.filter(sub => sub.status === 'pending').length,
      approvedSubmissions: submissions.filter(sub => sub.status === 'approved').length,
      totalReviews: reviews.length,
      averageRating: reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
        : 0,
      totalPosts: posts.length,
      totalLikes: posts.reduce((sum, post) => sum + post.likes, 0),
      activeUsers: new Set([
        ...submissions.map(sub => sub.userId),
        ...reviews.map(review => review.userId),
        ...posts.map(post => post.userId)
      ]).size
    };
  }

  /**
   * Get top contributors
   * @param {number} limit - Number of contributors to return
   * @returns {Array} Top contributors
   */
  getTopContributors(limit = 10) {
    const userStats = new Map();

    // Count submissions
    Array.from(this.apiSubmissions.values()).forEach(sub => {
      if (!userStats.has(sub.userId)) {
        userStats.set(sub.userId, { userId: sub.userId, submissions: 0, reviews: 0, posts: 0, score: 0 });
      }
      const stats = userStats.get(sub.userId);
      stats.submissions += 1;
      stats.score += sub.votes + 10; // Submissions are worth more
    });

    // Count reviews
    Array.from(this.apiReviews.values()).forEach(review => {
      if (!userStats.has(review.userId)) {
        userStats.set(review.userId, { userId: review.userId, submissions: 0, reviews: 0, posts: 0, score: 0 });
      }
      const stats = userStats.get(review.userId);
      stats.reviews += 1;
      stats.score += review.helpful + 5; // Reviews are worth less
    });

    // Count posts
    Array.from(this.communityPosts.values()).forEach(post => {
      if (!userStats.has(post.userId)) {
        userStats.set(post.userId, { userId: post.userId, submissions: 0, reviews: 0, posts: 0, score: 0 });
      }
      const stats = userStats.get(post.userId);
      stats.posts += 1;
      stats.score += post.likes + 2; // Posts are worth least
    });

    return Array.from(userStats.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Generate submission ID
   * @returns {string} Submission ID
   */
  generateSubmissionId() {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate review ID
   * @returns {string} Review ID
   */
  generateReviewId() {
    return `rev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate post ID
   * @returns {string} Post ID
   */
  generatePostId() {
    return `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Create singleton instance
const communityService = new CommunityService();

module.exports = communityService;
