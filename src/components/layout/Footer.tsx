import React from "react";
import { Github, Twitter, Mail } from "lucide-react";
import { Separator } from "../ui/separator";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-background border-t py-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-3">
              Smart Board Converter
            </h3>
            <p className="text-sm text-muted-foreground">
              Transform your whiteboard images into professional slide decks
              with AI-powered content extraction.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a
                  href="mailto:support@smartboardconverter.com"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  support@smartboardconverter.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Twitter className="h-4 w-4 text-muted-foreground" />
                <a
                  href="https://twitter.com/smartboardapp"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  @smartboardapp
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Github className="h-4 w-4 text-muted-foreground" />
                <a
                  href="https://github.com/smartboardapp"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  github.com/smartboardapp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Smart Board Converter. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
