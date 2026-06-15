import { redirect } from "next/navigation";

// Root URL immediately sends visitors to the login screen
export default function Home() {
  redirect("/login");
}