import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchListing } from '@/api/server';
import { isInteractionSource } from '@/lib/interactions';
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

export default async function ListingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string | string[] }>;
}) {
  const id = parseId((await params).id);
  const listing = id ? await fetchListing(id) : null;
  if (!id || !listing) notFound();
  const from = (await searchParams).from;
  const source = isInteractionSource(from) ? from : undefined;
  return <ListingView id={id} initialListing={listing} source={source} />;
}
