// import path from 'node:path';
// import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
// import { JSONLoader } from 'langchain/document_loaders/fs/json';
// import { TokenTextSplitter } from 'langchain/text_splitter'
// import { RedisVectorStore } from 'langchain/vectorstores/redis'
// import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
// import { createClient } from 'redis';

// const loader = new DirectoryLoader(
//     path.resolve(__dirname, '../tmp'),
//     {
//         '.json': path => new JSONLoader(path, '/text')
//     }
// );

// async function load() {
//     const docs = await loader.load()

//     // console.log(docs);

//     const splitter = new TokenTextSplitter({
//         encodingName: 'cl100k_base',
//         chunkSize: 600,
//         chunkOverlap: 0,
//     });

//     const splitedDocuments = await splitter.splitDocuments(docs);

//     const redis = createClient({
//         url: 'redis://127.0.0.1:6379'
//     });

//     await redis.connect();

//     await RedisVectorStore.fromDocuments(
//         splitedDocuments,
//         new OpenAIEmbeddings({
//             openAIApiKey: "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"
//         }),
//         {
//             indexName: 'videos-embeddings',
//             redisClient: redis,
//             keyPrefix: 'videos'
//         }
//     );
    
//     await redis.disconnect();
// }

// load();