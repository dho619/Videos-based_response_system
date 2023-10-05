import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/axios";
import { IVideo } from "@/interfaces";
import { Loading } from "./loading";

interface VideosComboboxProps {
  onVideoSelected: (video: IVideo | null) => void,
  disabled?: boolean,
  reload?: boolean
};

export function VideoCombobox(props: VideosComboboxProps) {
  const [videos, setVideos] = useState<IVideo[]>([]);
  const [groupedVideos, setGroupedVideos] = useState<Record<string, IVideo[]> | null>(null);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(true);

  function groupVideosByCategory(videos: IVideo[]): Record<string, IVideo[]> {
    const groupedVideos: Record<string, IVideo[]> = {};

    for (const video of videos) {
      if (video.category) {
        const categoryName = video.category.name;

        if (!groupedVideos[categoryName]) {
          groupedVideos[categoryName] = [];
        }

        groupedVideos[categoryName].push(video);
      } else {
        if (!groupedVideos["Sem categoria"]) {
          groupedVideos["Sem categoria"] = [];
        }
        groupedVideos["Sem categoria"].push(video);
      }
    }

    return groupedVideos;
  }

  function handleVideoSelected() {
    var selectedVideo: IVideo | null = null;

    if (value) {
      selectedVideo = videos?.find(video => video?.title?.toLowerCase() === value.toLowerCase()) ?? null;
    }

    props.onVideoSelected(selectedVideo);
  }

  useEffect(() => {
    setLoading(true);

    setValue("");

    api.get('/videos').then(response => {
      setVideos(response.data);
      setGroupedVideos(groupVideosByCategory(response.data));
    }).finally(() => setLoading(false));
  }, [props.reload]);

  useEffect(() => {
    handleVideoSelected();
  }, [value]);

  if (loading){
    return <Loading />
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between whitespace-nowrap overflow-hidden overflow-ellipsis w-72"
          disabled={videos.length === 0 || (props.disabled ?? false)}
          title="Selecione um video..."
        >
          {videos.length === 0 ?
            "Nenhum video encontrado..."
            : value
              ? videos.find((video) => {
                  return video?.title?.toUpperCase() === value.toUpperCase();
                }
              )?.title
            : "Selecione um video..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Procurar videos..." />
          <CommandEmpty>Nenhum video encontrado.</CommandEmpty>
          {Object.entries(groupedVideos!).sort().map(([category, content]) => (
              <CommandGroup key={category} heading={category}>
                {content.map((video) => (
                  <CommandItem
                    key={video.id}
                    value={video.title}
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? "" : currentValue);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === video.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {video.title}
                  </CommandItem>
                ))}
              </CommandGroup>
            )
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}