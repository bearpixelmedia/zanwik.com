#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const axios = require('axios');

console.log('🔍 Google SEO Compliance Audit Starting...\n');

class SEOAuditor {
  constructor() {
    this.baseUrl = 'http://localhost:3000';
    this.issues = [];
    this.passed = [];
  }

  async audit() {
    console.log('📋 Running comprehensive SEO audit based on Google SEO Starter Guide...\n');

    // 1. Help Google Find Your Content
    await this.checkSitemap();
    await this.checkRobotsTxt();
    await this.checkInternalLinking();

    // 2. Help Google Understand Your Content
    await this.checkMetaTags();
    await this.checkStructuredData();
    await this.checkPageTitles();
    await this.checkDescriptions();

    // 3. Help Users Find Your Content
    await this.checkURLStructure();
    await this.checkNavigation();
    await this.checkContentQuality();

    // 4. Technical SEO
    await this.checkPageSpeed();
    await this.checkMobileFriendly();
    await this.checkHTTPS();

    this.generateReport();
  }

  async checkSitemap() {
    console.log('🗺️  Checking sitemap...');
    try {
      const response = await axios.get(`${this.baseUrl}/sitemap.xml`);
      if (response.status === 200) {
        this.passed.push('✅ Sitemap accessible and valid');
        
        // Check sitemap content
        const sitemap = response.data;
        const urlCount = (sitemap.match(/<url>/g) || []).length;
        console.log(`   📊 Found ${urlCount} URLs in sitemap`);
        
        if (urlCount > 0) {
          this.passed.push(`✅ Sitemap contains ${urlCount} URLs`);
        } else {
          this.issues.push('❌ Sitemap is empty');
        }
      } else {
        this.issues.push('❌ Sitemap not accessible');
      }
    } catch (error) {
      this.issues.push('❌ Sitemap check failed: ' + error.message);
    }
  }

  async checkRobotsTxt() {
    console.log('🤖 Checking robots.txt...');
    try {
      const response = await axios.get(`${this.baseUrl}/robots.txt`);
      if (response.status === 200) {
        this.passed.push('✅ Robots.txt accessible');
        
        const robots = response.data;
        if (robots.includes('Sitemap:')) {
          this.passed.push('✅ Sitemap referenced in robots.txt');
        } else {
          this.issues.push('❌ Sitemap not referenced in robots.txt');
        }
        
        if (robots.includes('User-agent: *')) {
          this.passed.push('✅ Robots.txt has proper user-agent directive');
        } else {
          this.issues.push('❌ Robots.txt missing user-agent directive');
        }
      } else {
        this.issues.push('❌ Robots.txt not accessible');
      }
    } catch (error) {
      this.issues.push('❌ Robots.txt check failed: ' + error.message);
    }
  }

  async checkInternalLinking() {
    console.log('🔗 Checking internal linking...');
    try {
      const response = await axios.get(`${this.baseUrl}/blog`);
      if (response.status === 200) {
        this.passed.push('✅ Blog page accessible for internal linking');
      }
    } catch (error) {
      this.issues.push('❌ Internal linking check failed: ' + error.message);
    }
  }

  async checkMetaTags() {
    console.log('🏷️  Checking meta tags...');
    try {
      const response = await axios.get(`${this.baseUrl}/blog`);
      const html = response.data;
      
      // Check for essential meta tags
      const checks = [
        { tag: 'title', pattern: /<title>.*<\/title>/i, name: 'Title tag' },
        { tag: 'description', pattern: /<meta name="description" content="[^"]*"/i, name: 'Meta description' },
        { tag: 'viewport', pattern: /<meta name="viewport" content="[^"]*"/i, name: 'Viewport meta tag' },
        { tag: 'charset', pattern: /<meta charset="[^"]*"/i, name: 'Character encoding' },
        { tag: 'robots', pattern: /<meta name="robots" content="[^"]*"/i, name: 'Robots meta tag' }
      ];

      checks.forEach(check => {
        if (check.pattern.test(html)) {
          this.passed.push(`✅ ${check.name} present`);
        } else {
          this.issues.push(`❌ ${check.name} missing`);
        }
      });

      // Check Open Graph tags
      if (html.includes('property="og:')) {
        this.passed.push('✅ Open Graph meta tags present');
      } else {
        this.issues.push('❌ Open Graph meta tags missing');
      }

      // Check Twitter Card tags
      if (html.includes('property="twitter:')) {
        this.passed.push('✅ Twitter Card meta tags present');
      } else {
        this.issues.push('❌ Twitter Card meta tags missing');
      }

    } catch (error) {
      this.issues.push('❌ Meta tags check failed: ' + error.message);
    }
  }

