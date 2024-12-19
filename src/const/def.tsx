
export interface Collect {
  [key: string]: string | number | string[],
  favicon?: any;
  cover?: any;
  id: number;
  name: string;
  url: string;
  description: string;
  tags: string[];
  open: number;
  create: string;
  update: string;
}

export const DEFAULT_COLLECT: Collect = {
  id: -1,
  name: '',
  url: '',
  description: '',
  tags: [],
  open: 0,
  create: new Date().toLocaleDateString(),
  update: new Date().toLocaleDateString(),
};