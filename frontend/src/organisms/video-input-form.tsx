import { FileVideo, Upload } from "lucide-react";
import { Separator } from "../components/ui/separator";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { getFFmpeg } from "@/lib/ffmpeg";
import { fetchFile } from '@ffmpeg/util';
import { api } from "@/lib/axios";
import { CategoryCombobox } from "@/atoms/category-combobox";
import { Input } from "../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoCombobox } from "@/atoms/videos-combobox";
import { ICategory, IVideo } from "@/interfaces";
import { Progress } from "../components/ui/progress";
import { TranscriptionDialog } from "@/molecules/transcription-dialog";
import { AxiosError } from "axios";

type Status = 'waiting' | 'preparing' | 'converting' | 'uploading' | 'generating' | 'success';

const tabs = [
  'upload-new-videos',
  'videos-already-uploaded'
];

const statusMessages = {
  preparing: 'Preparando...',
  converting: 'Convertendo...',
  generating: 'Transcrevendo...',
  uploading: 'Carregando...',
  success: 'Sucesso!'
}

interface VideoInputFormProps {
  onVideoUploaded: (id: string) => void
}

export function VideoInputForm(props: VideoInputFormProps) {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [video, setVideo] = useState<IVideo | null>(null);
  const [category, setCategory] = useState<ICategory | null>(null);
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [status, setStatus] = useState<Status>('success');
  const [prompt, setPrompt] = useState('');
  const [title, setTitle] = useState('');
  const [transcription, setTranscription] = useState('');
  const [videoId, setVideoId] = useState('');
  const [openTranscriptionDialog, setOpenTranscriptionDialog] = useState(false);
  const [progress, setProgress] = useState(0);
  const [reloadComboboxVideo, setReloadComboboxVideo] = useState(false);

  function clearStates() {
    setVideoFile(null);
    setVideo(null);
    setCategory(null);
    setStatus('waiting');
    setPrompt('');
    setTitle('');
    setTranscription('');
    setVideoId('');
    setProgress(0);
    setReloadComboboxVideo(!reloadComboboxVideo);
    props.onVideoUploaded("");
  }

  function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const { files } = event.currentTarget;

    if (!files) {
      return
    }

    const selectFile = files[0];

    setTitle((selectFile.name ?? "").split('.')[0] ?? "");
    setVideoFile(selectFile);
  }

  async function convertVideoToAudio(video: File) {
    const ffmpeg = await getFFmpeg();

    await ffmpeg.writeFile("input.mp4", await fetchFile(video));

    // ffmpeg.on('log', log => {
    //   console.log(log);
    // });

    ffmpeg.on('progress', progress => {
      setProgress(progress.progress * 100);
    });

    await ffmpeg.exec([
      "-i",
      "input.mp4",
      "-map",
      "0:a",
      "-b:a",
      "20k",
      "-acodec",
      "libmp3lame",
      "output.mp3"
    ]);

    const data = await ffmpeg.readFile('output.mp3');

    const audioFileBlob = new Blob([data], { type: 'audio/mpeg' });
    const audioFile = new File([audioFileBlob], "audio.mp3", {
      type: 'audio/mpeg',
    });

    return audioFile;
  }

  async function transcriptionVideo(videoId: string) {
    const response = await api.post(`/videos/${videoId}/transcription`, {
      prompt,
    });

    const newTranscription = response.data?.transcription ?? "";

    setTranscription(newTranscription);

    return newTranscription;
  }

  async function handleLoadingVideo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (title?.trim() === '') {
      alert('O nome do vídeo é obrigatório');
      return;
    }

    const videoInformation = {
      title,
      categoryId: category?.id,
      transcriptionPrompt: prompt
    };

    var videoId = '';

    try {
      if (activeTab === 'videos-already-uploaded') {
        videoId = video?.id ?? '';
        await api.patch(`/videos/${videoId}`, videoInformation);

        setStatus('success');
      
        props.onVideoUploaded(videoId);

        return;
      }

      if (!videoFile) return;

      setStatus('preparing');

      const response = await api.post('/videos', videoInformation);

      videoId = response.data.video.id;

      setStatus('converting');

      const audioFile = await convertVideoToAudio(videoFile);

      const data = new FormData();

      data.append('file', audioFile);

      setStatus('uploading');

      await api.post(`/videos/${videoId}/upload`, data);

      setVideoId(videoId);

      setStatus('generating');

      await transcriptionVideo(videoId);

      setStatus('success');
      
      props.onVideoUploaded(videoId);

      setOpenTranscriptionDialog(true);
    } catch (error : any) {
      setStatus('waiting');

      if (error.isAxiosError) {
        if (error.response.status = 409){
          alert('Já existe um vídeo com esse nome');
          return;
        }
      }

      alert('Ocorreu um erro ao carregar o vídeo');
    }
  }

  async function handleTabChange(value: string){
    setActiveTab(value);
    clearStates();
  }

  const previewURL = useMemo(() => {
    if (!videoFile) {
      return null;
    }

    return URL.createObjectURL(videoFile);
  }, [videoFile]);

  useEffect(() => {
    if (!video) {
      clearStates();
      return;
    }

    props.onVideoUploaded(video.id);
    setVideoId(video.id);
    setTitle(video?.title ?? "");
    setCategory(video?.category ?? null);
    setPrompt(video.transcriptionPrompt);
    setTranscription(video.transcription ?? "");
  }, [video]);

  const isDisabled = status !== 'waiting' || (videoFile === null && video === null);

  return (
    <div>
      <form onSubmit={handleLoadingVideo} className='space-y-6'>
        <Tabs defaultValue={tabs[0]} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value={tabs[0]}>Carregar videos</TabsTrigger>
            <TabsTrigger value={tabs[1]}>Videos carregados</TabsTrigger>
          </TabsList>
          <TabsContent value={tabs[0]}>
            <label
              htmlFor='video'
              className='relative border flex rounded-md aspect-video cursor-pointer border-dashed text-sm flex-col gap-2 items-center justify-center text-muted-foreground hover:bg-primary/5'
              title="Selecione um vídeo"
            >
              {previewURL ? (
                <video src={previewURL} controls={false} className="pointer-events-none absolute inset-0 w-full h-full" />
              ) : (
                <>
                  <FileVideo className='w-4 h-4' />
                  Selecione um vídeo
                </>
              )}
            </label>

            <input type='file' id='video' accept='video/mp4' className='sr-only' onChange={handleFileSelected} />
          </TabsContent>
          <TabsContent value={tabs[1]}>
            <div>
              <VideoCombobox
                onVideoSelected={setVideo}
                disabled={status !== 'waiting'}
                reload={reloadComboboxVideo}
              />
            </div>
            {video && (
              <div className="flex w-full justify-center !mt-0">
                <span
                  className="text-sm cursor-pointer mt-1"
                  onClick={() => setOpenTranscriptionDialog(true)}
                >Visualizar transcrição</span>
              </div>
            )}
          </TabsContent>
        </Tabs>
        <Separator />

        <Input
          disabled={isDisabled}
          value={title}
          type="text"
          placeholder="Nome do Video"
          title="Nome do Video"
          max={100}
          onChange={event => setTitle(event.currentTarget.value)}
        />

        <CategoryCombobox
          onCategorySelected={setCategory}
          disabled={isDisabled}
          initialCategorySelected={video?.category}
        />

        <div className='space-y-2'>
          <Label htmlFor='transcription_prompt'>Prompt de transcrição</Label>
          <Textarea
            value={prompt}
            onChange={event => setPrompt(event.currentTarget.value)}
            disabled={isDisabled}
            id='transcription_prompt'
            className='h-20 leading-relaxed resize-none'
            placeholder='Inclua palavras-chave mencionadas no vídeo separadas por vírgula (,)'
            title='Inclua palavras-chave mencionadas no vídeo separadas por vírgula (,)'
          />
        </div>

        <Button
          data-success={status === 'success'}
          disabled={isDisabled}
          type='submit'
          className='w-full data-[success=true]:bg-emerald-400'
        >
          {status === 'waiting' ? (
            <>
              {activeTab === 'upload-new-videos' ? 'Carregar vídeo' : 'Atualizar vídeo'}
              <Upload className='w-4 h-4 ml-2' />
            </>
          ) : statusMessages[status]}
        </Button>
        {progress > 0 && progress < 100 && <Progress value={progress} className="w-full" />}
        {status === 'success' && (
          <div className="flex w-full justify-center !mt-0">
            <span
              className="text-sm cursor-pointer mt-1"
              onClick={clearStates}
            >Carregar novo video</span>
          </div>
        )}
      </form>

      <TranscriptionDialog
        open={openTranscriptionDialog}
        transcription={transcription}
        prompt={prompt}
        videoId={videoId}
        onOpenChange={setOpenTranscriptionDialog}
        setTranscription={setTranscription}
        setPrompt={setPrompt}
      />
    </div>
  )
}