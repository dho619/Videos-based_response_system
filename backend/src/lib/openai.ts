import { OpenAI } from "openai";
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { ConversationalRetrievalQAChain, RetrievalQAChain } from 'langchain/chains';
import { PromptTemplate } from 'langchain/prompts';
import 'dotenv/config';
import { redis, redisVectorStore } from './redis';
import { createReadStream } from "node:fs";
import { OpenAIEmbeddings } from "langchain/embeddings/openai"
import { streamToResponse, OpenAIStream } from 'ai';
import { IncomingMessage, ServerResponse } from "node:http";
import { BufferMemory } from "langchain/memory";

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY,
});

export const openAIEmbeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_KEY
});

export async function createTranscription(videoPath: string, prompt: string) {
    const audioReadStream = createReadStream(videoPath!);

    return await openai.audio.transcriptions.create({
        file: audioReadStream,
        model: 'whisper-1',
        language: 'pt',
        response_format: 'json',
        temperature: 0,
        prompt
    });
}

export async function generaAICompletion(temperature: number, promptMessage: string, replyRaw:  ServerResponse<IncomingMessage>) {
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-16k",
        temperature,
        messages: [{
            role: "user",
            content: promptMessage
        }],
        stream: true,
    })

    const stream = OpenAIStream(response);

    streamToResponse(stream, replyRaw, {
        headers
    });
}

export async function respondBasedOnTranscripts(question: string, prefix: string) {
    const prompt = new PromptTemplate({
        template: `
            Você responde perguntas baseada em transcrições de video.
            O usuário está assistindo vários videos.
            Use o conteúdo das transcrições dos videos abaixo para responder ao usuário.
            Se a resposta não for encontrada nas transcrições, responda que você não sabe, não tente inventar uma resposta.
    
            Transcrições:
            {context}
    
            Pergunta:
            {question}
        `.trim(),
        inputVariables: ['context', 'question'],
    });

    const openAiChat = new ChatOpenAI({
        openAIApiKey: process.env.OPENAI_KEY,
        modelName: 'gpt-3.5-turbo',
        temperature: 0.3,
    });

    await redis.connect();

    const chain = RetrievalQAChain.fromLLM(openAiChat, redisVectorStore(prefix).asRetriever(), {
        prompt
        // returnSourceDocuments: true,
        // verbose: true,
    });
    
    const response = await chain.call({
        query: question
    });

    
    // const stream = OpenAIStream(response);
    
    // streamToResponse(stream, replyRaw, {
    //     headers
    // });
    
    await redis.disconnect();

    return response;
}