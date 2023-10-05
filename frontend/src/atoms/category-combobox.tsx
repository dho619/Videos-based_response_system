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
import { ICategory } from "@/interfaces";
import { Loading } from "./loading";

interface CategoriesComboboxProps {
  onCategorySelected: (category: ICategory) => void,
  initialCategorySelected?: ICategory;
  disabled?: boolean
};

export function CategoryCombobox(props: CategoriesComboboxProps) {
  const [categories, setCategories] = useState<ICategory[] | null>(null);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(true);

  function handleCategorySelected() {
    const selectedCategory = categories?.find(category => category.name.toLowerCase() === value.toLowerCase());

    if (!selectedCategory) return;

    props.onCategorySelected(selectedCategory);
  }

  useEffect(() => {
    setLoading(true);

    api.get('/categories').then(response => {
      setCategories(response.data);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    handleCategorySelected();
  }, [value]);

  useEffect(() => {
    setValue(props.initialCategorySelected?.name ?? "");
  }, [props.initialCategorySelected]);

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
          className="w-full justify-between"
          disabled={props.disabled ?? false}
          title="Selecione uma categoria..."
        >
          {value
            ? categories?.find((category) => {
                return category.name.toLowerCase() === value.toLowerCase();
              }
            )?.name
            : "Selecione uma categoria..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Procurar categoria..." />
          <CommandEmpty>Nenhum category encontrado.</CommandEmpty>
          <CommandGroup>
            {categories?.sort().map((category) => (
              <CommandItem
                key={category.id}
                value={category.name}
                onSelect={(currentValue) => {
                  setValue(currentValue === value ? "" : currentValue);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === category.name ? "opacity-100" : "opacity-0"
                  )}
                />
                {category.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}