import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchListing } from '@/api/server';
import { ListingView } from './ListingView';

function parseId(raw: string) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const id = parseId((await params).id);
  const listing = id ? await fetchListing(id) : null;
  if (!listing) return {};
  return {
    title: `${listing.offer.title} · ${listing.venue.name}`,
    description: listing.offer.description ?? listing.venue.address,
    openGraph: {
      title: listing.offer.title,
      images: listing.offer.photoUrl ? [listing.offer.photoUrl] : undefined,
    },
  };
}

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const id = parseId((await params).id);
  const listing = id ? await fetchListing(id) : null;
  if (!id || !listing) notFound();
  return <ListingView id={id} initialListing={listing} />;
}
