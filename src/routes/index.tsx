import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "../components/pages/home";
import { pageHead } from "../lib/seo";

export const Route = createFileRoute("/")({
  head: ({ matches }) => pageHead("index", matches),
  component: HomePage,
});
