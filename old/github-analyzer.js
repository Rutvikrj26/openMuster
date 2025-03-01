const axios = require('axios');

class GitHubProfileAnalyzer {
  constructor(username, token = null) {
    this.username = username;
    this.token = token; // Optional GitHub personal access token for higher rate limits
    this.baseUrl = 'https://api.github.com';
    this.userData = null;
    this.repos = [];
    this.contributionData = null;
    this.metrics = {};
    this.score = 0;
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
  async fetchUserData() {
    try {
      const response = await axios.get(`${this.baseUrl}/users/${this.username}`, this.getAxiosConfig());
      this.userData = response.data;
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        throw new Error(`GitHub user ${this.username} not found`);
      }
      throw new Error(`Error fetching user data: ${error.message}`);
    }
  }

  // Fetch user's repositories
  async fetchRepos() {
    try {
      const response = await axios.get(
        `${this.baseUrl}/users/${this.username}/repos?per_page=100&sort=updated`,
        this.getAxiosConfig()
      );
      this.repos = response.data;
      return response.data;
    } catch (error) {
      throw new Error(`Error fetching repositories: ${error.message}`);
    }
  }

  // Get contribution statistics (requires parsing from events)
  async fetchContributions() {
    try {
      // GitHub API doesn't provide annual contributions directly
      // We'll use the events API to approximate recent activity
      const response = await axios.get(
        `${this.baseUrl}/users/${this.username}/events?per_page=100`,
        this.getAxiosConfig()
      );
      this.contributionData = response.data;
      return response.data;
    } catch (error) {
      // Make this non-fatal since some users might have private activity
      console.warn(`Warning: Could not fetch contribution data: ${error.message}`);
      return [];
    }
  }

  // Calculate metrics from the fetched data
  calculateMetrics() {
    if (!this.userData || !this.repos) {
      throw new Error('User data or repos not fetched yet');
    }

    // Basic profile metrics
    this.metrics.profileCompleteness = this.calculateProfileCompleteness();
    this.metrics.followers = this.userData.followers || 0;
    this.metrics.following = this.userData.following || 0;
    this.metrics.publicRepos = this.userData.public_repos || 0;
    this.metrics.accountAge = this.calculateAccountAge();

    // Repository metrics
    this.metrics.totalStars = this.calculateTotalStars();
    this.metrics.totalForks = this.calculateTotalForks();
    this.metrics.averageRepoSize = this.calculateAverageRepoSize();
    this.metrics.languageDiversity = this.calculateLanguageDiversity();
    this.metrics.hasPopularRepos = this.hasPopularRepos();
    
    // Contribution metrics
    if (this.contributionData) {
      this.metrics.recentActivity = this.calculateRecentActivity();
    }

    return this.metrics;
  }

  // Calculate profile completeness score (0-100)
  calculateProfileCompleteness() {
    let score = 0;
    const maxScore = 5;
    const fields = ['name', 'bio', 'location', 'email', 'blog'];
    
    fields.forEach(field => {
      if (this.userData[field]) {
        score += 1;
      }
    });
    
    return Math.round((score / maxScore) * 100);
  }

  // Calculate account age in years
  calculateAccountAge() {
    const creationDate = new Date(this.userData.created_at);
    const now = new Date();
    const ageInMs = now - creationDate;
    const ageInYears = ageInMs / (1000 * 60 * 60 * 24 * 365.25);
    return parseFloat(ageInYears.toFixed(1));
  }

  // Calculate total stars across all repositories
  calculateTotalStars() {
    return this.repos.reduce((total, repo) => total + repo.stargazers_count, 0);
  }

  // Calculate total forks across all repositories
  calculateTotalForks() {
    return this.repos.reduce((total, repo) => total + repo.forks_count, 0);
  }

  // Calculate average repository size in KB
  calculateAverageRepoSize() {
    if (this.repos.length === 0) return 0;
    const totalSize = this.repos.reduce((total, repo) => total + repo.size, 0);
    return Math.round(totalSize / this.repos.length);
  }

