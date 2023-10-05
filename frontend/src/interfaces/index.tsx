export interface ICategory {
    id: string
    name: string
  };
  
export interface IVideo {
id: string
fileName?: string
title?: string
description: string
path?: string
transcriptionPrompt: string
transcription?: string
categoryId?: string
createdAt: string
updatedAt: string
category?: ICategory
};

export interface IPrompt {
    id: string
    title: string
    template: string
    linkedVideoColumn?: string
    createdAt: string
};