import { FastifyInstance } from "fastify";
import { z } from 'zod';
import { prisma } from "../lib/prisma";
import { createTranscription } from "../lib/openai";

export async function createTranscriptionRoute(app: FastifyInstance){
    app.post('/videos/:videoId/transcription', async (request, reply) => {
        const paramSchema = z.object({
            videoId: z.string().uuid(),
        });

        const { videoId } = paramSchema.parse(request.params);

        const bodySchema = z.object({
            prompt: z.string(),
        })

        const { prompt } = bodySchema.parse(request.body);

        const video = await prisma.video.findUniqueOrThrow({
            where: {
                id: videoId
            }
        });

        const videoPath = video.path;

        if (videoPath === null)
            reply.status(400).send({ error: "Video path was not found."});


        const response = await createTranscription(videoPath!, prompt);

        const transcription = response.text;

        await prisma.video.update({
            where: {
                id: videoId,
            },
            data: {
                transcription: transcription,
            }
        })

        return { transcription };
    })
}