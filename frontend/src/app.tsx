import { Github } from 'lucide-react';
import { Button } from "./components/ui/button";
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadVideos } from './pages/upload-videos';
import { AnswerQuestion } from './pages/answer-question';


export function App() {
  return (
    <div className='!min-h-screen flex flex-col'>
      <div className="px-6 py3 flex items-center justify-between border-b">
        <h1 className="text-xl font-bold">Sistema de respostas baseado em vídeos</h1>

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            Desenvolvido por Dho
          </span>

          <Separator orientation='vertical' className='h-6' />

          <a href="https://github.com/dho619/Videos-based_response_system" target="_blank" rel="noopener noreferrer">
            <Button variant="outline">
              <Github className='w-4 h-4 mr-2'/>
              Github
            </Button>
          </a>
        </div>
      </div>

      <Tabs defaultValue="upload">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Carregar videos</TabsTrigger>
          <TabsTrigger value="answer">Responder perguntas</TabsTrigger>
        </TabsList>
        <TabsContent value="upload"><UploadVideos /></TabsContent>
        <TabsContent value="answer"><AnswerQuestion /></TabsContent>
      </Tabs>      
    </div>
  )
}
