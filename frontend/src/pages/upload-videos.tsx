import { Wand2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { VideoInputForm } from '@/organisms/video-input-form';
import { ScrollArea } from "@/components/ui/scroll-area";
import { PromptSelect } from '@/atoms/prompt-select';
import { useEffect, useState } from 'react';
import { useCompletion } from 'ai/react';
import { IPrompt } from '@/interfaces';
import { api } from '@/lib/axios';

export function UploadVideos() {
  const [temperature, setTemperature] = useState(0.5);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<IPrompt | null>(null);

  const {
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    completion,
    setCompletion,
    isLoading
  } = useCompletion({
    api: 'http://localhost:3333/ai/complete',
    body: {
      videoId,
      temperature
    },
    headers: {
      'Content-Type': 'application/json'
    }
  });;

  async function updateVideoColumn() {
    if (!prompt?.linkedVideoColumn) return;

    try {
      const linkedVideoColumn = prompt?.linkedVideoColumn ?? "";
      const data = { [linkedVideoColumn]: completion };

      await api.patch(`/videos/${videoId}`, data);

      alert('Texto salvo com sucesso');
    } catch (error) {
        alert('Ocorreu um erro ao salvar a coluna do video');
    }
  }

  function handlePromptSelected(prompt: IPrompt) {
    setInput(prompt.template);
    setPrompt(prompt);
  }

  useEffect(() => {
    setCompletion('');
  }, [videoId]);

  return (
    <div className='flex-1 p-6 flex gap-6'>
      <div className='flex flex-col flex-1 gap-4'>
        <div className='grid grid-rows-2 gap-4 flex-1'>
          <Textarea
            value={input}
            onChange={handleInputChange}
            className='resize-none p-4 leading-relaxed'
            placeholder='Inclua o prompt para a IA...'
          />
          <Textarea
            value={completion}
            className='resize-none p-4 leading-relaxed'
            placeholder='Resultado gerado pela IA...'
            readOnly
          />
          {completion && prompt?.linkedVideoColumn !== "" && (
            <div className="flex w-full justify-center -mt-4">
              <span
                className="text-sm cursor-pointer mt-1"
                onClick={updateVideoColumn}
              >Salvar texto no campo vinculado</span>
            </div>
          )}
        </div>

        <p className= 'text-sm text-muted-foreground'>
          Lembre-se: você pode utilizar a variável <code className='text-violet-400'>{'{transcription}'}</code> no seu prompt para adicionar o conteúdo da transcrição do vídeo selecionado.
        </p>
      </div>

      <ScrollArea className='w-80 max-h-[80vh] rounded-md border'>
        <aside className='space-y-6 px-2'>
          <VideoInputForm onVideoUploaded={setVideoId}/>

          <Separator />

          <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='space-y-2'>
              <Label>Prompt</Label>
              <PromptSelect onPromptSelected={handlePromptSelected} />
            </div>

            <div className='space-y-2'>
              <Label>Modelo</Label>
              <Select defaultValue='gpt3.5' disabled>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='gpt3.5'>GPT 3.5-turbo 16k</SelectItem>
                </SelectContent>
              </Select>
              <span className='block text-xs text-muted-foreground italic'>
                Você poderá customizar essa opção em breve
              </span>
            </div>

            <Separator />

            <div className='space-y-4'>
              <Label>Temperatura</Label>
              <Slider 
                min={0}
                max={1}
                step={0.1}
                value={[temperature]}
                onValueChange={value => setTemperature(value[0])}
              />
              <span className='block text-xs text-muted-foreground italic leading-relaxed'>
                Valores mais altos tendem a deixar o resultado mais criativo e com possíveis erros.
              </span>
            </div>

            <Separator />

            <Button disabled={isLoading} type='submit' className='w-full' >
              Executar
              <Wand2 className='w-4 h-4 ml-2'/>
            </Button>
          </form>
        </aside>
      </ScrollArea>
    </div>
  );
}