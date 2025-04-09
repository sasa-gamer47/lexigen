export interface Lesson {
  _id: string;
  title: string;
  description: string;
  owner: string;
  createdAt: Date;
  topic: string;
  language: string;
  index: string[][];
  lessons: {
    indexTitle: string;
    item: string;
    simplified: string;
    detailed: string;
    schematic: string;
    indexNumber: number;
    itemNumber: number;
    mindMap: any;
  }[];
  history: any[];
}
