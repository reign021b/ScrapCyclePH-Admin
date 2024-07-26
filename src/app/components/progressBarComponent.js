import React from 'react';

const ProgressBarComponent = () => {
  return (
    <div className="flex-grow py-3 px-4 flex items-center justify-between border-r">
      <p>18/25</p>
      <div className="rounded-full h-3 mx-4 w-full bg-gray-200">
        <div className="h-full w-3/4 bg-green-600 rounded-full" />
      </div>
      <p>70%</p>
    </div>
  );
};

export default ProgressBarComponent;
