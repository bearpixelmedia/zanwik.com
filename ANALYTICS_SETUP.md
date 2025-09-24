# 📊 Analytics Setup for Content Marketing

## 🎯 **Google Analytics 4 (GA4) Configuration**

### **Enhanced Ecommerce Tracking**
```javascript
// Add to client/src/utils/analytics.js
export const trackBlogPostView = (postTitle, postSlug, category) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'blog_post_view', {
      post_title: postTitle,
      post_slug: postSlug,
      post_category: category,
      content_type: 'blog_post'
    });
  }
};

export const trackSocialShare = (platform, postTitle) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'social_share', {
      platform: platform,
      post_title: postTitle,
      content_type: 'blog_post'
    });
  }
};

export const trackContentEngagement = (action, postTitle, timeSpent) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'content_engagement', {
      action: action, // 'scroll', 'click', 'read_complete'
      post_title: postTitle,
      time_spent: timeSpent,
      content_type: 'blog_post'
    });
  }
};
```

### **Custom Events for Blog Posts**
```javascript
// Add to each blog post component
useEffect(() => {
  trackBlogPostView(postData.title, postData.slug, postData.category);
  
  // Track scroll depth
  const handleScroll = () => {
    const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
    if (scrollPercent > 25 && !tracked25) {
      trackContentEngagement('scroll_25', postData.title, Date.now() - startTime);
      setTracked25(true);
    }
    if (scrollPercent > 50 && !tracked50) {
      trackContentEngagement('scroll_50', postData.title, Date.now() - startTime);
      setTracked50(true);
    }
    if (scrollPercent > 75 && !tracked75) {
      trackContentEngagement('scroll_75', postData.title, Date.now() - startTime);
      setTracked75(true);
    }
  };
  
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);
```

## 📱 **Social Media Analytics**

### **LinkedIn Analytics**
- Track post views, likes, comments, shares
- Monitor click-through rates to blog posts
- Measure engagement rate and reach

### **Twitter Analytics**
- Track impressions, engagements, link clicks
- Monitor hashtag performance
- Measure thread engagement

### **Reddit Analytics**
- Track upvotes, comments, saves
- Monitor post performance in different subreddits
- Measure community engagement

## 📊 **Content Performance Dashboard**

### **Key Metrics to Track**
1. **Traffic Sources**
   - Direct traffic
   - Social media referrals
   - Search engine traffic
   - Referral traffic

2. **Content Performance**
   - Page views per blog post
   - Average time on page
   - Bounce rate
   - Scroll depth

3. **Engagement Metrics**
   - Social shares
   - Comments
   - Backlinks
   - Email signups

4. **Conversion Metrics**
   - Blog to API directory visits
   - Newsletter signups
   - Contact form submissions

## 🎯 **Conversion Tracking**

### **Goal Setup in GA4**
```javascript
// Track blog post conversions
gtag('event', 'conversion', {
  send_to: 'AW-CONVERSION_ID/CONVERSION_LABEL',
  value: 1.0,
  currency: 'USD',
  transaction_id: 'blog_post_' + postSlug
});
```

### **UTM Parameters for Social Media**
- LinkedIn: `?utm_source=linkedin&utm_medium=social&utm_campaign=blog_promotion`
- Twitter: `?utm_source=twitter&utm_medium=social&utm_campaign=blog_promotion`
- Reddit: `?utm_source=reddit&utm_medium=social&utm_campaign=blog_promotion`

## 📈 **Weekly Reporting**

### **Monday Morning Reports**
- Previous week's traffic summary
- Top performing content
- Social media engagement
- Conversion rates
- Action items for the week

### **Monthly Analysis**
- Content performance trends
- Audience growth
- Traffic source analysis
- ROI on content marketing efforts
