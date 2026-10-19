import Link from 'next/link';
import type { AnchorHTMLAttributes, Ref } from 'react';

export type RouterLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  href: string;
  ref?: Ref<HTMLAnchorElement>;
};

export function RouterLink(props: RouterLinkProps) {
  return <Link {...props} />;
}
