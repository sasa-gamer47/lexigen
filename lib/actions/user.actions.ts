'use server'

import { revalidatePath } from 'next/cache'

import { connectToDatabase } from '@/lib/database'
import User from '@/lib/database/models/user.model'
import { handleError } from '@/lib/utils'
import { CreateUserParams } from '@/types'


import { Schema, Types, model, models } from "mongoose";

export async function createUser(user: CreateUserParams) {
try {
    await connectToDatabase()

    const newUser = await User.create(user)
    return JSON.parse(JSON.stringify(newUser))
} catch (error) {
    handleError(error)
}
}

// const populateUser = async (query: any) => {
//     let user = await query
//         .populate({
//             path: 'collections',
//             model: 'Collection',
//             select: '_id title description posts createdAt updatedAt',
//             options: { sort: { 'createdAt': -1 } },
//         }).exec()

//     console.log('user user: ', user)

//     return user;
// };

export async function getUserById(userId: string) {
try {
    await connectToDatabase()

        // const post = await Post.findById(postId)

        const userQuery = User.findById(userId)


        
        
        // const user = await populateUser(userQuery)

        // console.log(user?.comments);

        const user = User.findById(userId)
        

        if (!user) throw new Error('User not found')
        return JSON.parse(JSON.stringify(user))
} catch (error) {
    handleError(error)
}
}

export async function getUserByClerkId(userId: string) {
try {
    await connectToDatabase()

    // console.log('mongodb: ', models, Schema)

    let user: any;

    // if (Collection.schema) {
    //     console.log('collections found')

    //     const userQuery = User.find({ clerkId: userId })
    //     user = await populateUser(userQuery)
    // } else {
    //     console.log('collections not found')
        
        user = await User.find({ clerkId: userId })
    // }

    
    // console.log('userId: ', userId)




        
        

    // console.log('user: ', user)

        // console.log(user?.comments);
        

    if (!user) throw new Error('User not found')
    return JSON.parse(JSON.stringify(user))
} catch (error) {
    handleError(error)
}
}

export async function updateUser({ clerkId, user }: any) { // : UpdateUserParams
try {
    await connectToDatabase()

    const updatedUser = await User.findOneAndUpdate({ clerkId }, user, { new: true })

    if (!updatedUser) throw new Error('User update failed')
    return JSON.parse(JSON.stringify(updatedUser))
} catch (error) {
    handleError(error)
}
}

export async function deleteUser(clerkId: string) {
try {
    await connectToDatabase()

    // Find user to delete
    const userToDelete = await User.findOne({ clerkId })

    if (!userToDelete) {
    throw new Error('User not found')
    }


    // Delete user
    const deletedUser = await User.findByIdAndDelete(userToDelete._id)
    revalidatePath('/')

    return deletedUser ? JSON.parse(JSON.stringify(deletedUser)) : null
} catch (error) {
    handleError(error)
}
}