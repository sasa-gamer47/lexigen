'use server'

import { revalidatePath } from 'next/cache'

import { connectToDatabase } from '@/lib/database'
import User from '@/lib/database/models/user.model'
import { handleError } from '@/lib/utils'
import { CreateMindMapParams } from '@/types'

import { Schema, Types, model, models } from "mongoose";
import MindMap from '../database/models/mindmap.model'

export async function createMindMap(mindMap: CreateMindMapParams) {
try {
    await connectToDatabase()


    console.log('mindMap: ', mindMap)

    console.log(mindMap.mindMap)

    const newMindMap = await MindMap.create(mindMap)

    const user = await User.findOneAndUpdate(
        { _id: mindMap.owner },
        { $push: { mindMaps: newMindMap._id } },
        { new: true }
    )

    console.log('newMindMap: ', newMindMap)

    return JSON.parse(JSON.stringify(mindMap))
} catch (error) {
    handleError(error)
}
}

export async function getMindMaps(userId: string) {
    try {
        await connectToDatabase()

        console.log(userId)
        const mindMaps = await MindMap.find({ owner: userId })

        console.log('mindMaps: ', mindMaps)

        return JSON.parse(JSON.stringify(mindMaps))
    } catch (error) {
        handleError(error)
    }
}


export async function getMindMap(mindMapId: string) {
    try {
        await connectToDatabase()

        const mindMap = await MindMap.findOne({ _id: mindMapId })

        console.log('mindMap: ', mindMap)

        return JSON.parse(JSON.stringify(mindMap))
    } catch (error) {
        handleError(error)
    }
}