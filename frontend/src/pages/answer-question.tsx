import { OptionSelect } from '@/atoms/answer-question-option-select';
import { CategoryCombobox } from '@/atoms/category-combobox';
import { VideoCombobox } from '@/atoms/videos-combobox';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { ICategory, ISelectionOption, IVideo } from '@/interfaces';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ChangeEvent, useEffect, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { api } from '@/lib/axios';
import { useCompletion } from 'ai/react';
import { Wand2 } from 'lucide-react';

export function AnswerQuestion() {
  const [answerQuestionOption, setAnswerQuestionOption] = useState<ISelectionOption | null>(null);
  const [video, setVideo] = useState<IVideo | null>(null);
  const [category, setCategory] = useState<ICategory | null>(null);
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [deleteRepeated, setDeleteRepeated] = useState<string>("checked");

  const {
    input,
    handleInputChange,
    handleSubmit,
    completion,
    isLoading
  } = useCompletion({
    api: 'http://localhost:3333/ai/answer',
    body: {
      videoId: video?.id,
    },
    headers: {
      'Content-Type': 'application/json'
    }
  });;

  const Options: ISelectionOption[] = [
    { id: '1', description: 'Pergunte na base de dados' },
    { id: '2', description: 'Pergunte por video' },
    { id: '3', description: 'Pergunte por categoria' }
  ];

  function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const { files } = event.currentTarget;

    if (!files) {
      return
    }

    const selectFile = files[0];

    setJsonFile(selectFile);
  }

  async function handleLoadingJson() {
    try {
      if (!jsonFile) return;
      const data = {
        deleteRepeated: deleteRepeated === 'checked'
      }

      const formData = new FormData();

      formData.append('file', jsonFile);
      formData.append('data', JSON.stringify(data));

      await api.post(`/json/upload`, formData);

      setJsonFile(null);

      alert('Arquivo carregado com sucesso');
    } catch (error : any) {
      alert('Ocorreu um erro ao carregar o arquivo! Verifique se arquivo é um json válido e contém uma propriedade "text"');
    }
  }

  const renderAccordingToTheAnswerQuestionOption = () => {
    switch (answerQuestionOption?.id) {
      case Options[0].id:
        return <></>;
      case Options[1].id:
        return <VideoCombobox
          onVideoSelected={setVideo}
          disabled={answerQuestionOption?.id !== Options[1].id}
        />
      case Options[2].id:
        return <CategoryCombobox
          onCategorySelected={setCategory}
          disabled={answerQuestionOption?.id !== Options[2].id}
          initialCategorySelected={video?.category}
        />
      default:
        return <></>;
    }
  };

  useEffect(() => {
    setVideo(null);
    setCategory(null);
  }, [answerQuestionOption])

  return (
    <div className='px-6'>
      <div className='flex justify-between'>
        <h1 className='text-xl'>Faça uma pergunta e veja a mágica acontecer</h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">Carregar arquivos</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Carregar novo arquivo</SheetTitle>
              <SheetDescription>
                Adicione novos arquivos para a base de dados utilizadas na geração de respostas
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <input type='file' id='loading-file' accept='.json' className='cursor-pointer' onChange={handleFileSelected}/>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="ignore-repeated"
                  defaultChecked
                  value={deleteRepeated}
                  onCheckedChange={(checked) => setDeleteRepeated(checked ? 'checked' : 'unchecked')}
                />
                <label
                  htmlFor="ignore-repeated"
                  className="text-sm font-medium leading-none peer-disabled:opacity-70 cursor-pointer"
                >
                  Apagar dados de arquivo com mesmo nome, caso existir
                </label>
              </div>
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <Button type="button" onClick={handleLoadingJson}>Carregar arquivo</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      <Separator className='mt-2 mb-6' color='red' />

      <div className='flex gap-4'>
        <div className='w-1/3'>
          <OptionSelect
            onOptionSelected={setAnswerQuestionOption}
            Options={Options}
          />
        </div>
        <div className='w-1/3'>
          {renderAccordingToTheAnswerQuestionOption()}
        </div>
      </div>

      <Separator className='my-6' />

      <form onSubmit={handleSubmit} className='space-y-3'>
        <div className='grid grid-rows-4 gap-4 flex-1'>
          <Textarea
            value={input}
            onChange={handleInputChange}
            className='resize-none p-4 leading-relaxed'
            placeholder='Pergunte...'
          />
          <Textarea
            value={completion}
            className='resize-none p-4 leading-relaxed row-span-3'
            placeholder='Resultado gerado pela IA...'
            readOnly
          />
        </div>
        <div className='w-full flex justify-center'>
          <Button disabled={isLoading} type='submit' className='w-60' >
            Executar
            <Wand2 className='w-4 h-4 ml-2'/>
          </Button>
        </div>
      </form>
    </div>
  );
}