import { createClient } from 'redis';
import { RedisVectorStore, RedisVectorStoreConfig } from 'langchain/vectorstores/redis'
import { Document } from "langchain/document";
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';

export const redis = createClient({
    url: process.env.REDIS_URL
});

const redisVectorStoreConfig = (prefix: string): RedisVectorStoreConfig => {
    return {
        indexName: 'videos-embeddings',
        redisClient: redis,
        keyPrefix: `videos:${prefix}${prefix !== '' ? ':' : ''}`
    };
};

export const redisVectorStore = (prefix: string) => {
    return new RedisVectorStore(
        new OpenAIEmbeddings({
            openAIApiKey: process.env.OPENAI_KEY
        }),
        redisVectorStoreConfig(prefix)
    );
}

export async function deleteRedisUsingPrefix(prefix: string) {
    await redis.connect();
    const keys = await redis.keys(`videos:${prefix}${prefix !== '' ? ':' : ''}*`);
    if (keys.length > 0) {
        await redis.del(keys);
    }
    await redis.disconnect();
}

export async function saveRedisFromDocuments(splitedDocuments: Document<Record<string, any>>[], prefix: string) {
    await redis.connect();
    
    await RedisVectorStore.fromDocuments(
        splitedDocuments,
        new OpenAIEmbeddings({
            openAIApiKey: process.env.OPENAI_KEY
        }),
        redisVectorStoreConfig(prefix)
    );

    await redis.disconnect();
}

export async function searchRedis(question: string, prefix: string) {
    await redis.connect();

    const vectorStore = redisVectorStore(prefix);

    const response = await vectorStore.similaritySearchWithScore(
        question,
        3,
    );

    await redis.disconnect();

    return response;
}