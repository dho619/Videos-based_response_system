import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { z } from "zod";

export async function updateCategoryRoute(app: FastifyInstance){
    app.patch('/categories/:categoryId', async (request) => {
        const paramSchema = z.object({
            categoryId: z.string().uuid(),
        });

        const { categoryId } = paramSchema.parse(request.params);

        const bodySchema = z.object({
            name: z.string(),
        })

        const { name } = bodySchema.parse(request.body);

        const category = await prisma.category.update({
            data: {
                name: name,
            },
            where: {
                id: categoryId
            }
        })

        return {
            category,
        }
    })
}