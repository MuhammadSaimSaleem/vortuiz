"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NotificationDropdown from "./NotificationModal";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client"; 
import { useRouter } from "next/navigation";

// Define the type according to your PostgreSQL schema
interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  avatar_initials: string | null;
}

export default function TopBar() {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        // 2. Get the currently logged-in auth user session
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) return;

        // 3. Fetch the matching row from your public.profiles table
        const { data, error: profileError } = await supabase
          .from("profiles")
          .select("full_name, email, avatar_url, avatar_initials")
          .eq("id", user.id)
          .single();

        if (!profileError && data) {
          setProfile({
            ...data,
            id: user.id
          })
        }
      } catch (error) {
        console.error("Error loading user profile:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserProfile();
  }, [supabase]);

  // Fallbacks if data is loading or fields are null
  const displayName = profile?.full_name || "User";
  const initials = profile?.avatar_initials || "U";

  const handleLogOut = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error("Error logging out:", error.message);
    } else {
      router.replace("/auth");
      router.refresh();
    }
  };

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border bg-white px-6 py-4">
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        <Input 
          placeholder="Search quizzes or topics..."
          className="h-9 pl-9 text-sm bg-slate-50 border-border focus-visible:ring-brand-blue rounded-xl" 
        />
      </div>
      
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
             <div>
                <NotificationDropdown 
                  open={isNotifOpen} 
                  setOpen={setIsNotifOpen} 
                  userId={profile?.id.toLowerCase() || ""}
                />
             </div>
          </TooltipTrigger>
          {/* Only show the tooltip content if the notification dropdown is actually closed */}
          {!isNotifOpen && (
            <TooltipContent className="bg-brand-navy text-white border-none shadow-lg">
              <p>Notifications</p>
            </TooltipContent>
          )}
        </Tooltip>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 cursor-pointer group">
              <Avatar className="h-9 w-9 border-2 border-transparent group-hover:border-brand-blue transition-all">
                {/* Render the image if the database has a URL and we aren't loading */}
                {!loading && profile?.avatar_url && (
                  <AvatarImage 
                    src={profile.avatar_url} 
                    alt={displayName} 
                    width={20}
                    height={20}
                  />
                )}
                {/* Fallback displays initials safely */}
                <AvatarFallback className="bg-brand-navy text-white text-xs font-bold">
                  {loading ? "..." : initials}
                </AvatarFallback>
              </Avatar>
            </div>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-46 mt-2">
            <DropdownMenuLabel className="font-semibold truncate max-w-45">
              {loading ? "Loading..." : displayName}
            </DropdownMenuLabel>  
            <DropdownMenuSeparator />
            <Link href={"/profile"}>
              <DropdownMenuItem className="cursor-pointer">Profile</DropdownMenuItem>
            </Link>
            <DropdownMenuItem className="cursor-pointer">Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-500 cursor-pointer"
              onClick={handleLogOut}
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}