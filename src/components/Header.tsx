import { Building2, Bell, Users, Vote, Menu, LogOut, Home } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, profile, flat, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-card/80 backdrop-blur-md border-b border-border">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-lg leading-tight text-foreground">
              Gokuldham
            </span>
            <span className="text-xs text-muted-foreground -mt-0.5">Society</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Button variant="ghost" className="gap-2" onClick={() => scrollToSection('notices')}>
            <Bell className="w-4 h-4" />
            Notices
          </Button>
          <Button variant="ghost" className="gap-2" onClick={() => scrollToSection('map')}>
            <Users className="w-4 h-4" />
            Residents
          </Button>
          <Button variant="ghost" className="gap-2" onClick={() => scrollToSection('polls')}>
            <Vote className="w-4 h-4" />
            Polls
          </Button>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                    {profile?.display_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="max-w-24 truncate">{profile?.display_name || 'Resident'}</span>
                  {flat && (
                    <span className="flat-badge text-xs">{flat.building}-{flat.flat_number}</span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="gap-2">
                  <Home className="w-4 h-4" />
                  {flat ? `Flat ${flat.building}-${flat.flat_number}` : 'No flat claimed'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="gap-2 text-destructive">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link to="/auth">Login</Link>
              </Button>
              <Button variant="society" size="sm" asChild>
                <Link to="/auth">Claim Your Flat</Link>
              </Button>
            </>
          )}
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
              {user ? (
                <>
                  <div className="flex-1 flex items-center gap-2 px-3">
                    <span className="text-sm font-medium">{profile?.display_name}</span>
                    {flat && (
                      <span className="flat-badge text-xs">{flat.building}-{flat.flat_number}</span>
                    )}
                  </div>
                  <Button variant="outline" onClick={handleSignOut}>
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" className="flex-1" asChild>
                    <Link to="/auth">Login</Link>
                  </Button>
                  <Button variant="society" className="flex-1" asChild>
                    <Link to="/auth">Claim Flat</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
