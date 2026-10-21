import { createFileRoute } from "@tanstack/react-router";
import { ServicesPage } from "../components/pages/services";
import { pageHead } from "../lib/seo";

export const Route = createFileRoute("/services.html")({
  head: ({ matches }) => pageHead("services", matches),
  component: ServicesPage,
});
