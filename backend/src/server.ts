import { fastify } from "fastify";
import { fastifyCors } from "@fastify/cors";
import { getAlllPromptsRoute as getAllPromptsRoute } from "./routes/get-all-prompts";
import { uploadVideoRoute } from "./routes/upload-video";
import { createTranscriptionRoute } from "./routes/create-transcription";
import { generaAICompletionRoute } from "./routes/generate-ai-completion";
import { updateCategoryRoute } from "./routes/update-category";
import { createCategoriesRoute } from "./routes/create-category";
import { getAllCategoriesRoute } from "./routes/get-all-categories";
import { getAllVideosRoute } from "./routes/get-all-videos";
import { createVideoRoute } from "./routes/create-video";
import { updateVideoRoute } from "./routes/update-video";

const app = fastify()

app.register(fastifyCors, {
    origin: '*',
});

app.register(getAllPromptsRoute)
app.register(createVideoRoute)
app.register(updateVideoRoute)
app.register(uploadVideoRoute)
app.register(createTranscriptionRoute)
app.register(generaAICompletionRoute)
app.register(updateCategoryRoute)
app.register(createCategoriesRoute)
app.register(getAllCategoriesRoute)
app.register(getAllVideosRoute)

app.listen({
    port: 3333,
}).then(() => {
    console.log('HTTP Server Running!')
})