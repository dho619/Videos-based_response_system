import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { z } from "zod";

export async function createCategoriesRoute(app: FastifyInstance){
    app.post('/categories', async (request) => {
        const bodySchema = z.object({
            name: z.string(),
        })

        const { name } = bodySchema.parse(request.body);

        const category = await prisma.category.create({
            data: {
                name: name,
            }
        })

        return {
            category,
        }
    })
}