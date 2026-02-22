import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BookOpen,
  GraduationCap,
  Heart,
  LayoutDashboard,
  Library,
  DollarSign,
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useRole, UserRole } from "@/contexts/RoleContext";
import { cn } from "@/lib/utils";

const studentLinks = [
  { label: "Browse Courses", to: "/courses", icon: BookOpen },
  { label: "My Learning", to: "/my-learning", icon: GraduationCap },
  { label: "Favorites", to: "/favorites", icon: Heart },
];

const instructorLinks = [
  { label: "Dashboard", to: "/instructor", icon: LayoutDashboard },
  { label: "My Courses", to: "/instructor/courses", icon: Library },
  { label: "Revenue", to: "/instructor/revenue", icon: DollarSign },
];

export default function Navbar() {
  const { role, setRole } = useRole();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeRole = user?.role || role;
  const links = activeRole === "instructor" ? instructorLinks : studentLinks;

  const roleLabels: Record<UserRole, string> = { student: "Student", instructor: "Instructor", admin: "Admin" };
  const initials = useMemo(() => {
    if (!user?.name) return "U";
    const parts = user.name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }, [user?.name]);

  const handleLogout = () => {
    logout();
    setRole("student");
    setMobileOpen(false);
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            EduFlow
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent",
                  location.pathname === link.to ? "bg-accent text-foreground" : "text-muted-foreground"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                    {initials}
                  </div>
                  <span className="hidden sm:inline text-sm">{roleLabels[activeRole]}</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="truncate">{user.name}</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs text-muted-foreground">{user.email}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="gap-2 text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button asChild variant="ghost">
                <Link to="/login">Log In</Link>
              </Button>
              <Button asChild className="gradient-primary border-0 text-primary-foreground">
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          )}

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-card p-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  location.pathname === link.to ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 border-t border-border pt-4">
            {isAuthenticated ? (
              <Button variant="outline" className="w-full justify-start gap-2" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                Log out
              </Button>
            ) : (
              <div className="flex flex-col gap-2">
                <Button asChild variant="outline" className="w-full">
                  <Link to="/login" onClick={() => setMobileOpen(false)}>
                    Log In
                  </Link>
                </Button>
                <Button asChild className="w-full gradient-primary border-0 text-primary-foreground">
                  <Link to="/signup" onClick={() => setMobileOpen(false)}>
                    Sign Up
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
