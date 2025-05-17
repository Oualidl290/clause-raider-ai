
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
  return (
    <div className="bg-tos-navy text-white px-6 py-20">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 font-heading">
          Stop Agreeing to Terms You Haven't Read
        </h2>
        <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
          Companies hide unfair clauses in lengthy terms of service documents. TOS Raider helps you identify them, understand your rights, and take action.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button
            size="lg"
            className="bg-tos-blue hover:bg-tos-blue/90 text-white"
          >
            Get Started For Free <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/30 hover:bg-white/10 text-white"
          >
            View Pricing Plans
          </Button>
        </div>
        <div className="flex items-center justify-center gap-8 mt-12">
          <div className="text-center">
            <p className="text-3xl font-bold text-tos-gold">15,000+</p>
            <p className="text-sm text-gray-300">TOS Documents Analyzed</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-tos-gold">$2.1M+</p>
            <p className="text-sm text-gray-300">Saved For Users</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-tos-gold">93%</p>
            <p className="text-sm text-gray-300">Success Rate</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CTASection;
