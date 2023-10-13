import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { JsonTranscription, deleteTranscriptionFileIfExist, saveJsonTranscription } from "../utils/json";
import { loadStringToRedis } from "../lib/loader";
import { deleteRedisUsingPrefix } from "../lib/redis";

export async function updateVideoRoute(app: FastifyInstance){
    app.patch('/videos/:videoId', async (request, reply) => {
        try {
            const paramSchema = z.object({
                videoId: z.string().uuid(),
            });
    
            const { videoId } = paramSchema.parse(request.params);
    
            const bodySchema = z.object({
                title: z.string().optional(),
                description: z.string().optional(),
                categoryId: z.string().optional(),
                transcriptionPrompt: z.string().optional(),
                transcription: z.string().optional()
            })
    
            const { 
                title,
                description,
                categoryId,
                transcriptionPrompt,
                transcription
            } = bodySchema.parse(request.body);
    
            const data = {};
            if (title) data["title"] = title;
            if (description) data["description"] = description;
            if (categoryId) data["categoryId"] = categoryId;
            if (transcriptionPrompt) data["transcriptionPrompt"] = transcriptionPrompt;
            if (transcription) data["transcription"] = transcription;
    
            const video = await prisma.video.update({
                data,
                where: {
                    id: videoId
                }
            })
    
            if (transcription) {
                deleteTranscriptionFileIfExist(videoId);
    
                var formattedTranscription: JsonTranscription = {
                    language: "portuguese",
                    text: transcription,
                }
    
                const path = saveJsonTranscription(
                    videoId,
                    formattedTranscription
                );
    
                const prefix = `${video.categoryId}:${videoId}`;
                await deleteRedisUsingPrefix(prefix);
                await loadStringToRedis(transcription, prefix);
            }
    
            return {
                video,
            }
        } catch (error) {
            console.log(error);
            return reply.status(400).send({ error: "Error on update video" });
        }
    })
}