import { FastifyInstance } from "fastify";
import { z } from "zod";
import { generaAICompletion, respondBasedOnTranscripts } from "../lib/openai";
import { prisma } from "../lib/prisma";

export async function answerQuestions(app: FastifyInstance){
    app.post('/ai/answer', async (request, reply) => {
        const bodySchema = z.object({
            prompt: z.string(),
            prefix: z.string().optional(),
            videoId: z.string().optional(),
        })

        const { prompt, prefix, videoId } = bodySchema.parse(request.body);

        if (!videoId){
            const response = await respondBasedOnTranscripts(prompt, prefix ?? "");

            return response?.text ?? "Nenhuma resposta encontrada"
        }

        const video = await prisma.video.findUniqueOrThrow({
            where: {
                id: videoId
            }
        });

        const promptTemplate = `
            Você responde perguntas baseada na transcrições de um video.
            O usuário está assistindo escolheu esse video e espera uma resposta sobre ele.
            Use o conteúdo das transcrição que será fornecido abaixo para responder ao usuário.
            Se a resposta não for encontrada na transcrição, responda que você não sabe, não tente inventar uma resposta.

            Transcrições:
            ${video.transcription ?? ""}

            Pergunta:
            ${prompt}
        `.trim();

        await generaAICompletion(.3, promptTemplate, reply.raw);        
    })

}
