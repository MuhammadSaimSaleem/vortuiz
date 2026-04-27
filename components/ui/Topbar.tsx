"use client";

import { Bell, Search, Settings, LogOut, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
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

export default function TopBar({ onSaveDraft, onPublish, showActions }: {
  onSaveDraft?: () => void;
  onPublish?: () => void;
  showActions?: boolean;
}) {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border bg-white px-6 py-2">
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        <Input placeholder="Search quizzes or topics..."
          className="h-9 pl-9 text-sm bg-slate-50 border-border focus-visible:ring-brand-blue rounded-xl" />
      </div>
      <div className="flex items-center gap-2">
        {showActions && (
          <>
            <Button variant="ghost" size="sm" onClick={onSaveDraft}
              className="text-sm font-semibold text-slate-600 h-9 hover:text-brand-navy">
              Save Draft
            </Button>
            <Button size="sm" onClick={onPublish}
              className="bg-brand-navy mr-4 hover:bg-brand-blue text-white font-semibold text-sm h-9 px-5 rounded-xl transition-colors">
              Publish Quiz
            </Button>
          </>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              <Bell className="h-4 w-4 text-slate-500" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-brand-navy text-white border-none shadow-lg"><p>Notifications</p></TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              <Settings className="h-4 w-4 text-slate-500" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-brand-navy text-white border-none shadow-lg"><p>Settings</p></TooltipContent>
        </Tooltip>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 cursor-pointer group">
              <Avatar className="h-9 w-9 border-2 border-transparent group-hover:border-brand-blue transition-all">
                <AvatarFallback className="bg-brand-navy text-white text-xs font-bold">SK</AvatarFallback>
              </Avatar>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-2">
            <DropdownMenuLabel>Abdullah SK</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500">Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}