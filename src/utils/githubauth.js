export const initiateGithubAuth = async (walletAddress, redirectPath = '') => {
    // Get the OAuth server URL from environment variables
    const oauthServerUrl = process.env.REACT_APP_OAUTH_SERVER_URL || 'http://localhost:3001';
    
    // Store the current path for redirecting back after auth
    if (redirectPath) {
      localStorage.setItem('auth_redirect_path', redirectPath);
    }
    
    try {
      // Make a request to get the auth URL
      const response = await fetch(
        `${oauthServerUrl}/api/auth/github?wallet=${walletAddress}${redirectPath ? `&redirect=${encodeURIComponent(redirectPath)}` : ''}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to get auth URL');
      }
      
      const data = await response.json();
      
      // Redirect to GitHub using the URL from the response
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Invalid auth URL received');
      }
    } catch (error) {
      console.error('Error initiating GitHub auth:', error);
      // You could show an error message to the user here
    }
  };