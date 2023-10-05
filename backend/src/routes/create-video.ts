import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { z } from "zod";

export async function createVideoRoute(app: FastifyInstance){
        app.post('/videos', async (request, reply) => {
            try {
                const bodySchema = z.object({
                    title: z.string(),
                    categoryId: z.string().optional(),
                })
        
                const { title, categoryId } = bodySchema.parse(request.body);

                const video = await prisma.video.create({
                    data: {
                        title: title,
                        categoryId: categoryId
                    }
                });
        
                return {
                    video,
                }
            } catch (error) {
                if (error.code === 'P2002') {
                    reply.status(409).send({ error: "Title provided already exists"});
                }
            }
        });
}