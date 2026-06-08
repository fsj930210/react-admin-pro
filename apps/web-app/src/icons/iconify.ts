import { icons as carbonIcons } from "@iconify-json/carbon";
import { icons as lucideIcons } from "@iconify-json/lucide";
import { icons as riIcons } from "@iconify-json/ri";
import { addCollection } from "@iconify/react";

export function registerIconifyCollections() {
  addCollection(lucideIcons);
  addCollection(carbonIcons);
  addCollection(riIcons);
}
