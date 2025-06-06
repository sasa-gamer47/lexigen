export type CreateUserParams = {
    clerkId: string
    username: string
    email: string
    photo: string
}

export type CreateMindMapParams = {
    title: string
    description: string
    createdAt: Date
    owner: string
    mindMap: any
}

export type CreateQuizParams = {
    title: string
    description: string
    owner: string
    quiz: any
    history: any
    createdAt: Date
}

export type LessonContent = {
    indexTitle: string;
    item: string;
    simplified: string;
    detailed: string;
    schematic: string;
    indexNumber: number;
    itemNumber: number;
    mindMap?: any;
}

export type Lesson = {
  _id: string;
  title: string;
  description: string;
  owner: string;
  topic: string;
  language: string;
  index: string[][];
  lessons: any //LessonContent;
  history: any[];
  createdAt: Date;
}

export type CreateLessonParams = {
  title: string
  description: string
  owner: string
  createdAt: Date
  topic: string
  language: string
  index: any
  lessons: any //LessonContent
  history: any[]
}
