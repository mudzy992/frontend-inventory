import React from 'react';
import { useLoading } from './LoadingProvider';

const LoadingIndicator: React.FC = () => {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="loader">Loading...</div>
    </div>
  );
};

export default LoadingIndicator;