  // Calculate language diversity (number of unique languages used)
  calculateLanguageDiversity() {
    const languages = new Set();
    
    this.repos.forEach(repo => {
      if (repo.language) {
        languages.add(repo.language);
      }
    });
    
    return languages.size;
  }

  // Check if user has any popular repositories (10+ stars)
  hasPopularRepos() {
    return this.repos.some(repo => repo.stargazers_count >= 10);
  }

  // Calculate recent activity score based on events
  calculateRecentActivity() {
    if (!this.contributionData || this.contributionData.length === 0) return 0;
    
    // Give higher weight to more recent events
    const now = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    let recentActivityScore = 0;
    
    this.contributionData.forEach(event => {
      const eventDate = new Date(event.created_at);
      if (eventDate >= oneMonthAgo) {
        recentActivityScore += 1;
      }
    });
    
    // Cap at 100
    return Math.min(recentActivityScore, 100);
  }

  // Calculate overall score based on metrics
  calculateScore() {
    // Define weights for different metrics
    const weights = {
      profileCompleteness: 0.1,
      followers: 0.15,
      publicRepos: 0.15,
      totalStars: 0.2,
      languageDiversity: 0.1,
      hasPopularRepos: 0.1,
      recentActivity: 0.2
    };
    
    // Normalize some metrics to a 0-100 scale
    const normalizedMetrics = {
      profileCompleteness: this.metrics.profileCompleteness, // Already 0-100
      followers: Math.min(this.metrics.followers, 1000) / 10, // Cap at 1000 followers (100 points)
      publicRepos: Math.min(this.metrics.publicRepos, 50) * 2, // Cap at 50 repos (100 points)
      totalStars: Math.min(this.metrics.totalStars, 1000) / 10, // Cap at 1000 stars (100 points)
      languageDiversity: Math.min(this.metrics.languageDiversity, 10) * 10, // Cap at 10 languages (100 points)
      hasPopularRepos: this.metrics.hasPopularRepos ? 100 : 0, // Boolean to 0 or 100
      recentActivity: this.metrics.recentActivity || 0 // Already 0-100
    };
    
    // Calculate weighted score
    let totalScore = 0;
    for (const metric in weights) {
      totalScore += normalizedMetrics[metric] * weights[metric];
    }
    
    this.score = parseFloat(totalScore.toFixed(1));
    return this.score;
  }

  // Generate a summary report
  generateReport() {
    if (!this.metrics) {
      throw new Error('Metrics not calculated yet');
    }
    
    // Calculate score if not already done
    if (!this.score) {
      this.calculateScore();
    }
    
    return {
      username: this.username,
      overallScore: this.score,
      scoreBreakdown: {
        profileCompleteness: {
          value: this.metrics.profileCompleteness,
          description: 'Completeness of profile information (name, bio, location, etc.)'
        },
        followers: {
          value: this.metrics.followers,
          description: 'Number of GitHub followers'
        },
        repositories: {
          value: this.metrics.publicRepos,
          description: 'Number of public repositories'
        },
        stars: {
          value: this.metrics.totalStars,
          description: 'Total stars received across all repositories'
        },
        languageDiversity: {
          value: this.metrics.languageDiversity,
          description: 'Number of different programming languages used'
        },
        popularProjects: {
          value: this.metrics.hasPopularRepos ? 'Yes' : 'No',
          description: 'Has repositories with 10+ stars'
        },
        recentActivity: {
          value: this.metrics.recentActivity || 'Unknown',
          description: 'Recent activity level (based on events in the last month)'
        }
      },
      accountDetails: {
        accountAge: `${this.metrics.accountAge} years`,
        avatarUrl: this.userData.avatar_url,
        profileUrl: this.userData.html_url,
        name: this.userData.name || 'Not provided',
        bio: this.userData.bio || 'Not provided',
        location: this.userData.location || 'Not provided'
      }
    };
  }

  // Run the full analysis
  async analyze() {
    try {
      await this.fetchUserData();
      await this.fetchRepos();
      await this.fetchContributions();
      this.calculateMetrics();
      this.calculateScore();
      return this.generateReport();
    } catch (error) {
      throw error;
    }
  }
}

module.exports = { GitHubProfileAnalyzer };