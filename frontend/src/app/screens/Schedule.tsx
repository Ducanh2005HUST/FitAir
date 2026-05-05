import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { apiClient } from '../api/client';
import type { ScheduleDto } from '../api/types';
import { useAuth } from '../auth/AuthContext';

export function Schedule() {
  const { token } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleDto | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [events, setEvents] = useState<ScheduleDto[]>([]);

  const [eventForm, setEventForm] = useState({
    title: '',
    time: '',
    type: 'ランニング',
    note: '',
  });

  const sportTypes = ['ランニング', 'ヨガ', '筋トレ', 'サイクリング', '水泳', 'ウォーキング'];

  useEffect(() => {
    let cancelled = false;
    if (!token) return;
    const month = currentMonth.getMonth() + 1;
    const year = currentMonth.getFullYear();
    apiClient
      .schedules(token, month, year)
      .then((x) => {
        if (!cancelled) setEvents(x);
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : 'Failed to load schedules'))
      .finally(() => {});
    return () => {
      cancelled = true;
    };
  }, [token, currentMonth]);

  const eventsByDate = useMemo(() => {
    const m = new Map<string, ScheduleDto[]>();
    for (const e of events) {
      const dateStr = format(new Date(e.date), 'yyyy-MM-dd');
      const list = m.get(dateStr) ?? [];
      list.push(e);
      m.set(dateStr, list);
    }
    for (const [k, list] of m.entries()) list.sort((a, b) => a.time.localeCompare(b.time));
    return m;
  }, [events]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays: Date[] = [];
  for (let d = calendarStart; d <= calendarEnd; d = addDays(d, 1)) calendarDays.push(d);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 2100 - 1980 + 1 }, (_, i) => 1980 + i);
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

  const openCreate = (date: Date) => {
    setSelectedDate(date);
    setEditingEvent(null);
    setEventForm({ title: '', time: '', type: 'ランニング', note: '' });
    setIsDialogOpen(true);
  };

  const openEdit = (event: ScheduleDto) => {
    setEditingEvent(event);
    setSelectedDate(new Date(event.date));
    setEventForm({
      title: event.title,
      time: event.time,
      type: event.type,
      note: event.note ?? '',
    });
    setIsDialogOpen(true);
  };

  const save = async () => {
    if (!token) return;
    if (!selectedDate || !eventForm.title || !eventForm.time) {
      toast.error('必須項目を入力してください', { description: 'Vui lòng điền đầy đủ thông tin' });
      return;
    }
    setIsSaving(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      if (editingEvent) {
        await apiClient.updateSchedule(token, editingEvent.id, {
          title: eventForm.title,
          time: eventForm.time,
          type: eventForm.type,
          note: eventForm.note || undefined,
          date: dateStr,
        });
        toast.success('予定を更新しました');
      } else {
        await apiClient.createSchedule(token, {
          title: eventForm.title,
          time: eventForm.time,
          type: eventForm.type,
          note: eventForm.note || undefined,
          date: dateStr,
        });
        toast.success('予定を追加しました');
      }
      const month = currentMonth.getMonth() + 1;
      const year = currentMonth.getFullYear();
      const x = await apiClient.schedules(token, month, year);
      setEvents(x);
      setIsDialogOpen(false);
      setEditingEvent(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!token) return;
    try {
      await apiClient.deleteSchedule(token, id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      toast.success('予定を削除しました');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:px-8 md:py-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl mb-2">トレーニングスケジュール</h1>
        <p className="text-sm text-gray-600">Lịch tập luyện</p>
      </div>

      <div className="flex items-center justify-between mb-6 bg-white rounded-[16px] p-4 border border-gray-100 shadow-sm">
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
          className="p-2 hover:bg-gray-100 rounded-[12px] transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>

        <div className="flex items-center gap-2">
          <select
            value={currentMonth.getFullYear()}
            onChange={(e) => setCurrentMonth(setYear(currentMonth, Number(e.target.value)))}
            className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <select
            value={currentMonth.getMonth()}
            onChange={(e) => setCurrentMonth(setMonth(currentMonth, Number(e.target.value)))}
            className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
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

      <div className="bg-white rounded-[16px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
          {['月', '火', '水', '木', '金', '土', '日'].map((d) => (
            <div key={d} className="p-3 text-center text-xs text-gray-600">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {calendarDays.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const list = eventsByDate.get(dateStr) ?? [];
            const isToday = isSameDay(day, new Date());
            const inMonth = isSameMonth(day, monthStart);
            return (
              <div
                key={dateStr}
                className={`min-h-[120px] border-b border-r border-gray-100 p-2 ${inMonth ? 'bg-white' : 'bg-gray-50/60'}`}
              >
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => openCreate(day)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                      isToday ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {format(day, 'd')}
                  </button>
                  <button onClick={() => openCreate(day)} className="p-1 rounded hover:bg-gray-100">
                    <Plus className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
                <div className="mt-2 space-y-1">
                  {list.slice(0, 3).map((e) => (
                    <button
                      key={e.id}
                      onClick={() => openEdit(e)}
                      className="w-full text-left rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-xs hover:bg-gray-100"
                    >
                      <div className="font-medium truncate">{e.time} {e.title}</div>
                    </button>
                  ))}
                  {list.length > 3 ? <div className="text-[10px] text-gray-500">+{list.length - 3} more</div> : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEvent ? '予定を編集' : '予定を追加'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">タイトル</label>
              <Input value={eventForm.title} onChange={(e) => setEventForm((p) => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-700 mb-2">時間</label>
                <Input value={eventForm.time} onChange={(e) => setEventForm((p) => ({ ...p, time: e.target.value }))} placeholder="06:00" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">種類</label>
                <select
                  value={eventForm.type}
                  onChange={(e) => setEventForm((p) => ({ ...p, type: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
                >
                  {sportTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">メモ (optional)</label>
              <textarea
                value={eventForm.note}
                onChange={(e) => setEventForm((p) => ({ ...p, note: e.target.value }))}
                rows={3}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none"
              />
            </div>

            <div className="flex gap-2">
              {editingEvent ? (
                <Button
                  variant="outline"
                  onClick={() => remove(editingEvent.id)}
                  className="flex-1"
                  type="button"
                >
                  削除
                </Button>
              ) : null}
              <Button onClick={() => setIsDialogOpen(false)} variant="outline" className="flex-1" type="button">
                キャンセル
              </Button>
              <Button onClick={save} className="flex-1 bg-blue-600 hover:bg-blue-700" type="button" disabled={isSaving}>
                {isSaving ? '保存中…' : '保存'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

