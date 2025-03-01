import React from 'react';
import ProofBadges from '../ProofBadges';

const ScoreBreakdown = ({ profileData, zkProofs }) => {
  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Score Breakdown</h2>

      {zkProofs.length > 0 && (
        <div className="px-6 py-3 bg-indigo-50 mb-4">
          <ProofBadges proofs={zkProofs} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-gray-500">Profile Completeness</div>
          <div className="mt-1 flex items-baseline">
            <span className="text-xl font-semibold text-gray-900">
              {profileData.metrics.profileCompleteness}%
            </span>
            <span className="ml-2 text-sm text-gray-500">
              Personal details & bio
            </span>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-gray-500">Followers</div>
          <div className="mt-1 flex items-baseline">
            <span className="text-xl font-semibold text-gray-900">
              {profileData.metrics.followers}
            </span>
            <span className="ml-2 text-sm text-gray-500">
              GitHub followers
            </span>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-gray-500">Repositories</div>
          <div className="mt-1 flex items-baseline">
            <span className="text-xl font-semibold text-gray-900">
              {profileData.metrics.repositories}
            </span>
            <span className="ml-2 text-sm text-gray-500">
              {profileData.includesPrivateRepos ? 'All repos' : 'Public repos'}
            </span>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-gray-500">Stars</div>
          <div className="mt-1 flex items-baseline">
            <span className="text-xl font-semibold text-gray-900">
              {profileData.metrics.stars}
            </span>
            <span className="ml-2 text-sm text-gray-500">
              Total across all repos
            </span>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-gray-500">Language Diversity</div>
          <div className="mt-1 flex items-baseline">
            <span className="text-xl font-semibold text-gray-900">
              {profileData.metrics.languageDiversity}
            </span>
            <span className="ml-2 text-sm text-gray-500">
              Different languages used
            </span>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-gray-500">Has Popular Repos</div>
          <div className="mt-1 flex items-baseline">
            <span className="text-xl font-semibold text-gray-900">
              {profileData.metrics.hasPopularRepos}
            </span>
            <span className="ml-2 text-sm text-gray-500">
              Repos with 10+ stars
            </span>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-gray-500">Recent Activity</div>
          <div className="mt-1 flex items-baseline">
            <span className="text-xl font-semibold text-gray-900">
              {profileData.metrics.recentActivity}/100
            </span>
            <span className="ml-2 text-sm text-gray-500">
              Based on recent events
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreBreakdown;