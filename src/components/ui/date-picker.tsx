import React, { useState } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  value?: string;
  onChange: (date: string | undefined) => void;
  placeholder?: string;
  className?: string;
  allowPartial?: boolean; // Allow partial dates (year only, year-month only)
  disabled?: boolean;
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Pilih tanggal',
  className,
  allowPartial = false,
  disabled = false,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [year, setYear] = useState<number | undefined>();
  const [month, setMonth] = useState<number | undefined>();
  const [day, setDay] = useState<number | undefined>();

  // Parse existing value
  React.useEffect(() => {
    if (value) {
      const parts = value.split('-').map(Number);
      if (parts.length === 3) {
        setYear(parts[0]);
        setMonth(parts[1]);
        setDay(parts[2]);
      } else if (parts.length === 2) {
        setYear(parts[0]);
        setMonth(parts[1]);
        setDay(undefined);
      } else if (parts.length === 1) {
        setYear(parts[0]);
        setMonth(undefined);
        setDay(undefined);
      }
    }
  }, [value]);

  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= 1900; i--) {
      years.push(i);
    }
    return years;
  };

  const generateMonths = () => {
    return [
      { value: 1, label: 'Januari' },
      { value: 2, label: 'Februari' },
      { value: 3, label: 'Maret' },
      { value: 4, label: 'April' },
      { value: 5, label: 'Mei' },
      { value: 6, label: 'Juni' },
      { value: 7, label: 'Juli' },
      { value: 8, label: 'Agustus' },
      { value: 9, label: 'September' },
      { value: 10, label: 'Oktober' },
      { value: 11, label: 'November' },
      { value: 12, label: 'Desember' },
    ];
  };

  const generateDays = () => {
    if (!year || !month) return [];

    const daysInMonth = new Date(year, month, 0).getDate();
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const handleYearChange = (newYear: number) => {
    setYear(newYear);
    updateValue(newYear, month, day);
  };

  const handleMonthChange = (newMonth: number) => {
    setMonth(newMonth);
    updateValue(year, newMonth, day);
  };

  const handleDayChange = (newDay: number) => {
    setDay(newDay);
    updateValue(year, month, newDay);
  };

  const updateValue = (y?: number, m?: number, d?: number) => {
    if (!y) {
      onChange(undefined);
      return;
    }

    if (allowPartial) {
      if (d && m) {
        onChange(`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
      } else if (m) {
        onChange(`${y}-${String(m).padStart(2, '0')}`);
      } else {
        onChange(`${y}`);
      }
    } else {
      if (d && m) {
        onChange(`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
      } else {
        onChange(undefined);
      }
    }
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      const y = date.getFullYear();
      const m = date.getMonth() + 1;
      const d = date.getDate();
      setYear(y);
      setMonth(m);
      setDay(d);
      onChange(`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
    }
    setIsOpen(false);
  };

  const getDisplayText = () => {
    if (!value) return placeholder;

    const parts = value.split('-').map(Number);
    if (parts.length === 3) {
      const date = new Date(parts[0], parts[1] - 1, parts[2]);
      return format(date, 'dd MMMM yyyy', { locale: id });
    } else if (parts.length === 2) {
      const monthLabel = generateMonths().find(m => m.value === parts[1])?.label;
      return `${monthLabel} ${parts[0]}`;
    } else if (parts.length === 1) {
      return `${parts[0]}`;
    }
    return value;
  };

  const getSelectedDate = () => {
    if (value && value.split('-').length === 3) {
      const parts = value.split('-').map(Number);
      return new Date(parts[0], parts[1] - 1, parts[2]);
    }
    return undefined;
  };

  return (
    <div className={cn("space-y-2", className)}>
      {allowPartial ? (
        // Partial date input (year, month, day selects)
        <div className="flex space-x-2">
          <Select
            value={year?.toString()}
            onValueChange={(value) => handleYearChange(Number(value))}
            disabled={disabled}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Tahun" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {generateYears().map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={month?.toString()}
            onValueChange={(value) => handleMonthChange(Number(value))}
            disabled={disabled || !year}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Bulan" />
            </SelectTrigger>
            <SelectContent>
              {generateMonths().map((m) => (
                <SelectItem key={m.value} value={m.value.toString()}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={day?.toString()}
            onValueChange={(value) => handleDayChange(Number(value))}
            disabled={disabled || !year || !month}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Tanggal" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {generateDays().map((d) => (
                <SelectItem key={d} value={d.toString()}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        // Full date input with calendar
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !value && "text-muted-foreground",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              disabled={disabled}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {getDisplayText()}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={getSelectedDate()}
              onSelect={handleCalendarSelect}
              initialFocus
              locale={id}
              disabled={(date) =>
                disabled || date > new Date() || date < new Date('1900-01-01')
              }
            />
          </PopoverContent>
        </Popover>
      )}

      {/* Current value display for partial dates */}
      {allowPartial && value && (
        <div className="text-sm text-muted-foreground">
          Format: {value}
        </div>
      )}
    </div>
  );
}