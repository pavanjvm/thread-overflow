import { IconCloud } from "@/components/magicui/icon-cloud";

const slugs = [
  "reddit",
  "instagram",
  "stackoverflow",
  "whatsapp",
  "facebook",
  "x",
  "linkedin",
  "discord",
  "telegram",
  "slack",
  "youtube",
  "pinterest",
  "tiktok",
  "snapchat",
  "medium",
  "quora",
  "dribbble",
  "behance",
  "twitch",
  "spotify",
  "soundcloud",
];

export default function IconCloudDisplay() {
  return (
    <div className="relative flex h-full w-full max-w-[32rem] items-center justify-center overflow-hidden rounded-lg bg-background px-20 pb-20 pt-8 ">
      <IconCloud iconSlugs={slugs} />
    </div>
  );
}
