import { IconCloud } from "@/components/magicui/icon-cloud";

const slugs = [
  "reddit",
  "x",
  "discord",
  "stackoverflow",
  "slack",
  "pinterest",
  "whatsapp",
  "reddit",
  "x",
  "discord",
  "stackoverflow",
  "slack",
  "pinterest",
  "whatsapp",
  "reddit",
  "x",
  "discord",
  "stackoverflow",
  "slack",
  "pinterest",
  "whatsapp",
  "reddit",
  "x",
  "discord",
  "stackoverflow",
  "slack",
  "pinterest",
  "whatsapp",
];

export default function IconCloudDisplay() {
  return (
    <div className="relative flex h-full w-full max-w-[32rem] items-center justify-center overflow-hidden rounded-lg bg-background px-20 pb-20 pt-8 ">
      <IconCloud iconSlugs={slugs} />
    </div>
  );
}
