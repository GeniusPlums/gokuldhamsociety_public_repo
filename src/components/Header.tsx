import { Building2, Bell, Users, Vote, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-card/80 backdrop-blur-md border-b border-border">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-lg leading-tight text-foreground">
              Gokuldham
            </span>
            <span className="text-xs text-muted-foreground -mt-0.5">Society</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Button variant="ghost" className="gap-2">
            <Bell className="w-4 h-4" />
            Notices
          </Button>
          <Button variant="ghost" className="gap-2">
            <Users className="w-4 h-4" />
            Residents
          </Button>
          <Button variant="ghost" className="gap-2">
            <Vote className="w-4 h-4" />
            Polls
          </Button>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="outline" size="sm">
            Login
          </Button>
          <Button variant="society" size="sm">
            Claim Your Flat
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card p-4 animate-slide-up">
          <nav className="flex flex-col gap-2">
            <Button variant="ghost" className="justify-start gap-2">
              <Bell className="w-4 h-4" />
              Notices
            </Button>
            <Button variant="ghost" className="justify-start gap-2">
              <Users className="w-4 h-4" />
              Residents
            </Button>
            <Button variant="ghost" className="justify-start gap-2">
              <Vote className="w-4 h-4" />
              Polls
            </Button>
            <div className="flex gap-2 mt-2 pt-2 border-t border-border">
              <Button variant="outline" className="flex-1">
                Login
              </Button>
              <Button variant="society" className="flex-1">
                Claim Flat
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
