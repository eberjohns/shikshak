'use client';

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { useAuth } from '@/context/auth-context';
import type { User } from '@/lib/types';
import { BookOpenCheck, LayoutDashboard, History, LogOut, Library } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AppSidebar({ user }: { user: User }) {
  const { logout } = useAuth();
  const pathname = usePathname();

  const teacherNav = [
    { name: 'Dashboard', href: '/dashboard/teacher/1', icon: LayoutDashboard },
    // More teacher links can be added here
  ];

  const studentNav = [
    { name: 'Dashboard', href: '/dashboard/student', icon: LayoutDashboard },
    { name: 'My Exams', href: '/exams', icon: Library },
  ];

  const navItems = user.role === 'teacher' ? teacherNav : studentNav;

  return (
    <Sidebar>
      <SidebarHeader className="h-16 border-b">
        <Link href="/dashboard" className="flex items-center gap-2" >
            <BookOpenCheck className="h-8 w-8 text-primary" />
            <h1 className="font-headline text-xl font-semibold text-primary">Shikshak</h1>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.name}>
              <Link href={item.href} passHref>
                <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={{children: item.name}}
                >
                    <item.icon />
                    <span>{item.name}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton onClick={logout} tooltip={{children: 'Logout'}}>
                    <LogOut />
                    <span>Logout</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
