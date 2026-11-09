import Portfolio from "@/components/portfolio";
import { profile } from "@/lib/profile";

export default function Home() {
  return <Portfolio profile={profile} />;
}
