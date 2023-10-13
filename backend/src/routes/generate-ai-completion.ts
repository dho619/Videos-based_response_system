import { FastifyInstance } from "fastify";
import { z } from 'zod';
import { prisma } from "../lib/prisma";
import { generaAICompletion } from "../lib/openai";

export async function generaAICompletionRoute(app: FastifyInstance){
    app.post('/ai/complete', async (request, reply) => {
        const bodySchema = z.object({
            videoId: z.string().uuid(),
            prompt: z.string(),
            temperature: z.number().min(0).max(1).default(0.5),
        })

        const { videoId, prompt, temperature } = bodySchema.parse(request.body);

        const video = await prisma.video.findUniqueOrThrow({
            where: {
                id: videoId
            }
        });

        if (!video.transcription) {
            return reply.status(404).send({ error: "Video transcription was not generated yet."});
        }

        const promptMessage = prompt.replace('{transcription}', video.transcription);

        await generaAICompletion(temperature, promptMessage, reply.raw);
    });
}