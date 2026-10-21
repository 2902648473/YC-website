import { createFileRoute } from "@tanstack/react-router";
import { GuidePage } from "../components/pages/guide";
import { pageHead } from "../lib/seo";

export const Route = createFileRoute("/guide.html")({
  head: ({ matches }) => pageHead("guide", matches),
  component: GuidePage,
});
