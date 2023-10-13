import path from 'node:path';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { JSONLoader } from 'langchain/document_loaders/fs/json';
import { Document } from "langchain/document";
import { TokenTextSplitter } from 'langchain/text_splitter'
import { saveRedisFromDocuments } from './redis';

export async function loadFolderToRedis(folderPath: string) {
    const loader = new DirectoryLoader(
        path.resolve(__dirname, folderPath),
        {
            '.json': path => new JSONLoader(path, '/text')
        }
    );
    
    const docs = await loader.load()

    const splitter = new TokenTextSplitter({
        encodingName: 'cl100k_base',
        chunkSize: 600,
        chunkOverlap: 0,
    });

    const splitedDocuments = await splitter.splitDocuments(docs);

    await saveRedisFromDocuments(splitedDocuments, "");
}

export async function loadJsonToRedis(url: string, prefix: string) {
    const loader = new JSONLoader(url, '/text');

    const docs = await loader.load()

    const splitter = new TokenTextSplitter({
        encodingName: 'cl100k_base',
        chunkSize: 600,
        chunkOverlap: 0,
    });

    const splitedDocuments = await splitter.splitDocuments(docs);

    await saveRedisFromDocuments(splitedDocuments, prefix);
}

export async function loadStringToRedis(text: string, prefix: string) {
    const docs = [new Document({ pageContent: text })];

    const splitter = new TokenTextSplitter({
        encodingName: 'cl100k_base',
        chunkSize: 600,
        chunkOverlap: 0,
    });

    const splitedDocuments = await splitter.splitDocuments(docs);

    await saveRedisFromDocuments(splitedDocuments, prefix);
}