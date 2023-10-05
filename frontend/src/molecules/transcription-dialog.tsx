import { CustomDialog } from "@/atoms/custom-dialog";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import { useEffect, useState } from "react";
import { api } from "@/lib/axios";

interface TranscriptionDialogProps {
    open: boolean
    transcription: string;
    prompt: string;
    videoId: string;
    onOpenChange: (value: boolean) => void
    setPrompt: (value: string) => void
    setTranscription: (value: string) => void
}

type Status = 'waiting' | 'generating';

const statusMessages = {
  waiting: 'Gerar nova transcrição',
  generating: 'Transcrevendo...'
}

export function TranscriptionDialog(props: TranscriptionDialogProps) {
    const [status, setStatus] = useState<Status>('waiting');
    const [newTranscription, setNewTranscription] = useState('');
    const [newPrompt, setNewPrompt] = useState('');

    async function handleTranscription() {
        try {
            setStatus('generating');

            const response = await api.post(`/videos/${props.videoId}/transcription`, {
                prompt: newPrompt,
            });

            const newTranscription = response.data?.transcription ?? "";

            setNewTranscription(newTranscription);
            setStatus('waiting');
        } catch (err) {
            alert("Ocorreu um erro para fazer a transcrição");
            setStatus('waiting');
        }
    }

    async function handleConfirmation() {
        try {
          const data = {
            transcription: newTranscription,
            transcriptionPrompt: newPrompt
          }
  
          await api.patch(`/videos/${props.videoId}`, data);
  
          props.setTranscription(newTranscription);
          props.setPrompt(newPrompt);
          props.onOpenChange(false);
        } catch (error) {
          alert('Ocorreu um erro ao salvar a transcrição');
        }
    }

    useEffect(() => {
        setNewTranscription(props.transcription);
        setNewPrompt(props.prompt);
        setStatus('waiting');
    }, [props.open])

    return (
        <CustomDialog
        title="Transcrição do video"
        description="Aqui está a transcrição do video."
        open={props.open}
        onOpenChange={props.onOpenChange}
        footerContent={
          <div className="grid grid-cols-2 gap-4">
            <Button
              type="button"
              className="bg-slate-300 hover:bg-slate-400"
              onClick={handleTranscription}
              disabled={status !== 'waiting'}
            >
                {status === 'waiting'? statusMessages.waiting : statusMessages.generating}
            </Button>
            <Button type="button" onClick={handleConfirmation}>Confirmar</Button>
          </div>
        }
      >
        <div className='grid grid-rows-4 gap-4 flex-1'>
          <Textarea
            value={newPrompt}
            onChange={event => setNewPrompt(event.currentTarget.value)}
            className='resize-none p-2 leading-relaxed'
            placeholder='Inclua o prompt para a IA...'
          />
          <Textarea
            value={newTranscription}
            onChange={event => setNewTranscription(event.currentTarget.value)}
            className='resize-none p-2 leading-relaxed row-span-3'
            placeholder='Resultado gerado pela IA...'
          />
        </div>
      </CustomDialog>
    );
}