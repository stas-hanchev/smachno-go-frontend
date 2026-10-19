import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchVenue, fetchVenueListings } from '@/api/server';
import { VenueView } from './VenueView';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const venue = await fetchVenue((await params).slug);
  if (!venue) return {};
  return {
    title: venue.name,
    description: venue.description ?? `${venue.category.name}, ${venue.address}`,
    openGraph: { title: venue.name, images: venue.coverUrl ? [venue.coverUrl] : undefined },
  };
}

export default async function VenuePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [venue, listings] = await Promise.all([fetchVenue(slug), fetchVenueListings(slug)]);
  if (!venue) notFound();
  return <VenueView slug={slug} initialVenue={venue} initialListings={listings ?? []} />;
}
