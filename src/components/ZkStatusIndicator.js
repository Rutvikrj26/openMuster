import React from 'react';

/**
 * ZK Status Indicator - Shows the current status of ZK proof system (real or simulation)
 */
const ZkStatusIndicator = ({ simulationMode }) => {
  return (
    <div className="flex items-center space-x-1 text-xs">
      {simulationMode ? (
        <>
          <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
          <span className="text-yellow-600 font-medium">Simulation Mode</span>
          <span className="text-gray-500">(zkVerify extension not detected)</span>
        </>
      ) : (
        <>
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-green-600 font-medium">zkVerify Connected</span>
        </>
      )}
    </div>
  );
};

export default ZkStatusIndicator;