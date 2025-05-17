
import {
  Shield,
  FileSearch,
  Mail,
  Clock,
  Bell,
  UserPlus
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Features = () => {
  const features = [
    {
      icon: <FileSearch className="h-10 w-10 text-tos-blue" />,
      title: "TOS Analyzer Engine",
      description: "AI-powered clause analyzer that identifies unfair or legally questionable terms in service agreements."
    },
    {
      icon: <Shield className="h-10 w-10 text-tos-blue" />,
      title: "Loophole Generator",
      description: "Creates legal hacks and opt-out templates that help you bypass unfair terms and conditions."
    },
    {
      icon: <Mail className="h-10 w-10 text-tos-blue" />,
      title: "Email Templates",
      description: "Generate legally-sound emails to send to companies requesting changes, cancellations, or data deletion."
    },
    {
      icon: <Clock className="h-10 w-10 text-tos-blue" />,
      title: "Clause Tracker",
      description: "Monitors changes in Terms of Service over time so you're always aware of new restrictions."
    },
    {
      icon: <Bell className="h-10 w-10 text-tos-blue" />,
      title: "Browser Extension",
      description: "Chrome extension that alerts you to potentially problematic clauses while browsing websites."
    },
    {
      icon: <UserPlus className="h-10 w-10 text-tos-blue" />,
      title: "User Management",
      description: "Different subscription tiers with varying levels of access to advanced features and analysis tools."
    }
  ];

  return (
    <div className="bg-white px-6 py-24">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-tos-navy font-heading mb-6">Powerful Features to Protect Your Rights</h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            TOS Raider combines advanced AI technology with legal expertise to give you the upper hand against unfair terms of service.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border border-gray-200 hover:border-tos-blue/50 hover:shadow-md transition duration-300">
              <CardHeader>
                <div className="mb-2">{feature.icon}</div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-sm">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;
