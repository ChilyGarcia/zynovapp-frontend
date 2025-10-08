import { ReactNode } from 'react';

declare const SidebarItem: React.FC<{
  icon: ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}>;

export default SidebarItem;
