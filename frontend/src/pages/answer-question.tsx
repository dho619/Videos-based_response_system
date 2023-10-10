import { OptionSelect } from '@/atoms/answer-question-option-select';
import { CategoryCombobox } from '@/atoms/category-combobox';
import { VideoCombobox } from '@/atoms/videos-combobox';
import { Textarea } from '@/components/ui/textarea';
import { ICategory, ISelectionOption, IVideo } from '@/interfaces';
import { Separator } from '@radix-ui/react-separator';
import { useState } from 'react';

export function AnswerQuestion() {
  const [answerQuestionOption, setAnswerQuestionOption] = useState<ISelectionOption | null>(null);
  const [video, setVideo] = useState<IVideo | null>(null);
  const [category, setCategory] = useState<ICategory | null>(null);

  const Options: ISelectionOption[] = [
    { id: '1', description: 'Pergunte na base de dados' },
    { id: '2', description: 'Pergunte por video' },
    { id: '3', description: 'Pergunte por categoria' }
  ];

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

  return (
    <div className='p-6'>
      <div className='h-5 mb-5'>Header</div>

      <Separator className='w-full' color='red'/>

      <div className='flex gap-4 mb-10'>
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

      <div>
        <div className='grid grid-rows-4 gap-4 flex-1'>
          <Textarea
            className='resize-none p-4 leading-relaxed'
            placeholder='Pergunte...'
          />
          <Textarea
            className='resize-none p-4 leading-relaxed row-span-3'
            placeholder='Resultado gerado pela IA...'
            readOnly
          />
        </div>
      </div>
    </div>
  );
}