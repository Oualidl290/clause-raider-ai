
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <div className="relative bg-gradient-to-b from-white to-sky-50 px-6 py-24 sm:py-32">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 max-w-xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-tos-navy font-heading">
              AI Powered <span className="text-tos-blue">Legal Protection</span> From Unfair Terms
            </h1>
            <p className="text-lg md:text-xl text-gray-700">
              TOS Raider analyzes Terms of Service documents with AI to identify exploitable clauses and generate legal actions to protect your rights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button className="bg-tos-blue hover:bg-tos-blue/90 text-white px-6 py-6 rounded-md">
                Start Analyzing <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" className="px-6 py-6">
                See It In Action
              </Button>
            </div>
            <div className="pt-4 text-sm text-gray-500">
              Join thousands who have already discovered & exploited loopholes in TOS agreements
            </div>
          </div>
          
          <div className="relative w-full aspect-[4/3] bg-tos-navy/5 rounded-lg overflow-hidden border border-tos-navy/20">
            <div className="absolute inset-0 p-8">
              {/* Stylized UI elements */}
              <div className="w-full h-10 bg-white rounded-md flex items-center px-3 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-400 mr-2"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
                <div className="w-3 h-3 rounded-full bg-green-400 mr-2"></div>
                <div className="flex-1 bg-gray-100 h-4 rounded ml-2"></div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 h-[calc(100%-40px)]">
                <div className="col-span-1 bg-white rounded-md p-3 shadow-sm">
                  <div className="w-full h-5 bg-tos-blue/20 rounded mb-2"></div>
                  <div className="w-3/4 h-4 bg-gray-100 rounded mb-2"></div>
                  <div className="w-1/2 h-4 bg-gray-100 rounded"></div>
                  <div className="mt-4 space-y-2">
                    <div className="w-full h-3 bg-gray-100 rounded"></div>
                    <div className="w-full h-3 bg-gray-100 rounded"></div>
                    <div className="w-3/4 h-3 bg-gray-100 rounded"></div>
                  </div>
                </div>
                
                <div className="col-span-2 bg-white rounded-md p-3 shadow-sm">
                  <div className="w-full h-6 bg-tos-gold/30 rounded mb-3"></div>
                  <div className="space-y-2">
                    <div className="w-full h-4 bg-gray-100 rounded"></div>
                    <div className="w-full h-4 bg-gray-100 rounded"></div>
                    <div className="w-3/4 h-4 bg-gray-100 rounded"></div>
                  </div>
                  <div className="mt-5 w-1/2 h-8 bg-tos-blue/30 rounded mx-auto"></div>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -right-8 -top-8 w-16 h-16 bg-tos-blue/20 rounded-full"></div>
            <div className="absolute -left-12 -bottom-12 w-24 h-24 bg-tos-gold/20 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
