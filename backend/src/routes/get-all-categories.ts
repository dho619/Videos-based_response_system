import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";

export async function getAllCategoriesRoute(app: FastifyInstance){
    app.get('/categories', async () => {
        const categories = await prisma.category.findMany()
    
        return categories
    })
}