'use client';

import React from "react";

const LoadingProgress = ({ uploadMessage, progress }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-700">
      <div className="flex flex-col space-x-2 bg-white p-16 rounded">
        <div style={{ marginTop: "10px" }}>
          <div className="text-base font-normal mb-3">{uploadMessage}</div>
          <div
            style={{
              height: "10px",
              width: "100%",
              backgroundColor: "#e0e0e0",
              borderRadius: "5px",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                backgroundColor: "#76c7c0",
                borderRadius: "5px",
              }}
            ></div>
          </div>
          <p>{progress}%</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingProgress;
