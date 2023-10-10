import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { api } from "@/lib/axios";
import { IPrompt } from "@/interfaces";
import { Loading } from "./loading";

interface PromptSelectProps {
  onPromptSelected: (prompt: IPrompt) => void
};

export function PromptSelect(props: PromptSelectProps) {
  const [prompts, setPrompts] = useState<IPrompt[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    api.get('/prompts').then(response => {
      setPrompts(response.data);
    }).finally(() => setLoading(false));
  }, []);

  function handlePromptSelected(promptId: string) {
    const selectedPrompt = prompts?.find(prompt => prompt.id === promptId);

    if (!selectedPrompt) return;

    props.onPromptSelected(selectedPrompt);
  }

  if (loading) {
    return <Loading />
  }

  return (
    <Select onValueChange={handlePromptSelected}>
      <SelectTrigger>
        <SelectValue placeholder='Selecione um prompt...' />
      </SelectTrigger>
      <SelectContent>
        {prompts?.map(prompt => {
          return (
            <SelectItem key={prompt.id} value={prompt.id}>
              {prompt.title}
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  );
}