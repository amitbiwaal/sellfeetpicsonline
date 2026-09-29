import { BlogListing } from "@/components/blog/BlogListing";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 3600;

export const metadata = pageMetadata({
  title: "Blog: Guides, Platform Reviews & Safety Tips",
  description:
    "Honest platform reviews, step-by-step guides and privacy tips to help you sell feet pics online safely and earn with confidence.",
  path: "/blog/",
});

export default function BlogPage() {
  return <BlogListing page={1} />;
}
