import axios from 'axios';

export class GitHubProfileAnalyzer {
  constructor(token = null) {
    this.token = token; // Optional GitHub token
    this.baseUrl = 'https://api.github.com';
  }

  // Configure axios with or without authentication
  getAxiosConfig() {
    let config = {
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    };
    
    if (this.token) {
      config.headers['Authorization'] = `token ${this.token}`;
    }
    
    return config;
  }

  // Fetch basic user data
  async fetchUserData(username) {
    try {
      const response = await axios.get(`${this.baseUrl}/users/${username}`, this.getAxiosConfig());
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        throw new Error(`GitHub user ${username} not found`);
      }
      throw new Error(`Error fetching user data: ${error.message}`);
    }
  }

  // Fetch user's repositories
  async fetchRepos(username) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/users/${username}/repos?per_page=100&sort=updated`,
        this.getAxiosConfig()
      );
      return response.data;
    } catch (error) {
      throw new Error(`Error fetching repositories: ${error.message}`);
    }
  }

  // Get contribution statistics
  async fetchContributions(username) {
    try {
      // GitHub API doesn't provide annual contributions directly
      // We'll use the events API to approximate recent activity
      const response = await axios.get(
        `${this.baseUrl}/users/${username}/events?per_page=100`,
        this.getAxiosConfig()
      );
      return response.data;
    } catch (error) {
      console.warn(`Warning: Could not fetch contribution data: ${error.message}`);
      return [];
    }
  }

  // Calculate profile completeness score (0-100)
  calculateProfileCompleteness(userData) {
    let score = 0;
    const maxScore = 5;
    const fields = ['name', 'bio', 'location', 'email', 'blog'];
    
    fields.forEach(field => {
      if (userData[field]) {
        score += 1;
      }
    });
    
    return Math.round((score / maxScore) * 100);
  }

  // Calculate account age in years
  calculateAccountAge(userData) {
    const creationDate = new Date(userData.created_at);
    const now = new Date();
    const ageInMs = now - creationDate;
    const ageInYears = ageInMs / (1000 * 60 * 60 * 24 * 365.25);
    return parseFloat(ageInYears.toFixed(1));
  }

  // Calculate total stars across all repositories
  calculateTotalStars(repos) {
    return repos.reduce((total, repo) => total + repo.stargazers_count, 0);
  }

  // Calculate language diversity (number of unique languages used)
  calculateLanguageDiversity(repos) {
    const languages = new Set();
    
    repos.forEach(repo => {
      if (repo.language) {
        languages.add(repo.language);
      }
    });
    
    return languages.size;
  }

  // Check if user has any popular repositories (10+ stars)
  hasPopularRepos(repos) {
    return repos.some(repo => repo.stargazers_count >= 10);
  }

  // Calculate recent activity score based on events
  calculateRecentActivity(events) {
    if (!events || events.length === 0) return 0;
    
    // Give higher weight to more recent events
    const now = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    let recentActivityScore = 0;
    
    events.forEach(event => {
      const eventDate = new Date(event.created_at);
      if (eventDate >= oneMonthAgo) {
        recentActivityScore += 1;
      }
    });
    
    // Cap at 100
    return Math.min(recentActivityScore, 100);
  }

  // Calculate overall score based on metrics
  calculateScore(metrics, includesPrivateRepos) {
    // Define weights for different metrics
    const weights = {
      profileCompleteness: 0.1,
      followers: 0.15,
      publicRepos: includesPrivateRepos ? 0.05 : 0.15, // Less weight if we have private repos
      privateRepos: includesPrivateRepos ? 0.1 : 0,    // Only count if we have them
      totalStars: 0.2,
      languageDiversity: 0.1,
      hasPopularRepos: 0.1,
      recentActivity: 0.2
    };
    
    // Normalize some metrics to a 0-100 scale
    const normalizedMetrics = {
      profileCompleteness: metrics.profileCompleteness, // Already 0-100
      followers: Math.min(metrics.followers, 1000) / 10, // Cap at 1000 followers (100 points)
      publicRepos: Math.min(metrics.publicRepos, 50) * 2, // Cap at 50 repos (100 points)
      privateRepos: includesPrivateRepos ? Math.min(metrics.privateRepos, 50) * 2 : 0, // Cap at 50 repos
      totalStars: Math.min(metrics.totalStars, 1000) / 10, // Cap at 1000 stars (100 points)
      languageDiversity: Math.min(metrics.languageDiversity, 10) * 10, // Cap at 10 languages (100 points)
      hasPopularRepos: metrics.hasPopularRepos ? 100 : 0, // Boolean to 0 or 100
      recentActivity: metrics.recentActivity || 0 // Already 0-100
    };
    
    // Calculate weighted score
    let totalScore = 0;
    for (const metric in weights) {
      totalScore += normalizedMetrics[metric] * weights[metric];
    }
    
    return parseFloat(totalScore.toFixed(1));
  }

  // Analyze a GitHub profile
  async analyze(username, privateRepoData = null) {
    try {

      const normalizedUsername = username.toLowerCase();

      // Fetch all necessary data
      const userData = await this.fetchUserData(normalizedUsername);
      const repos = await this.fetchRepos(normalizedUsername);
      const contributionData = await this.fetchContributions(normalizedUsername);
      
      // Flag for whether we're including private repos
      const includesPrivateRepos = privateRepoData !== null;
      
      // Prepare metrics object
      const metrics = {
        profileCompleteness: this.calculateProfileCompleteness(userData),
        followers: userData.followers || 0,
        following: userData.following || 0,
        publicRepos: userData.public_repos || 0,
        privateRepos: 0, // Default to 0
        accountAge: this.calculateAccountAge(userData),
        totalStars: this.calculateTotalStars(repos),
        languageDiversity: this.calculateLanguageDiversity(repos),
        hasPopularRepos: this.hasPopularRepos(repos),
        recentActivity: this.calculateRecentActivity(contributionData)
      };
      
      // Include private repository data if available
      if (includesPrivateRepos && privateRepoData) {
        metrics.privateRepos = privateRepoData.totalPrivateRepos || 0;
        
        // Add private stars to total stars (if available)
        if (privateRepoData.totalPrivateStars) {
          metrics.totalStars += privateRepoData.totalPrivateStars;
        }
        
        // Update language diversity to include private repos
        if (privateRepoData.languageStats) {
          const languages = new Set();
          
          // Add languages from public repos
          repos.forEach(repo => {
            if (repo.language) {
              languages.add(repo.language);
            }
          });
          
          // Add languages from private repos
          Object.keys(privateRepoData.languageStats).forEach(lang => {
            languages.add(lang);
          });
          
          metrics.languageDiversity = languages.size;
        }
      }
      
      // Calculate overall score
      const overallScore = this.calculateScore(metrics, includesPrivateRepos);
      
      // Return formatted analysis
      return {
        username: normalizedUsername,
        overallScore,
        metrics: {
          profileCompleteness: metrics.profileCompleteness,
          followers: metrics.followers,
          repositories: metrics.publicRepos + (includesPrivateRepos ? metrics.privateRepos : 0),
          stars: metrics.totalStars,
          languageDiversity: metrics.languageDiversity,
          hasPopularRepos: metrics.hasPopularRepos ? 'Yes' : 'No',
          recentActivity: metrics.recentActivity
        },
        accountDetails: {
          accountAge: `${metrics.accountAge} years`,
          avatarUrl: userData.avatar_url,
          profileUrl: userData.html_url,
          name: userData.name || 'Not provided',
          bio: userData.bio || 'Not provided',
          location: userData.location || 'Not provided'
        },
        includesPrivateRepos
      };
    } catch (error) {
      throw error;
    }
  }
}