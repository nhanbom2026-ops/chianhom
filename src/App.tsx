import { useMemo, useState } from 'react';
import {
  AlertCircle,
  Check,
  Copy,
  Maximize2,
  Minimize2,
  Minus,
  Plus,
  RefreshCw,
  RotateCcw,
  Shuffle,
  Trash2,
} from 'lucide-react';
import { GroupCard } from './components/GroupCard';
import {
  FontScale,
  INITIAL_SAMPLE_GROUPS,
  SAMPLE_STUDENT_TEXT,
  SplitMode,
  formatGroupsForClipboard,
  parseStudentList,
  splitIntoGroups,
} from './utils/grouping';

export default function App() {
  const [rawInput, setRawInput] = useState<string>(SAMPLE_STUDENT_TEXT);
  const [mode, setMode] = useState<SplitMode>('by-groups');
  const [countInput, setCountInput] = useState<string>('4');
  const [groups, setGroups] = useState<string[][]>(INITIAL_SAMPLE_GROUPS);
  const [isSampleState, setIsSampleState] = useState<boolean>(true);
  const [shuffleKey, setShuffleKey] = useState<number>(1);
  const [notice, setNotice] = useState<{ type: 'info' | 'error'; text: string } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [fontScale, setFontScale] = useState<FontScale>('large');
  const [isPresentationMode, setIsPresentationMode] = useState<boolean>(false);

  const students = useMemo(() => parseStudentList(rawInput), [rawInput]);

  const parsedCount = useMemo(() => {
    const n = parseInt(countInput, 10);
    return Number.isFinite(n) && n >= 1 ? n : 1;
  }, [countInput]);

  const handleModeChange = (nextMode: SplitMode) => {
    setMode(nextMode);
    setNotice(null);
    if (students.length > 0) {
      if (nextMode === 'by-size' && parsedCount === groups.length && groups.length > 0) {
        const approxSize = Math.max(1, Math.round(students.length / groups.length));
        setCountInput(String(approxSize));
      } else if (nextMode === 'by-groups' && groups.length > 0) {
        setCountInput(String(groups.length));
      }
    }
  };

  const adjustCount = (delta: number) => {
    const next = Math.max(1, parsedCount + delta);
    setCountInput(String(next));
    setNotice(null);
  };

  const runSplit = (reshuffleFromCurrent: boolean) => {
    if (students.length === 0) {
      setNotice({
        type: 'error',
        text: 'Vui lòng nhập hoặc dán ít nhất một tên sinh viên trước khi chia nhóm.',
      });
      return;
    }

    const numericValue = parseInt(countInput, 10);
    if (!Number.isFinite(numericValue) || numericValue < 1) {
      setNotice({
        type: 'error',
        text:
          mode === 'by-groups'
            ? 'Số nhóm phải là số nguyên lớn hơn hoặc bằng 1.'
            : 'Số người mỗi nhóm phải là số nguyên lớn hơn hoặc bằng 1.',
      });
      return;
    }

    const result = splitIntoGroups(
      students,
      mode,
      numericValue,
      reshuffleFromCurrent ? groups : undefined
    );

    setGroups(result.groups);
    setIsSampleState(false);
    setShuffleKey((prev) => prev + 1);
    setCopied(false);

    if (result.notice) {
      setNotice({ type: 'info', text: result.notice });
    } else {
      setNotice(null);
    }
  };

  const handleCopy = async () => {
    if (groups.length === 0) {
      setNotice({
        type: 'error',
        text: 'Chưa có kết quả chia nhóm để sao chép.',
      });
      return;
    }

    const formatted = formatGroupsForClipboard(groups);
    try {
      await navigator.clipboard.writeText(formatted);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      const helper = document.createElement('textarea');
      helper.value = formatted;
      helper.style.position = 'fixed';
      helper.style.opacity = '0';
      document.body.appendChild(helper);
      helper.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(helper);
      if (ok) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      } else {
        setNotice({
          type: 'error',
          text: 'Trình duyệt không cho phép sao chép tự động. Vui lòng thử lại.',
        });
      }
    }
  };

  const handleRestoreSample = () => {
    setRawInput(SAMPLE_STUDENT_TEXT);
    setMode('by-groups');
    setCountInput('4');
    setGroups(INITIAL_SAMPLE_GROUPS);
    setIsSampleState(true);
    setShuffleKey((prev) => prev + 1);
    setNotice(null);
    setCopied(false);
  };

  const handleClearList = () => {
    setRawInput('');
    setNotice(null);
  };

  const totalMembersInResult = useMemo(
    () => groups.reduce((sum, g) => sum + g.length, 0),
    [groups]
  );

  const sizeRangeText = useMemo(() => {
    if (groups.length === 0) return '';
    const sizes = groups.map((g) => g.length);
    const min = Math.min(...sizes);
    const max = Math.max(...sizes);
    return min === max ? `${min} người/nhóm` : `${min}–${max} người/nhóm`;
  }, [groups]);

  const gridColumnsClass = useMemo(() => {
    if (isPresentationMode) {
      if (groups.length <= 2) return 'grid-cols-1 md:grid-cols-2';
      if (groups.length === 4) return 'grid-cols-1 md:grid-cols-2';
      return 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3';
    }
    if (groups.length <= 1) return 'grid-cols-1';
    if (groups.length <= 4) return 'grid-cols-1 md:grid-cols-2';
    return 'grid-cols-1 md:grid-cols-2 2xl:grid-cols-3';
  }, [groups.length, isPresentationMode]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F8FB] text-slate-900">
      {/* Top Bar */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-xs border-b border-slate-200">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="font-display text-lg sm:text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
              Chia Nhóm Ngẫu Nhiên
            </h1>
          </div>

          <div className="hidden md:flex items-center gap-2 text-sm text-slate-600 tabular-nums whitespace-nowrap">
            <span>{groups.length} nhóm</span>
            <span aria-hidden="true">·</span>
            <span>{totalMembersInResult} sinh viên</span>
            {sizeRangeText && (
              <>
                <span aria-hidden="true">·</span>
                <span>{sizeRangeText}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsPresentationMode((prev) => !prev)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[42px] rounded-lg text-sm font-semibold border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-300 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 cursor-pointer"
            >
              {isPresentationMode ? (
                <>
                  <Minimize2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Hiện bảng điều khiển</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Trình chiếu lớp học</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-8">
          {/* Left Control Zone */}
          {!isPresentationMode && (
            <aside className="w-full lg:w-[390px] xl:w-[420px] shrink-0 bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-6">
              {/* Student List Textarea */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="student-list-input"
                    className="font-display text-base font-bold text-slate-900"
                  >
                    Danh sách sinh viên
                  </label>
                  <div className="flex items-center gap-3 text-xs font-medium">
                    <button
                      type="button"
                      onClick={handleRestoreSample}
                      className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-800 hover:underline whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 rounded"
                    >
                      <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Nạp mẫu</span>
                    </button>
                    {rawInput.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearList}
                        className="inline-flex items-center gap-1 text-slate-500 hover:text-rose-700 hover:underline whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Xóa hết</span>
                      </button>
                    )}
                  </div>
                </div>

                <textarea
                  id="student-list-input"
                  value={rawInput}
                  onChange={(e) => {
                    setRawInput(e.target.value);
                    if (notice?.type === 'error') setNotice(null);
                  }}
                  rows={10}
                  placeholder="Dán danh sách tên sinh viên vào đây, mỗi dòng một người&#10;Ví dụ:&#10;Nguyễn Minh Anh&#10;Trần Gia Bảo&#10;Lê Ngọc Diệp"
                  className="w-full rounded-lg border border-slate-300 bg-slate-50/50 px-3.5 py-3 text-base leading-relaxed text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 resize-y min-h-[220px]"
                />

                <div className="flex items-center justify-between text-sm text-slate-600 tabular-nums">
                  <span>Mỗi dòng một sinh viên · Tự động bỏ qua dòng trống</span>
                  <span className="font-semibold text-slate-900 whitespace-nowrap shrink-0">
                    {students.length} người
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-5 space-y-4">
                {/* Split Mode Segmented Control */}
                <div className="space-y-2">
                  <span className="block font-display text-sm font-semibold text-slate-800">
                    Cách thức chia
                  </span>
                  <div
                    role="group"
                    aria-label="Cách thức chia nhóm"
                    className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg"
                  >
                    <button
                      type="button"
                      onClick={() => handleModeChange('by-groups')}
                      className={`px-3 py-2.5 min-h-[42px] text-sm font-semibold rounded-md transition-colors whitespace-nowrap truncate cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
                        mode === 'by-groups'
                          ? 'bg-white text-blue-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Theo số nhóm
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModeChange('by-size')}
                      className={`px-3 py-2.5 min-h-[42px] text-sm font-semibold rounded-md transition-colors whitespace-nowrap truncate cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
                        mode === 'by-size'
                          ? 'bg-white text-blue-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Theo số người / nhóm
                    </button>
                  </div>
                </div>

                {/* Numeric Input */}
                <div className="space-y-2">
                  <label
                    htmlFor="group-number-input"
                    className="block font-display text-sm font-semibold text-slate-800"
                  >
                    {mode === 'by-groups' ? 'Số nhóm cần chia' : 'Số người tối đa mỗi nhóm'}
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => adjustCount(-1)}
                      aria-label="Giảm 1"
                      className="w-11 h-11 shrink-0 inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                    >
                      <Minus className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <input
                      id="group-number-input"
                      type="number"
                      min={1}
                      max={999}
                      inputMode="numeric"
                      value={countInput}
                      onChange={(e) => {
                        setCountInput(e.target.value);
                        if (notice?.type === 'error') setNotice(null);
                      }}
                      className="flex-1 min-w-0 h-11 rounded-lg border border-slate-300 bg-white px-4 text-center font-display text-lg font-bold tabular-nums text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                    />
                    <button
                      type="button"
                      onClick={() => adjustCount(1)}
                      aria-label="Tăng 1"
                      className="w-11 h-11 shrink-0 inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                    >
                      <Plus className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 tabular-nums">
                    {students.length > 0 && parsedCount >= 1
                      ? mode === 'by-groups'
                        ? (() => {
                            const g = Math.min(parsedCount, students.length);
                            const base = Math.floor(students.length / g);
                            const rem = students.length % g;
                            return rem === 0
                              ? `Dự kiến: ${g} nhóm, mỗi nhóm ${base} người.`
                              : `Dự kiến: ${g} nhóm (${rem} nhóm ${base + 1} người, ${g - rem} nhóm ${base} người).`;
                          })()
                        : (() => {
                            const g = Math.max(1, Math.ceil(students.length / parsedCount));
                            const base = Math.floor(students.length / g);
                            const rem = students.length % g;
                            return rem === 0
                              ? `Dự kiến: ${g} nhóm, mỗi nhóm ${base} người.`
                              : `Dự kiến: ${g} nhóm (${rem} nhóm ${base + 1} người, ${g - rem} nhóm ${base} người).`;
                          })()
                      : 'Nhập danh sách để xem dự kiến phân bổ nhóm.'}
                  </p>
                </div>
              </div>

              {/* Validation or Adjustment Notice */}
              {notice && (
                <div
                  role="alert"
                  className={`flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm ${
                    notice.type === 'error'
                      ? 'border-rose-200 bg-rose-50 text-rose-800'
                      : 'border-amber-200 bg-amber-50 text-amber-900'
                  }`}
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{notice.text}</span>
                </div>
              )}

              {/* Primary & Secondary Action Buttons */}
              <div className="space-y-3 pt-1">
                <button
                  type="button"
                  onClick={() => runSplit(false)}
                  className="w-full min-h-[48px] inline-flex items-center justify-center gap-2.5 rounded-lg bg-blue-700 px-5 py-3 text-base font-bold text-white shadow-xs hover:bg-blue-800 active:bg-blue-900 transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                >
                  <Shuffle className="w-5 h-5 shrink-0" aria-hidden="true" />
                  <span>Chia nhóm</span>
                </button>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => runSplit(true)}
                    className="min-h-[44px] inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 active:bg-slate-100 transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                  >
                    <RefreshCw className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>Chia lại</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopy}
                    className={`min-h-[44px] inline-flex items-center justify-center gap-2 rounded-lg border px-3.5 py-2.5 text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
                      copied
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                        : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50 active:bg-slate-100'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span>Đã sao chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span>Sao chép kết quả</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </aside>
          )}

          {/* Right Projection Stage */}
          <section className="flex-1 min-w-0 w-full space-y-5">
            {/* Stage Header Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-xl border border-slate-200 px-5 py-3.5 shadow-xs">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900">
                  {isSampleState ? 'Kết quả mẫu (4 nhóm)' : 'Kết quả chia nhóm'}
                </h2>
                {groups.length > 0 && (
                  <p className="text-sm sm:text-base text-slate-600 tabular-nums">
                    {groups.length} nhóm · {totalMembersInResult} sinh viên · {sizeRangeText}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {isPresentationMode && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => runSplit(true)}
                      className="min-h-[40px] inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                    >
                      <RefreshCw className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>Chia lại</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className={`min-h-[40px] inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
                        copied
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                          : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
                          <span>Đã sao chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 shrink-0" aria-hidden="true" />
                          <span>Sao chép kết quả</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-600 whitespace-nowrap">
                    Cỡ chữ chiếu:
                  </span>
                  <div
                    role="group"
                    aria-label="Chọn cỡ chữ trình chiếu"
                    className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg"
                  >
                    {(
                      [
                        { id: 'normal', label: 'Vừa' },
                        { id: 'large', label: 'Lớn' },
                        { id: 'xlarge', label: 'Rất lớn' },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setFontScale(opt.id)}
                        className={`px-3 py-1.5 min-h-[34px] text-sm font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
                          fontScale === opt.id
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Colored Group Cards Grid */}
            {groups.length > 0 ? (
              <div className={`grid gap-5 sm:gap-6 ${gridColumnsClass}`}>
                {groups.map((members, index) => (
                  <GroupCard
                    key={`${shuffleKey}-${index}`}
                    groupIndex={index}
                    members={members}
                    fontScale={fontScale}
                    shuffleKey={shuffleKey}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-10 text-center space-y-4">
                <p className="font-display text-xl font-bold text-slate-900">
                  Chưa có danh sách nhóm để hiển thị
                </p>
                <p className="text-base text-slate-600 max-w-md mx-auto">
                  Hãy dán danh sách tên sinh viên vào khung bên trái rồi nhấn nút Chia nhóm.
                </p>
                <button
                  type="button"
                  onClick={handleRestoreSample}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" aria-hidden="true" />
                  <span>Nạp 4 nhóm mẫu</span>
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
