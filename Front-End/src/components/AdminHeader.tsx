'use client'

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import AuthButton from '@/components/AuthButton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function AdminHeader() {
  const { data: session } = useSession();
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/admin">
          <h1 className="text-xl font-semibold text-gray-900">Administration</h1>
        </Link>
        <div className="flex items-center gap-4">
          {session?.user && (
            <Badge variant="secondary" className="text-xs">
              {session.user.role}
            </Badge>
          )}
          <Link href="/">
            <Button variant="outline" size="sm">
              Accueil
            </Button>
          </Link>
          <AuthButton />
        </div>
      </div>
    </header>
  );
}