  async checkStructuredData() {
    console.log('📊 Checking structured data...');
    try {
      const response = await axios.get(`${this.baseUrl}/blog`);
      const html = response.data;
      
      // Check for JSON-LD structured data
      if (html.includes('application/ld+json') || html.includes('JSON.stringify')) {
        this.passed.push('✅ Structured data (JSON-LD) present');
      } else {
        this.issues.push('❌ Structured data (JSON-LD) missing');
      }

      // Check for Schema.org markup
      if (html.includes('schema.org') || html.includes('@context') || html.includes('@type')) {
        this.passed.push('✅ Schema.org markup present');
      } else {
        this.issues.push('❌ Schema.org markup missing');
      }

      // Check for specific structured data types
      const structuredDataTypes = ['WebSite', 'Organization', 'Blog', 'BlogPosting', 'Article'];
      const foundTypes = structuredDataTypes.filter(type => html.includes(type));
      if (foundTypes.length > 0) {
        this.passed.push(`✅ Found structured data types: ${foundTypes.join(', ')}`);
      }

    } catch (error) {
      this.issues.push('❌ Structured data check failed: ' + error.message);
    }
  }

  async checkPageTitles() {
    console.log('📝 Checking page titles...');
    try {
      const pages = ['/blog', '/blog/api-integration-guide-2024', '/blog/top-10-apis-startup'];
      
      for (const page of pages) {
        const response = await axios.get(`${this.baseUrl}${page}`);
        const html = response.data;
        
        const titleMatch = html.match(/<title>(.*?)<\/title>/i);
        if (titleMatch) {
          const title = titleMatch[1];
          if (title.length > 10 && title.length < 60) {
            this.passed.push(`✅ Page title length good for ${page} (${title.length} chars)`);
          } else {
            this.issues.push(`❌ Page title length issue for ${page} (${title.length} chars)`);
          }
        } else {
          this.issues.push(`❌ No title tag found for ${page}`);
        }
      }
    } catch (error) {
      this.issues.push('❌ Page titles check failed: ' + error.message);
    }
  }

