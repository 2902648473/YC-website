import { createFileRoute } from "@tanstack/react-router";
import { ContactPage } from "../components/pages/contact";
import { pageHead } from "../lib/seo";

export const Route = createFileRoute("/contact.html")({
  head: ({ matches }) => pageHead("contact", matches),
  component: ContactPage,
});
