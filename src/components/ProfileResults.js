import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

// Components
import LoadingState from './common/LoadingState';
import ErrorState from './common/ErrorState';
import ProfileHeader from './profile/ProfileHeader';
import TokenInput from './profile/TokenInput';
import ZKPrivateProof from './ZKPrivateProof';
import ScoreBreakdown from './profile/ScoreBreakdown';
import BlockchainInfo from './profile/BlockchainInfo';
import ProfileActions from './profile/ProfileActions';

// Services
import {GitHubProfileAnalyzer} from '../services/githubAnalyzer';
const OAUTH_SERVER_URL = process.env.REACT_APP_OAUTH_SERVER_URL;

const ProfileResults = ({ account, contract, isVerified, verifiedUsername }) => {
  const { username } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profileData, setProfileData] = useState(null);
  const [recalculating, setRecalculating] = useState(false);
  const [githubToken, setGithubToken] = useState(null);
  const [zkProofs, setZkProofs] = useState([]);
  const [showZkProofSection, setShowZkProofSection] = useState(false);
  const [privateRepoData, setPrivateRepoData] = useState(null);
  const [showTokenInput, setShowTokenInput] = useState(false);
  
  const normalizedUsername = username ? username.toLowerCase() : "";

  // Check if this is the verified user's own profile
  const isOwnVerifiedProfile = isVerified && verifiedUsername === username;

  useEffect(() => {
    if (contract) {
      console.log("[CONTRACT_CHECK] Contract ready:", contract.address);
      console.log("[CONTRACT_CHECK] Available methods:", 
        Object.keys(contract.functions)
          .filter(key => !key.includes('('))
          .sort()
      );
    } else {
      console.log("[CONTRACT_CHECK] Contract not ready");
    }
  }, [contract]);

  // Fetch profile data when component mounts or contract/username changes
  useEffect(() => {
    if (contract && username) {
      fetchProfileData();
    }
  }, [contract, username]);

  const checkNetwork = async () => {
    try {
      const provider = contract.provider;
      const network = await provider.getNetwork();
      console.log("[NETWORK] Connected to network:", {
        chainId: network.chainId,
        name: network.name
      });
      
      // Check the target contract
      const code = await provider.getCode(contract.address);
      const isContract = code !== '0x';
      console.log("[NETWORK] Contract exists at address:", isContract);
      
      return { network, isContract };
    } catch (error) {
      console.error("[NETWORK] Error checking network:", error);
      return { error };
    }
  };

  const fetchProfileData = async () => {
    console.log("[PROFILE_RESULTS] Fetching profile data for:", normalizedUsername);
    if (!contract || !normalizedUsername) return;
    
    try {
      setLoading(true);
      setError('');

      await checkNetwork();
      
      console.log("[PROFILE_RESULTS] Contract instance obtained:", !!contract);
      console.log("[PROFILE_RESULTS] Contract address:", contract.address);

      // Get profile data from blockchain
      console.log("[PROFILE_RESULTS] Calling getProfileScore for:", normalizedUsername);
      const data = await contract.getProfileScore(normalizedUsername);
      console.log("[PROFILE_RESULTS] Profile exists:", data.exists);
      console.log("[PROFILE_RESULTS] Profile data raw:", {
        username: data.username,
        timestamp: data.timestamp?.toString(),
        overallScore: data.overallScore,
        exists: data.exists,
        hasZkVerification: data.hasZkVerification
      });
      
      if (!data.exists) {
        setError(`No data found for GitHub user ${username}`);
        setLoading(false);
        return;
      }
      
      // Format the data
      const formattedData = {
        username: data.username,
        analyzedAt: new Date(data.timestamp.toNumber() * 1000).toISOString(),
        overallScore: data.overallScore,
        exists: data.exists,
        hasZkVerification: data.hasZkVerification || false,
        metrics: {
          profileCompleteness: data.profileCompleteness,
          followers: data.followers,
          repositories: data.repoCount,
          stars: data.totalStars,
          languageDiversity: data.languageDiversity,
          hasPopularRepos: data.hasPopularRepos ? 'Yes' : 'No',
          recentActivity: data.recentActivity
        },
        analyzedBy: data.analyzedBy,
        includesPrivateRepos: data.includesPrivateRepos
      };
      
      console.log("[PROFILE_RESULTS] Formatted profile data:", formattedData);
      setProfileData(formattedData);
    } catch (error) {
      console.error('[PROFILE_RESULTS] Error fetching profile data:', error);
      setError(`Error fetching data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleProofGenerated = async (proofs, verificationResult) => {
    try {
      console.log("[ZK] Processing generated proofs:", proofs);
      
      // Update local state with the new proofs
      const newProofs = proofs.map(proof => ({
        proofType: proof.proofType,
        verificationId: proof.proofId,
        txHash: verificationResult?.txHash || '',
        verifiedAt: new Date()
      }));
      
      setZkProofs(newProofs);

      // Properly update state using the functional form of setState
      setProfileData(prev => ({
        ...prev,
        hasZkVerification: true
      }));

      // Refresh data from blockchain
      console.log("[ZK] Refreshing profile data after ZK proof generation");
      await fetchProfileData();
    } catch (error) {
      console.error("[ZK] Error in handleProofGenerated:", error);
    }
  };

  const handleRecalculate = async (includePrivateRepos = false) => {
    if (!contract || !normalizedUsername) return;
    
    try {
      setRecalculating(true);
      setError('');

      if (includePrivateRepos) {
        // Check if wallet is verified for this GitHub account
        const [verifiedUsername, isVerified] = await contract.getWalletGitHubInfo(account);
        const normalizedVerifiedUsername = verifiedUsername.toLowerCase();
        
        if (!isVerified || normalizedVerifiedUsername !== normalizedUsername) {
          setError(
            `Your wallet must be verified as the owner of GitHub account "${normalizedUsername}" to include private repositories. ` +
            `Please complete the verification process first.`
          );
          setRecalculating(false);
          return;
        }
      }

      console.log(`[ANALYZE] Starting analysis for ${normalizedUsername}, including private repos: ${includePrivateRepos}`);
      console.log(`[ANALYZE] Using contract at address: ${contract.address}`);      

      // If including private repos, we need to fetch them through the OAuth server
      let privateRepoData = null;
      if (includePrivateRepos) {
        try {
          const response = await axios.get(
            `${OAUTH_SERVER_URL}/api/github/repos/${normalizedUsername}/authenticated`,
            { withCredentials: true } // Important: sends cookies with the request
          );
          privateRepoData = response.data;
          setPrivateRepoData(privateRepoData);
        } catch (error) {
          console.error('Error fetching private repo data:', error);
          if (error.response && error.response.status === 401) {
            // Authentication failed - show error with re-auth option
            setError('GitHub authentication required. Please reconnect your GitHub account.');
            setShowTokenInput(true); // Show the token input with the reconnect button
          } else {
            setError('Failed to fetch private repository data.');
          }
          setRecalculating(false);
          return;
        }
      }
      
      // Analyze GitHub profile
      const analyzer = new GitHubProfileAnalyzer();
      const analysis = await analyzer.analyze(normalizedUsername, privateRepoData);

      console.log(`[ANALYZE] Sending transaction to store profile data on chain...`);
      console.log(`[ANALYZE] Transaction params:`, {
        username: analysis.username,
        overallScore: Math.round(analysis.overallScore),
        profileCompleteness: analysis.metrics.profileCompleteness,
        followers: analysis.metrics.followers,
        repositories: analysis.metrics.repositories,
        stars: analysis.metrics.stars,
        languageDiversity: analysis.metrics.languageDiversity,
        hasPopularRepos: analysis.metrics.hasPopularRepos === 'Yes',
        recentActivity: analysis.metrics.recentActivity,
        includePrivateRepos
      });
          
      // Store on blockchain
      const tx = await contract.addProfileScore(
        analysis.username,
        Math.round(analysis.overallScore),
        analysis.metrics.profileCompleteness,
        analysis.metrics.followers,
        analysis.metrics.repositories,
        analysis.metrics.stars,
        analysis.metrics.languageDiversity,
        analysis.metrics.hasPopularRepos === 'Yes',
        analysis.metrics.recentActivity,
        includePrivateRepos
      );
      
      console.log(`[ANALYZE] Transaction sent with hash: ${tx.hash}`);

      console.log(`[ANALYZE] Waiting for transaction to be mined...`);      
      const receipt = await tx.wait();
      console.log(`[ANALYZE] Transaction mined in block: ${receipt.blockNumber}`);
      console.log(`[ANALYZE] Gas used: ${receipt.gasUsed.toString()}`);
      console.log(`[ANALYZE] Events emitted:`, receipt.events);      

      // Verify data was stored - fetch immediately after transaction
      console.log(`[ANALYZE] Verifying data was stored by fetching from chain...`);
      const verificationData = await contract.getProfileScore(username);
      console.log(`[ANALYZE] Verification data exists flag: ${verificationData.exists}`);
      console.log(`[ANALYZE] Verification data:`, verificationData);

      // Update profile data with new values
      const updatedData = {
        username: analysis.username,
        analyzedAt: new Date().toISOString(),
        overallScore: analysis.overallScore,
        exists: true, // Add this explicitly
        hasZkVerification: profileData?.hasZkVerification || false, // Preserve existing ZK status
        metrics: {
          profileCompleteness: analysis.metrics.profileCompleteness,
          followers: analysis.metrics.followers,
          repositories: analysis.metrics.repositories,
          stars: analysis.metrics.stars,
          languageDiversity: analysis.metrics.languageDiversity,
          hasPopularRepos: analysis.metrics.hasPopularRepos,
          recentActivity: analysis.metrics.recentActivity
        },
        analyzedBy: account,
        includesPrivateRepos: includePrivateRepos
      };
      
      setProfileData(updatedData);
      
      // Clear token after successful analysis
      if (includePrivateRepos) {
        setGithubToken(null);
        setShowTokenInput(false);
      }
      
    } catch (error) {
      console.error('Error recalculating profile:', error);
      setError(`Error recalculating profile: ${error.message}`);
    } finally {
      setRecalculating(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading profile data..." />;
  }
  
  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <ProfileHeader 
          username={normalizedUsername}
          profileData={profileData}
          isOwnVerifiedProfile={isOwnVerifiedProfile}
          recalculating={recalculating}
          handleRecalculate={handleRecalculate}
          setShowTokenInput={setShowTokenInput}
          showTokenInput={showTokenInput}
        />
        
        {showTokenInput && (
          <TokenInput 
            account={account} // Pass the wallet address
            username={normalizedUsername} // Pass the username
            showZkProofSection={showZkProofSection}
            setShowZkProofSection={setShowZkProofSection}
            handleRecalculate={handleRecalculate}
            recalculating={recalculating}
            isVerifiedForUsername={isVerified}
          />
        )}

        {showZkProofSection && privateRepoData && (
          <ZKPrivateProof
            privateRepoData={privateRepoData}
            contract={contract}
            account={account}
            username={normalizedUsername}
            onProofGenerated={handleProofGenerated}
          />
        )}

        <ScoreBreakdown 
          profileData={profileData} 
          zkProofs={zkProofs}
        />
        
        <BlockchainInfo 
          profileData={profileData}
          account={account}
        />
      </div>
      
      <ProfileActions 
        isVerified={isVerified} 
        username={username}
      />
    </div>
  );
};

export default ProfileResults;