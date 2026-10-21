import { createFileRoute } from "@tanstack/react-router";
import { AboutPage } from "../components/pages/about";
import { pageHead } from "../lib/seo";

export const Route = createFileRoute("/about.html")({
  head: ({ matches }) => pageHead("about", matches),
  component: AboutPage,
});
