import { FastifyInstance } from "fastify";
import { fastifyMultipart } from "@fastify/multipart";
import path from "node:path";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import {pipeline } from "node:stream";
import { promisify } from "node:util";
import { z } from "zod";
import { loadJsonToRedis } from "../lib/loader";
import { deleteRedisUsingPrefix } from "../lib/redis";

const pump = promisify(pipeline)

export async function uploadJsonRoute(app: FastifyInstance){
    app.register(fastifyMultipart, {
        limits: {
            fileSize: 1_048_576 * 25, //25mb
        },
        addToBody: true,
    })

    app.post('/json/upload', async (request, reply) => {
        try {
            const bodySchema = z.object({
                deleteRepeated: z.boolean(),
            })
    
            const { deleteRepeated } = bodySchema.parse(request.body);

            const data = await request.file()

            if (!data) {
                return reply.status(400).send({ error: "Missing file input." })
            }

            const extension = path.extname(data.filename)

            if (extension !== '.json') {
                return reply.status(400).send({ error: "Invalid input type, please upload a json" })
            }

            const fileBaseName = path.basename(data.filename, extension)
            const fileUploadName = `${fileBaseName}-${randomUUID()}${extension}`
            const uploadDestination = path.resolve(__dirname, '../../tmp', fileUploadName)

            if (!fs.existsSync(uploadDestination.replace(fileUploadName, '')))
                fs.mkdirSync(uploadDestination.replace(fileUploadName, ''));

            await pump(data.file, fs.createWriteStream(uploadDestination));

            if (deleteRepeated) deleteRedisUsingPrefix(fileBaseName);

            await loadJsonToRedis(uploadDestination, fileBaseName);

            return reply.send({ success: "File uploaded successfully" });
        } catch (error) {
            return reply.status(500).send({ error: "Error reading the JSON file." });
        }
    })
}