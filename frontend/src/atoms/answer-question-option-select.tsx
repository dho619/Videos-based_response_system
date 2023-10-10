import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { ISelectionOption } from "@/interfaces";

interface OptionSelectProps {
  onOptionSelected: (option: ISelectionOption) => void
  Options: ISelectionOption[]
};

export function OptionSelect(props: OptionSelectProps) {
  function handleOptionSelected(optionId: string) {
    const selectedOption = props.Options?.find(option => option.id === optionId);

    if (!selectedOption) return;

    props.onOptionSelected(selectedOption);
  }

  return (
    <Select onValueChange={handleOptionSelected} defaultValue={props.Options[0]?.id ?? ""}>
      <SelectTrigger>
        <SelectValue placeholder='Selecione um option...' />
      </SelectTrigger>
      <SelectContent>
        {props.Options?.map(option => {
          return (
            <SelectItem key={option.id} value={option.id}>
              {option.description}
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  );
}