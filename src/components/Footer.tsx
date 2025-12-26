import { Building2, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="font-display font-bold text-lg">Gokuldham Society</span>
              </div>
            </div>
            <p className="text-background/70 max-w-sm">
              A living, playable digital society where you participate as a resident—
              posting notices, voting on conflicts, and shaping society governance.
            </p>
          </div>

          <div>
            <h4 className="font-display font-bold mb-4">Society</h4>
            <ul className="space-y-2 text-background/70">
              <li><a href="#" className="hover:text-primary transition-colors">Notice Board</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Complaints</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Polls</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Elections</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold mb-4">Help</h4>
            <ul className="space-y-2 text-background/70">
              <li><a href="#" className="hover:text-primary transition-colors">Society Rules</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">How It Works</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact Committee</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Report Issue</a></li>
            </ul>
          </div>
        </div>

          <div className="pt-8 border-t border-background/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-background/50">
              © 2025 Gokuldham Society. All rights reserved.
            </p>
            <p className="flex items-center gap-1 text-sm text-background/50">
              Powered by <a href="https://astrazen.co" target="_blank" rel="noopener noreferrer" className="font-bold text-primary hover:underline transition-all">Astrazen</a>
            </p>
          </div>
      </div>
    </footer>
  );
};

export default Footer;
