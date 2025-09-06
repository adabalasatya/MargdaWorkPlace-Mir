import { Suspense } from 'react'
import Navbar from "@/components/Homepage/homenav/page"
import HeroSection from "@/app/(home)/HeroSection/page";
import Demo from "@/app/(home)/Demo/Page"
import Footer from "@/components/Homepage/homefooter/page"

export default function Home() {
  return (
    <>
      <Suspense fallback={<div className="h-16 bg-gray-100">Loading nav...</div>}>
        <Navbar/>
      </Suspense>
      
      <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-600 flex items-center justify-center text-white">Loading hero...</div>}>
        <HeroSection/>
      </Suspense>
      
      <Suspense fallback={<div className="h-32 bg-gray-100">Loading demo...</div>}>
        <Demo/>
      </Suspense>
      
      <Suspense fallback={<div className="h-16 bg-gray-100">Loading footer...</div>}>
        <Footer/>
      </Suspense>
    </>
  );
}
