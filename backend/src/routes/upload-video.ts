import { FastifyInstance } from "fastify";
import { fastifyMultipart } from "@fastify/multipart";
import path from "node:path";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import {pipeline } from "node:stream";
import { promisify } from "node:util";
import { prisma } from "../lib/prisma";
import { z } from "zod";

const pump = promisify(pipeline)

export async function uploadVideoRoute(app: FastifyInstance){
    app.register(fastifyMultipart, {
        limits: {
            fileSize: 1_048_576 * 25, //25mb
        }
    })

    app.post('/videos/:videoId/upload', async (request, reply) => {
        const paramSchema = z.object({
            videoId: z.string().uuid(),
        });

        const { videoId } = paramSchema.parse(request.params);

        const data = await request.file()

        if (!data) {
            return reply.status(400).send({ error: "Missing file input." })
        }

        const extension = path.extname(data.filename)

        if (extension !== '.mp3') {
            return reply.status(400).send({ error: "Invalid input type, please upload a MP3" })
        }

        const fileBaseName = path.basename(data.filename, extension)
        const fileUploadName = `${fileBaseName}-${randomUUID()}${extension}`
        const uploadDestination = path.resolve(__dirname, '../../tmp', fileUploadName)

        if (!fs.existsSync(uploadDestination.replace(fileUploadName, '')))
            fs.mkdirSync(uploadDestination.replace(fileUploadName, ''));

        await pump(data.file, fs.createWriteStream(uploadDestination))

        const video = await prisma.video.update({
            data: {
                fileName: data.filename,
                path: uploadDestination,
            },
            where: {
                id: videoId
            }
        })

        return {
            video,
        }
    })
}