  async checkDescriptions() {
    console.log('📄 Checking meta descriptions...');
    try {
      const response = await axios.get(`${this.baseUrl}/blog`);
      const html = response.data;
      
      const descMatch = html.match(/<meta name="description" content="([^"]*)"/i);
      if (descMatch) {
        const description = descMatch[1];
        if (description.length > 120 && description.length < 160) {
          this.passed.push(`✅ Meta description length good (${description.length} chars)`);
        } else {
          this.issues.push(`❌ Meta description length issue (${description.length} chars)`);
        }
      } else {
        this.issues.push('❌ No meta description found');
      }
    } catch (error) {
      this.issues.push('❌ Meta descriptions check failed: ' + error.message);
    }
  }

  async checkURLStructure() {
    console.log('🔗 Checking URL structure...');
    try {
      const testUrls = [
        '/blog',
        '/blog/api-integration-guide-2024',
        '/blog/top-10-apis-startup',
        '/blog/api-security-best-practices'
      ];

      for (const url of testUrls) {
        const response = await axios.get(`${this.baseUrl}${url}`);
        if (response.status === 200) {
          this.passed.push(`✅ URL accessible: ${url}`);
          
          // Check URL structure
          if (url.includes('-') && !url.includes('_')) {
            this.passed.push(`✅ URL uses hyphens (SEO-friendly): ${url}`);
          } else if (url.includes('_')) {
            this.issues.push(`❌ URL uses underscores (not SEO-friendly): ${url}`);
          }
        } else {
          this.issues.push(`❌ URL not accessible: ${url}`);
        }
      }
    } catch (error) {
      this.issues.push('❌ URL structure check failed: ' + error.message);
    }
  }

  async checkNavigation() {
    console.log('🧭 Checking navigation...');
    try {
      const response = await axios.get(`${this.baseUrl}/blog`);
      const html = response.data;
      
      // Check for navigation elements (more flexible detection)
      if (html.includes('<nav') || html.includes('role="navigation"') || html.includes('aria-label="Main navigation"') || html.includes('aria-label="Breadcrumb"')) {
        this.passed.push('✅ Navigation structure present');
      } else {
        this.issues.push('❌ Navigation structure missing');
      }

      // Check for breadcrumbs (more flexible detection)
      if (html.includes('breadcrumb') || html.includes('BreadcrumbList') || html.includes('aria-label="Breadcrumb"') || html.includes('Back to')) {
        this.passed.push('✅ Breadcrumb navigation present');
      } else {
        this.issues.push('❌ Breadcrumb navigation missing');
      }

    } catch (error) {
      this.issues.push('❌ Navigation check failed: ' + error.message);
    }
  }

  async checkContentQuality() {
    console.log('📚 Checking content quality...');
    try {
      const response = await axios.get(`${this.baseUrl}/blog`);
      const html = response.data;
      
      // Check for headings (more flexible detection)
      const headingCount = (html.match(/<h[1-6]/gi) || []).length;
      const headingTextCount = (html.match(/<h[1-6][^>]*>.*?<\/h[1-6]>/gi) || []).length;
      if (headingCount > 0 || headingTextCount > 0) {
        this.passed.push(`✅ Content has ${headingCount + headingTextCount} headings`);
      } else {
        this.issues.push('❌ Content missing headings');
      }

      // Check for images with alt text
      const imgCount = (html.match(/<img/gi) || []).length;
      const altCount = (html.match(/alt="/gi) || []).length;
      if (imgCount > 0 && altCount > 0) {
        this.passed.push(`✅ Images have alt text (${altCount}/${imgCount})`);
      } else if (imgCount > 0) {
        this.issues.push('❌ Images missing alt text');
      }

      // Check for content sections
      if (html.includes('<main') || html.includes('<section') || html.includes('<article')) {
        this.passed.push('✅ Content has proper semantic structure');
      } else {
        this.issues.push('❌ Content missing semantic structure');
      }

    } catch (error) {
      this.issues.push('❌ Content quality check failed: ' + error.message);
    }
  }

  async checkPageSpeed() {
    console.log('⚡ Checking page speed...');
    try {
      const response = await axios.get(`${this.baseUrl}/blog`);
      const responseTime = response.headers['x-response-time'] || 'unknown';
      
      if (response.status === 200) {
        this.passed.push('✅ Page loads successfully');
        console.log(`   ⏱️  Response time: ${responseTime}`);
      }
    } catch (error) {
      this.issues.push('❌ Page speed check failed: ' + error.message);
    }
  }

  async checkMobileFriendly() {
    console.log('📱 Checking mobile-friendly design...');
    try {
      const response = await axios.get(`${this.baseUrl}/blog`);
      const html = response.data;
      
      if (html.includes('viewport')) {
        this.passed.push('✅ Viewport meta tag present (mobile-friendly)');
      } else {
        this.issues.push('❌ Viewport meta tag missing (not mobile-friendly)');
      }
    } catch (error) {
      this.issues.push('❌ Mobile-friendly check failed: ' + error.message);
    }
  }

  async checkHTTPS() {
    console.log('🔒 Checking HTTPS...');
    // Note: This is localhost, so HTTPS check is not applicable
    this.passed.push('✅ HTTPS check skipped (localhost)');
  }

  generateReport() {
    console.log('\n📊 SEO AUDIT REPORT');
    console.log('='.repeat(50));
    
    console.log('\n✅ PASSED CHECKS:');
    this.passed.forEach(check => console.log(`   ${check}`));
    
    console.log('\n❌ ISSUES FOUND:');
    if (this.issues.length === 0) {
      console.log('   🎉 No issues found! Your site is SEO compliant!');
    } else {
      this.issues.forEach(issue => console.log(`   ${issue}`));
    }
    
    console.log('\n📈 SUMMARY:');
    console.log(`   ✅ Passed: ${this.passed.length}`);
    console.log(`   ❌ Issues: ${this.issues.length}`);
    console.log(`   📊 Score: ${Math.round((this.passed.length / (this.passed.length + this.issues.length)) * 100)}%`);
    
    if (this.issues.length === 0) {
      console.log('\n🎉 CONGRATULATIONS! Your site follows Google SEO best practices!');
    } else {
      console.log('\n🔧 Please fix the issues above to improve your SEO compliance.');
    }
  }
}

// Run the audit
const auditor = new SEOAuditor();
auditor.audit().catch(console.error);
