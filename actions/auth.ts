'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { encrypt } from '@/lib/auth';

export async function login(formData: FormData) {
  const password = formData.get('password') as string;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return { error: 'ADMIN_PASSWORD is not configured' };
  }

  if (password === adminPassword) {
    // Create the session
    const expires = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
    const session = await encrypt({ user: 'admin', expires: expires.toISOString() });

    // Save the session in a cookie
    const cookieStore = await cookies();
    cookieStore.set('admin_session', session, {
      expires,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    redirect('/admin');
  } else {
    return { error: 'Mot de passe incorrect' };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
  redirect('/');
}
