export interface WorkshopVariable {
  key: string;
  label: string;
  placeholder: string;
}

export interface WorkshopCard {
  slug: string;
  title: string;
  description: string;
  otp: string;
}

export interface WorkshopPromptItem {
  type: 'prompt';
  id: string;
  title: string;
  content: string;
  description?: string;
}

export type StarterPickerIcon = 'landing' | 'web-app' | 'mobile';

export interface StarterPickerOption {
  id: string;
  title: string;
  subtitle: string;
  icon: StarterPickerIcon;
  content: string;
}

export interface WorkshopStarterPickerItem {
  type: 'starter-picker';
  id: string;
  title: string;
  description?: string;
  options: StarterPickerOption[];
}

export interface WorkshopDesignShowcaseItem {
  type: 'design-showcase';
  id: string;
  title: string;
  description?: string;
  href: string;
  slugs: string[];
}

export interface IdeaBankIdea {
  title: string;
  description: string;
}

export interface IdeaBankCategory {
  title: string;
  ideas: IdeaBankIdea[];
}

export interface IdeaBankData {
  heading: string;
  categories: IdeaBankCategory[];
  bonus: {
    title: string;
    ideas: string[];
  };
}

export interface WorkshopIdeaBankItem {
  type: 'idea-bank';
  id: string;
  title: string;
  description?: string;
}

export type WorkshopItem =
  | WorkshopPromptItem
  | WorkshopStarterPickerItem
  | WorkshopDesignShowcaseItem
  | WorkshopIdeaBankItem;

export interface WorkshopSection {
  title: string;
  eyebrow: string;
  items: WorkshopItem[];
}

export interface WorkshopConfig {
  hub: {
    eyebrow?: string;
    title: string;
    notice?: string;
    subtitle: string;
    footnote?: string;
    about?: string;
    meta?: string;
    cta?: { label: string; url: string };
  };
  cards: WorkshopCard[];
  variables: WorkshopVariable[];
  sections: Record<string, WorkshopSection>;
}

/** @deprecated Use WorkshopPromptItem */
export type WorkshopPrompt = WorkshopPromptItem;
