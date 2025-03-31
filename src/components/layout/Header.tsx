import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Settings, LogOut, User, Menu } from "lucide-react";
import Logo from "../ui/logo";
import { cn } from "@/lib/utils";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <header className="w-full h-20 border-b bg-gradient-to-r from-ink2deck-background to-secondary-800 text-white flex items-center justify-between px-6 sticky top-0 z-50 shadow-md">
      <div className="flex items-center gap-2">
        <Link to="/" className="flex items-center gap-2">
          <Logo withText size="md" />
        </Link>
      </div>

      <nav className="hidden md:flex items-center space-x-6">
        <Link
          to="/"
          className="text-sm font-medium text-white hover:text-primary-300 transition-colors relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary-300 after:scale-x-0 hover:after:scale-x-100 after:transition-transform"
        >
          Home
        </Link>
        <Link
          to="/dashboard"
          className="text-sm font-medium text-white hover:text-primary-300 transition-colors relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary-300 after:scale-x-0 hover:after:scale-x-100 after:transition-transform"
        >
          Dashboard
        </Link>
        <Link
          to="/gallery"
          className="text-sm font-medium text-white hover:text-primary-300 transition-colors relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary-300 after:scale-x-0 hover:after:scale-x-100 after:transition-transform"
        >
          My Presentations
        </Link>
        <Link
          to="/help"
          className="text-sm font-medium text-white hover:text-primary-300 transition-colors relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary-300 after:scale-x-0 hover:after:scale-x-100 after:transition-transform"
        >
          Help
        </Link>
      </nav>

      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          className="hidden md:flex border-primary-400 text-white hover:bg-primary-500 hover:text-white transition-all duration-300"
        >
          Upgrade Plan
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-white hover:bg-ink2deck-dark/20"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu className="h-6 w-6" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-9 w-9 cursor-pointer border-2 border-primary-400 hover:border-primary-300 transition-colors">
              <AvatarImage
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=user123"
                alt="User"
              />
              <AvatarFallback className="bg-primary-600 text-white">
                US
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 border-primary-400 bg-gradient-to-b from-ink2deck-background to-secondary-900 text-white"
          >
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-primary-700/50" />
            <DropdownMenuItem className="hover:bg-primary-700/30 cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-primary-700/30 cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-primary-700/50" />
            <DropdownMenuItem className="hover:bg-primary-700/30 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "fixed inset-0 bg-ink2deck-background/95 z-50 flex flex-col p-6 transition-all duration-300 ease-in-out",
          isMenuOpen
            ? "opacity-100 translate-x-0"
            : "opacity-0 translate-x-full pointer-events-none",
        )}
      >
        <div className="flex justify-between items-center mb-8">
          <Logo withText size="md" />
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-ink2deck-dark/20"
            onClick={() => setIsMenuOpen(false)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
        <nav className="flex flex-col space-y-6 text-lg">
          <Link
            to="/"
            className="text-white hover:text-primary-300 transition-colors py-2 border-b border-primary-700/30"
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/dashboard"
            className="text-white hover:text-primary-300 transition-colors py-2 border-b border-primary-700/30"
            onClick={() => setIsMenuOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            to="/gallery"
            className="text-white hover:text-primary-300 transition-colors py-2 border-b border-primary-700/30"
            onClick={() => setIsMenuOpen(false)}
          >
            My Presentations
          </Link>
          <Link
            to="/help"
            className="text-white hover:text-primary-300 transition-colors py-2 border-b border-primary-700/30"
            onClick={() => setIsMenuOpen(false)}
          >
            Help
          </Link>
          <Button
            variant="outline"
            className="mt-4 border-primary-400 text-white hover:bg-primary-500 hover:text-white transition-all duration-300 w-full"
            onClick={() => setIsMenuOpen(false)}
          >
            Upgrade Plan
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
