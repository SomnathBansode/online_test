import React from "react";

const AuthWrapper = ({ children }) => {
  return (
    <div
      className="
        fixed 
        inset-0 
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
        overflow-y-auto
      "
      style={{ minHeight: "100vh" }}
    >
      {children}
    </div>
  );
};

export default AuthWrapper;
