import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

export function DatePicker({
  value,
  onChange,
  disabled
}: {
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
}) {
  const [date, setDate] = React.useState<Date | undefined>(
    value ? new Date(value) : undefined
  )

  React.useEffect(() => {
    if (value) {
      const d = new Date(value);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (!isNaN(d.getTime())) setDate(d)
    } else {
      setDate(undefined)
    }
  }, [value])

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    if (selectedDate) {
      const year = selectedDate.getFullYear()
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
      const day = String(selectedDate.getDate()).padStart(2, '0')
      onChange(`${year}-${month}-${day}`)
    } else {
      onChange("")
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal shadow-sm",
            !date && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-brand-600" />
          {date ? format(date, "dd/MM/yyyy") : <span>Sélectionner une date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
        />
      </PopoverContent>
    </Popover>
  )
}

export function DateTimePicker({
  value,
  onChange,
  disabled
}: {
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
}) {
  const [date, setDate] = React.useState<Date | undefined>(
    value ? new Date(value) : undefined
  )
  const [time, setTime] = React.useState<string>(
    value && value.includes('T') ? value.split('T')[1].substring(0, 5) : "12:00"
  )

  React.useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDate(d)
        if (value.includes('T')) {
          setTime(value.split('T')[1].substring(0, 5))
        }
      }
    } else {
      setDate(undefined)
    }
  }, [value])

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    if (selectedDate) {
      updateValue(selectedDate, time)
    } else {
      onChange("")
    }
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value
    setTime(newTime)
    if (date) {
      updateValue(date, newTime)
    }
  }

  const updateValue = (d: Date, t: string) => {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    onChange(`${year}-${month}-${day}T${t}`)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal shadow-sm",
            !date && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-brand-600" />
          {date ? format(date, "dd/MM/yyyy") + ` à ${time}` : <span>Sélectionner date & heure</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
        />
        <div className="p-3 border-t border-border flex items-center gap-3 bg-slate-50/50">
          <Clock className="w-4 h-4 text-brand-600" />
          <Input 
            type="time" 
            value={time} 
            onChange={handleTimeChange}
            className="w-full text-sm font-medium bg-white"
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
