import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/index.html")({
  beforeLoad: ({ location }) => {
    throw redirect({
      to: "/",
      hash: location.hash,
      search: location.search,
      statusCode: 301,
    });
  },
});
