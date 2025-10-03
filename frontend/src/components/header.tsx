'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/auth-context';
import { SidebarTrigger } from './ui/sidebar';

export default function Header() {
  const { user, logout } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center shrink-0 gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
        <SidebarTrigger className="md:hidden"/>
        <div className="flex-1">
            {/* Page title can be added here dynamically */}
        </div>
        {user && (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 border-2 border-primary">
                        <AvatarImage src={`https://picsum.photos/seed/${user.id}/40/40`} alt={user.full_name} data-ai-hint="person portrait" />
                        <AvatarFallback className="bg-primary/20 text-primary font-semibold">{getInitials(user.full_name)}</AvatarFallback>
                    </Avatar>
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.full_name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                    Log out
                </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        )}
    </header>
  );
}
