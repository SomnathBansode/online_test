import React from 'react';

const AuthWrapper = ({ children }) => {
  return (
    <div
      className="
        min-h-screen 
        flex 
        flex-col 
        justify-center 
        items-center 
        bg-[#fff9ea] 
        dark:bg-gray-900
        text-gray-800 
        dark:text-gray-100
        p-4
      "
    >
      {children}
    </div>
  );
};

export default AuthWrapper;
