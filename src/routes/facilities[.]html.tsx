import { createFileRoute } from "@tanstack/react-router";
import { FacilitiesPage } from "../components/pages/facilities";
import { pageHead } from "../lib/seo";

export const Route = createFileRoute("/facilities.html")({
  head: ({ matches }) => pageHead("facilities", matches),
  component: FacilitiesPage,
});
