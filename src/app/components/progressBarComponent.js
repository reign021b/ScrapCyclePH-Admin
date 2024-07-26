import React from 'react';

const ProgressBarComponent = ({ completedCount, totalCount }) => {
  // Calculate progress percentage
  const percentage = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="flex-grow py-3 px-4 flex items-center justify-between border-r">
      <p>{completedCount !== null ? completedCount : 'Loading...'}/{totalCount !== null ? totalCount : 'Loading...'}</p>
      <div className="rounded-full h-3 mx-4 w-full bg-gray-200">
        <div
          className="h-full bg-green-600 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p>{percentage}%</p>
    </div>
  );
};

export default ProgressBarComponent;
