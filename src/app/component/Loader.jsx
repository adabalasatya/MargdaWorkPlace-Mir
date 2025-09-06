'use client';

import React from "react";

const Loader = () => {
  return (
    <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-700">
      <div className="flex flex-col space-x-2 bg-white p-16 rounded">
        <div className="text-base font-normal mb-3">Loading..</div>
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-75"></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-150"></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-225"></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-300"></div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
