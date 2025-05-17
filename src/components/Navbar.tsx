
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MenuIcon, X } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="bg-white border-b border-gray-100 py-4 px-6 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <span className="text-tos-navy font-bold text-xl font-heading">TOS<span className="text-tos-blue">Raider</span></span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-gray-700 hover:text-tos-blue transition duration-200">Home</Link>
          <Link to="/how-it-works" className="text-gray-700 hover:text-tos-blue transition duration-200">How It Works</Link>
          <Link to="/pricing" className="text-gray-700 hover:text-tos-blue transition duration-200">Pricing</Link>
          <Link to="/about" className="text-gray-700 hover:text-tos-blue transition duration-200">About</Link>
          <div className="flex space-x-2">
            <Button variant="ghost">Login</Button>
            <Button className="bg-tos-blue hover:bg-tos-blue/90">Sign Up</Button>
          </div>
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={toggleMenu}>
            {isMenuOpen ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-100 py-4">
          <div className="flex flex-col space-y-3 px-6">
            <Link to="/" className="text-gray-700 hover:text-tos-blue transition duration-200 py-2" onClick={toggleMenu}>Home</Link>
            <Link to="/how-it-works" className="text-gray-700 hover:text-tos-blue transition duration-200 py-2" onClick={toggleMenu}>How It Works</Link>
            <Link to="/pricing" className="text-gray-700 hover:text-tos-blue transition duration-200 py-2" onClick={toggleMenu}>Pricing</Link>
            <Link to="/about" className="text-gray-700 hover:text-tos-blue transition duration-200 py-2" onClick={toggleMenu}>About</Link>
            <div className="flex flex-col space-y-2 pt-2">
              <Button variant="ghost" onClick={toggleMenu}>Login</Button>
              <Button className="bg-tos-blue hover:bg-tos-blue/90" onClick={toggleMenu}>Sign Up</Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
