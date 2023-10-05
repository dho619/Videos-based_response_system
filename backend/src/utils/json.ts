const fs = require('fs');
const path = require('path');

export interface JsonTranscription {
    language: string;
    text: string;
}

export function saveJsonTranscription(videoId: string, jsonTranscription: JsonTranscription) {
  const destinationPath = process.env.PATH_TO_SAVE_TRANSCRIPTS ?? "./transcriptions";
  
  if (!fs.existsSync(destinationPath)) {
    fs.mkdirSync(destinationPath, { recursive: true });
  }

  const videoFolder = path.join(destinationPath, videoId);

  if (!fs.existsSync(videoFolder)) {
    fs.mkdirSync(videoFolder);
  }

  const transcriptionPath = path.join(videoFolder, "transcription.json");

  const jsonStr = JSON.stringify(jsonTranscription, null, 2);

  fs.writeFileSync(transcriptionPath, jsonStr);
}


export function transcriptionFileExist(videoId: string): boolean {
  const destinationPath = process.env.PATH_TO_SAVE_TRANSCRIPTS ?? "./transcriptions";
  const videoFolder = path.join(destinationPath, videoId);
  const transcriptionPath = path.join(videoFolder, "transcription.json");

  return fs.existsSync(transcriptionPath);
}