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