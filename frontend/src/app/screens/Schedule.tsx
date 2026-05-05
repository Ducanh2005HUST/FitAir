import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Wind, Sun, Cloud, Clock, X } from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  isSameMonth,
  isSameDay,
  setMonth,
  setYear,
} from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';

interface WorkoutEvent {
  id: string;
  title: string;
  time: string;
  date: string;
  type: string;
  notes?: string;
}

export function Schedule() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<WorkoutEvent | null>(null);

  // Event form state
  const [eventForm, setEventForm] = useState({
    title: '',
    time: '',
    type: 'ランニング',
    notes: '',
  });

  // Mock workout schedule with new structure
  const [workoutSchedule, setWorkoutSchedule] = useState<Record<string, WorkoutEvent[]>>({
    '2026-04-01': [
      {
        id: '1',
        title: '朝のランニング',
        time: '06:00',
        date: '2026-04-01',
        type: 'ランニング',
        notes: 'タイ湖周辺'
      },
      {
        id: '2',
        title: 'ヨガ',
        time: '18:00',
        date: '2026-04-01',
        type: 'ヨガ'
      },
    ],
    '2026-04-03': [
      {
        id: '3',
        title: 'ジム',
        time: '17:00',
        date: '2026-04-03',
        type: '筋トレ'
      },
    ],
    '2026-04-05': [
      {
        id: '4',
        title: '室内トレーニング',
        time: '07:00',
        date: '2026-04-05',
        type: '筋トレ',
        notes: '空気質が悪い予報'
      },
    ],
  });

  const sportTypes = [
    'ランニング',
    'ヨガ',
    '筋トレ',
    'サイクリング',
    '水泳',
    'ウォーキング',
  ];

  // Generate year and month options
  const currentYear = new Date().getFullYear();
  const startYear = 1980;
  const endYear = 2100;
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
  const months = [
    { value: 0, label: '1月' },
    { value: 1, label: '2月' },
    { value: 2, label: '3月' },
    { value: 3, label: '4月' },
    { value: 4, label: '5月' },
    { value: 5, label: '6月' },
    { value: 6, label: '7月' },
    { value: 7, label: '8月' },
    { value: 8, label: '9月' },
    { value: 9, label: '10月' },
    { value: 10, label: '11月' },
    { value: 11, label: '12月' },
  ];

  const handleYearChange = (year: number) => {
    const newDate = setYear(currentMonth, year);
    setCurrentMonth(newDate);
  };

  const handleMonthChange = (month: number) => {
    const newDate = setMonth(currentMonth, month);
    setCurrentMonth(newDate);
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      ランニング: 'bg-blue-50 text-blue-700 border-blue-200',
      ヨガ: 'bg-green-50 text-green-700 border-green-200',
      筋トレ: 'bg-orange-50 text-orange-700 border-orange-200',
      サイクリング: 'bg-purple-50 text-purple-700 border-purple-200',
      水泳: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      ウォーキング: 'bg-pink-50 text-pink-700 border-pink-200',
    };
    return colors[type] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  // Generate calendar days
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays: Date[] = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    calendarDays.push(day);
    day = addDays(day, 1);
  }

  const handleOpenDialog = (date: Date) => {
    setSelectedDate(date);
    setEditingEvent(null);
    setEventForm({ title: '', time: '', type: 'ランニング', notes: '' });
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (event: WorkoutEvent) => {
    setEditingEvent(event);
    setSelectedDate(new Date(event.date));
    setEventForm({
      title: event.title,
      time: event.time,
      type: event.type,
      notes: event.notes || '',
    });
    setIsDialogOpen(true);
  };

  const handleAddEvent = () => {
    if (!selectedDate || !eventForm.title || !eventForm.time) {
      toast.error('必須項目を入力してください', {
        description: 'Vui lòng điền đầy đủ thông tin',
      });
      return;
    }

    const dateStr = format(selectedDate, 'yyyy-MM-dd');

    if (editingEvent) {
      // Update existing event
      setWorkoutSchedule((prev) => ({
        ...prev,
        [dateStr]: prev[dateStr]
          .map((event) =>
            event.id === editingEvent.id
              ? {
                  ...event,
                  title: eventForm.title,
                  time: eventForm.time,
                  type: eventForm.type,
                  notes: eventForm.notes,
                }
              : event
          )
          .sort((a, b) => a.time.localeCompare(b.time)),
      }));

      toast.success('予定を更新しました', {
        description: 'Đã cập nhật lịch trình thành công',
      });
    } else {
      // Add new event
      const newEvent: WorkoutEvent = {
        id: Date.now().toString(),
        title: eventForm.title,
        time: eventForm.time,
        date: dateStr,
        type: eventForm.type,
        notes: eventForm.notes,
      };

      setWorkoutSchedule((prev) => ({
        ...prev,
        [dateStr]: [...(prev[dateStr] || []), newEvent].sort((a, b) =>
          a.time.localeCompare(b.time)
        ),
      }));

      toast.success('予定を追加しました', {
        description: 'Đã thêm lịch trình thành công',
      });
    }

    setIsDialogOpen(false);
    setEventForm({ title: '', time: '', type: 'ランニング', notes: '' });
    setEditingEvent(null);
  };

  const handleDeleteEvent = (dateStr: string, eventId: string) => {
    setWorkoutSchedule((prev) => ({
      ...prev,
      [dateStr]: prev[dateStr].filter((event) => event.id !== eventId),
    }));

    toast.success('予定を削除しました', {
      description: 'Đã xóa lịch trình',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:px-8 md:py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl mb-2">トレーニングスケジュール</h1>
        <p className="text-sm text-gray-600">Lịch tập luyện</p>
      </div>

      {/* Month Navigator */}
      <div className="flex items-center justify-between mb-6 bg-white rounded-[16px] p-4 border border-gray-100 shadow-sm">
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
          className="p-2 hover:bg-gray-100 rounded-[12px] transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>

        <div className="flex items-center gap-3">
          {/* Year Selector */}
          <select
            value={currentMonth.getFullYear()}
            onChange={(e) => handleYearChange(Number(e.target.value))}
            className="px-3 py-2 rounded-[12px] border border-gray-200 text-sm font-medium text-gray-900 bg-white hover:bg-gray-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none cursor-pointer"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}年
              </option>
            ))}
          </select>

          {/* Month Selector */}
          <select
            value={currentMonth.getMonth()}
            onChange={(e) => handleMonthChange(Number(e.target.value))}
            className="px-3 py-2 rounded-[12px] border border-gray-200 text-sm font-medium text-gray-900 bg-white hover:bg-gray-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none cursor-pointer"
          >
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 hover:bg-gray-100 rounded-[12px] transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-[16px] border border-gray-100 shadow-sm overflow-hidden mb-6">
        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50">
          {['月', '火', '水', '木', '金', '土', '日'].map((day, i) => (
            <div
              key={day}
              className={`py-3 text-center text-sm font-medium ${
                i === 5 ? 'text-blue-600' : i === 6 ? 'text-red-600' : 'text-gray-700'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const events = workoutSchedule[dateStr] || [];
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const dayOfWeek = day.getDay();

            return (
              <div
                key={index}
                className={`min-h-[100px] md:min-h-[120px] p-2 border-b border-r border-gray-100 ${
                  !isCurrentMonth ? 'bg-gray-50/50' : ''
                } hover:bg-blue-50/30 transition-colors cursor-pointer`}
                onClick={() => handleOpenDialog(day)}
              >
                <div
                  className={`text-sm mb-1 font-medium ${
                    isToday
                      ? 'w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto'
                      : !isCurrentMonth
                        ? 'text-gray-400'
                        : dayOfWeek === 6
                          ? 'text-blue-600'
                          : dayOfWeek === 0
                            ? 'text-red-600'
                            : 'text-gray-900'
                  }`}
                >
                  {format(day, 'd')}
                </div>

                <div className="space-y-1">
                  {events.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className={`text-xs px-1.5 py-1 rounded-md border ${getTypeColor(
                        event.type
                      )} truncate group relative cursor-pointer hover:shadow-md transition-shadow`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditDialog(event);
                      }}
                    >
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        <span className="font-medium truncate">{event.time}</span>
                      </div>
                      <div className="truncate text-[10px] mt-0.5">{event.title}</div>

                      {/* Delete button on hover */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteEvent(dateStr, event.id);
                        }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600 z-10"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {events.length > 3 && (
                    <div className="text-[10px] text-gray-500 text-center">
                      +{events.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Best Times Recommendation */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-[16px] p-6 md:p-8 border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-1">今月のおすすめ運動時間</h2>
        <p className="text-sm text-gray-600 mb-4">Thời gian tập tốt nhất tháng này</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-[12px] p-4 border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <Sun className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">朝 / Buổi sáng</h3>
                <p className="text-sm text-gray-600">6:00 - 8:00</p>
              </div>
            </div>
            <p className="text-sm text-green-700">空気質が最も良い時間帯です</p>
          </div>

          <div className="bg-white rounded-[12px] p-4 border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <Cloud className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">夕方 / Buổi chiều</h3>
                <p className="text-sm text-gray-600">17:00 - 19:00</p>
              </div>
            </div>
            <p className="text-sm text-blue-700">温度が快適な時間帯です</p>
          </div>
        </div>
      </div>

      {/* Add/Edit Event Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              {editingEvent ? '予定を編集 / Chỉnh sửa lịch' : '予定を追加 / Thêm lịch'}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {editingEvent
                ? 'トレーニング予定を編集するためのフォームです'
                : 'トレーニング予定を追加するためのフォームです'}
            </DialogDescription>
            {selectedDate && (
              <p className="text-sm text-gray-500 mt-1">
                {format(selectedDate, 'yyyy年 M月 d日 (E)', { locale: ja })}
              </p>
            )}
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Event Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                タイトル / Tiêu đề *
              </label>
              <Input
                type="text"
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                placeholder="例: 朝のランニング"
                className="rounded-[12px]"
                required
              />
            </div>

            {/* Event Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                種類 / Loại hình *
              </label>
              <select
                value={eventForm.type}
                onChange={(e) => setEventForm({ ...eventForm, type: e.target.value })}
                className="w-full rounded-[12px] border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              >
                {sportTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Event Time */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                時間 / Thời gian *
              </label>
              <Input
                type="time"
                value={eventForm.time}
                onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                className="rounded-[12px]"
                required
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                メモ / Ghi chú
              </label>
              <textarea
                value={eventForm.notes}
                onChange={(e) => setEventForm({ ...eventForm, notes: e.target.value })}
                placeholder="例: タイ湖周辺を走る"
                rows={3}
                className="w-full rounded-[12px] border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-[12px]"
              onClick={() => {
                setIsDialogOpen(false);
                setEditingEvent(null);
              }}
            >
              キャンセル
            </Button>
            <Button
              type="button"
              onClick={handleAddEvent}
              className="flex-1 rounded-[12px] bg-blue-500 hover:bg-blue-600"
            >
              {editingEvent ? (
                <>
                  <Clock className="w-4 h-4" />
                  更新
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  追加
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}