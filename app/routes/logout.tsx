import type { Route } from "./+types/logout";
import { redirect } from "react-router";
import { destroySession, getSession } from "~/server/session.server";

export const action = async ({ request }: Route.ActionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  return redirect("/login", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
};