import * as React from "react"
import { format, isValid, parse } from "date-fns"
import { es } from "date-fns/locale"
import { ChevronDown } from "lucide-react"

import { cn } from "@/utils/index"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

function parseIsoDate(value?: string): Date | undefined {
  if (!value) return undefined
  const parsed = parse(value.slice(0, 10), "yyyy-MM-dd", new Date())
  return isValid(parsed) ? parsed : undefined
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export interface DatePickerProps {
  id?: string
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  /** Fecha máxima inclusive, formato YYYY-MM-DD. */
  max?: string
  /** Fecha mínima inclusive, formato YYYY-MM-DD. */
  min?: string
  className?: string
  "aria-invalid"?: boolean | "true" | "false"
  "aria-describedby"?: string
}

export const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  function DatePicker(
    {
      id,
      value,
      onChange,
      placeholder = "Seleccionar fecha",
      disabled,
      max,
      min,
      className,
      "aria-invalid": ariaInvalid,
      "aria-describedby": ariaDescribedBy,
    },
    ref
  ) {
    const [open, setOpen] = React.useState(false)
    const selected = parseIsoDate(value)
    const maxDate = parseIsoDate(max)
    const minDate = parseIsoDate(min)

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            aria-invalid={ariaInvalid}
            aria-describedby={ariaDescribedBy}
            className={cn(
              "h-10 w-full justify-between px-3 text-left font-normal bg-background",
              !selected && "text-muted-foreground",
              className
            )}
          >
            <span className="truncate">
              {selected
                ? format(selected, "d MMM yyyy", { locale: es })
                : placeholder}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(day) => {
              onChange(day ? format(day, "yyyy-MM-dd") : "")
              setOpen(false)
            }}
            disabled={(date) => {
              const day = startOfDay(date)
              if (maxDate && day > startOfDay(maxDate)) return true
              if (minDate && day < startOfDay(minDate)) return true
              return false
            }}
            defaultMonth={selected}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    )
  }
)

export interface DateTimePickerProps {
  id?: string
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
}

function splitDateTime(value?: string): { date: string; time: string } {
  if (!value) return { date: "", time: "" }
  const [date, time = ""] = value.split("T")
  return { date: date.slice(0, 10), time: time.slice(0, 5) }
}

export const DateTimePicker = React.forwardRef<
  HTMLDivElement,
  DateTimePickerProps & {
    "aria-invalid"?: boolean | "true" | "false"
    "aria-describedby"?: string
  }
>(function DateTimePicker(
  {
    id,
    value,
    onChange,
    disabled,
    className,
    "aria-invalid": ariaInvalid,
    "aria-describedby": ariaDescribedBy,
  },
  ref
) {
  const { date, time } = splitDateTime(value)

  const emit = (nextDate: string, nextTime: string) => {
    if (!nextDate) {
      onChange("")
      return
    }
    onChange(`${nextDate}T${nextTime || "00:00"}`)
  }

  return (
    <div
      ref={ref}
      aria-invalid={ariaInvalid}
      aria-describedby={ariaDescribedBy}
      className={cn("grid grid-cols-1 gap-2 sm:grid-cols-[1fr_8.5rem]", className)}
    >
      <DatePicker
        id={id}
        value={date}
        onChange={(nextDate) => emit(nextDate, time)}
        disabled={disabled}
        placeholder="Seleccionar fecha"
      />
      <Input
        type="time"
        value={time}
        disabled={disabled}
        aria-label="Hora"
        className="bg-background"
        onChange={(event) => emit(date, event.target.value)}
      />
    </div>
  )
})
