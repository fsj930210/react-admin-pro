export type LayoutTabItem = {
  label: string;
  value: string;
};

export type LayoutTabItemProps = {
  tab: LayoutTabItem;
  onClick: (value: string) => void;
  active: boolean;
};