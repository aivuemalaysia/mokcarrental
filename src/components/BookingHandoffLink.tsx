'use client';

import type { ComponentPropsWithoutRef } from 'react';
import { usePathname } from 'next/navigation';
import { bookingUrlForPath } from '@/lib/bookingHandoff';

type BookingHandoffLinkProps = Omit<ComponentPropsWithoutRef<'a'>, 'href'>;

/** Consistent sitewide PWA attribution, including navbar/footer and vehicle pages. */
export default function BookingHandoffLink({ children, ...props }: BookingHandoffLinkProps) {
  const pathname = usePathname();
  return <a {...props} href={bookingUrlForPath(pathname || '/')}>{children}</a>;
}
