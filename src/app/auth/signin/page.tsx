"use client";

import { supabase } from "@/lib/SupabaseClient";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { FaGoogle, FaFacebook, FaGithub } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();


  const handleMagicLinkLogin = async ({ email }: { email: string }) => {
    try {
      setIsLoading(true); // Set loading state to true

      const user = await supabase.auth.getUser();
      if(user){
        await supabase.auth.signOut();
        toast.success("Signed out existing user");
      }

      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/profile`,
        },
      });

      if (error) {
        toast.error("Failed to send magic link. Please try again.");
        return;
      }

      // Clear the input field
      setEmail("");

      // Redirect to the check-email page
      router.push("/auth/signin/check-email");
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  
  const handleSocialLogin = async(provider: "google") => {

    const {data, error} = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/profile`
      }
    });

    if(error){
      toast.error("Failed to login via Social Oauth");
    }
 }


  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100 text-black">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Afrinventory
        </h2>

        {/* Magic Link Login */}
        <div className="mb-6">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-pink-500 focus:border-pink-500"
          />
          <Button
            onClick={() => handleMagicLinkLogin({ email })}
            disabled={!isValidEmail(email) || isLoading} // Disable if email is invalid or loading
            className={`mt-4 w-full py-2 px-4 rounded-lg transition-colors ${
              isValidEmail(email) && !isLoading
                ? "cursor-pointer bg-pink-500 text-white hover:bg-pink-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2Icon className="animate-spin mr-2" />
                Sending Email
              </>
            ) : (
              "Send Login Link"
            )}
          </Button>
        </div>
        {/* Social Login */}
        <div className="flex items-center justify-between mb-4">
          <div className="w-full border-t border-gray-300"></div>
          <span className="px-2 text-gray-500 text-sm">OR</span>
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="flex flex-col space-y-4">
          <Button
            onClick={() => handleSocialLogin("google")}
            className="cursor-pointer flex items-center justify-center w-full text-white py-2 px-4 rounded-lg hover:bg-neutrals-900 transition-colors"
          >
            <FaGoogle className="mr-2" />or  Continue with Google
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;