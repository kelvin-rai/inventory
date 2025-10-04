import React from "react";
import Link from "next/link";

const CheckEmailPage = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-washed-purple-900">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Check Your Email</h2>
        <p className="text-gray-600 mb-6">
          We’ve sent a login link to your email. Please check your inbox and click the link to log in.
        </p>
        <div className="flex justify-center mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-pink-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 12H8m8 4H8m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <p className="text-sm text-gray-500">
          Didn’t receive the email? Check your spam folder or{" "}
          <Link href="/auth/signin" className="text-pink-500 hover:underline">
            try again
          </Link>.
        </p>
      </div>
    </div>
  );
};

export default CheckEmailPage;