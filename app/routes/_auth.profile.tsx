import { ProfileView } from "./_auth.main-page/ProfileView";
import type { Route } from "./+types/_auth.profile";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Профиль" },
    { name: "description", content: "Информация о вашем Twitch-профиле" },
  ];
}

export default function ProfilePageRoute() {
  return <ProfileView />;
}
