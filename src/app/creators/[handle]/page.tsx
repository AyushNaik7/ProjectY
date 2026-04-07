import { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-server";
import { CreatorPublicProfile } from "@/components/portfolio/CreatorPublicProfile";

interface PageProps {
  params: { handle: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = params;

  // Fetch creator by handle
  const { data: creator } = await supabaseAdmin
    .from("creators")
    .select("*")
    .eq("instagram_handle", handle)
    .single();

  if (!creator) {
    return {
      title: "Creator Not Found",
    };
  }

  const title = `${creator.name} - ${creator.niche} Creator | InstaCollab`;
  const description =
    creator.bio ||
    `${creator.name} is a ${creator.niche} content creator with ${creator.instagram_followers?.toLocaleString()} followers. Connect on InstaCollab.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      url: `https://instacollab.com/creators/${handle}`,
      images: [
        {
          url: `/api/og/creator?handle=${handle}`,
          width: 1200,
          height: 630,
          alt: creator.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/api/og/creator?handle=${handle}`],
    },
  };
}

export default async function CreatorProfilePage({ params }: PageProps) {
  const { handle } = params;

  // Fetch creator with portfolio
  const { data: creator, error } = await supabaseAdmin
    .from("creators")
    .select(
      `
      *,
      portfolio_items (*)
    `
    )
    .eq("instagram_handle", handle)
    .single();

  if (error || !creator) {
    notFound();
  }

  // Sort portfolio items
  if (creator.portfolio_items) {
    creator.portfolio_items.sort(
      (a: any, b: any) => a.display_order - b.display_order
    );
  }

  // Track profile view (client-side will handle this)
  
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: creator.name,
            jobTitle: "Content Creator",
            description: creator.bio,
            sameAs: creator.instagram_handle
              ? `https://instagram.com/${creator.instagram_handle}`
              : undefined,
            aggregateRating: creator.avg_rating
              ? {
                  "@type": "AggregateRating",
                  ratingValue: creator.avg_rating,
                  reviewCount: creator.total_reviews || 0,
                  bestRating: 5,
                  worstRating: 1,
                }
              : undefined,
          }),
        }}
      />

      <CreatorPublicProfile creator={creator} />
    </>
  );
}
