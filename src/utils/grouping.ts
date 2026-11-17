export type SplitMode = 'by-groups' | 'by-size';

export type FontScale = 'normal' | 'large' | 'xlarge';

export interface GroupPalette {
  name: string;
  cardBg: string;
  cardBorder: string;
  headerBg: string;
  headerText: string;
  headerSubtext: string;
  indexText: string;
  rowDivider: string;
}

export const GROUP_PALETTES: GroupPalette[] = [
  {
    name: 'Xanh dương',
    cardBg: 'bg-blue-50/45',
    cardBorder: 'border-blue-200',
    headerBg: 'bg-blue-600',
    headerText: 'text-white',
    headerSubtext: 'text-blue-100',
    indexText: 'text-blue-700',
    rowDivider: 'border-blue-100/80',
  },
  {
    name: 'Xanh ngọc',
    cardBg: 'bg-emerald-50/45',
    cardBorder: 'border-emerald-200',
    headerBg: 'bg-emerald-600',
    headerText: 'text-white',
    headerSubtext: 'text-emerald-100',
    indexText: 'text-emerald-700',
    rowDivider: 'border-emerald-100/80',
  },
  {
    name: 'Hổ phách',
    cardBg: 'bg-amber-50/50',
    cardBorder: 'border-amber-200',
    headerBg: 'bg-amber-600',
    headerText: 'text-white',
    headerSubtext: 'text-amber-100',
    indexText: 'text-amber-800',
    rowDivider: 'border-amber-100/90',
  },
  {
    name: 'Hồng san hô',
    cardBg: 'bg-rose-50/45',
    cardBorder: 'border-rose-200',
    headerBg: 'bg-rose-600',
    headerText: 'text-white',
    headerSubtext: 'text-rose-100',
    indexText: 'text-rose-700',
    rowDivider: 'border-rose-100/80',
  },
  {
    name: 'Tím chàm',
    cardBg: 'bg-violet-50/45',
    cardBorder: 'border-violet-200',
    headerBg: 'bg-violet-600',
    headerText: 'text-white',
    headerSubtext: 'text-violet-100',
    indexText: 'text-violet-700',
    rowDivider: 'border-violet-100/80',
  },
  {
    name: 'Xanh lơ',
    cardBg: 'bg-cyan-50/45',
    cardBorder: 'border-cyan-200',
    headerBg: 'bg-cyan-700',
    headerText: 'text-white',
    headerSubtext: 'text-cyan-100',
    indexText: 'text-cyan-800',
    rowDivider: 'border-cyan-100/80',
  },
  {
    name: 'Cam đất',
    cardBg: 'bg-orange-50/45',
    cardBorder: 'border-orange-200',
    headerBg: 'bg-orange-600',
    headerText: 'text-white',
    headerSubtext: 'text-orange-100',
    indexText: 'text-orange-700',
    rowDivider: 'border-orange-100/80',
  },
  {
    name: 'Mận tím',
    cardBg: 'bg-fuchsia-50/45',
    cardBorder: 'border-fuchsia-200',
    headerBg: 'bg-fuchsia-700',
    headerText: 'text-white',
    headerSubtext: 'text-fuchsia-100',
    indexText: 'text-fuchsia-800',
    rowDivider: 'border-fuchsia-100/80',
  },
];

export const SAMPLE_STUDENT_TEXT = [
  'Nguyễn Minh Anh',
  'Trần Gia Bảo',
  'Lê Ngọc Diệp',
  'Phạm Hoàng Dũng',
  'Hoàng Thảo Vy',
  'Vũ Quang Huy',
  'Đặng Khánh Linh',
  'Bùi Đức Mạnh',
  'Đỗ Phương Nhi',
  'Ngô Quốc Khánh',
  'Dương Thanh Tâm',
  'Lý Tuấn Kiệt',
  'Phan Bảo Ngọc',
  'Võ Thành Đạt',
  'Trịnh Hải Yến',
  'Hồ Anh Khoa',
].join('\n');

export const INITIAL_SAMPLE_GROUPS: string[][] = [
  ['Nguyễn Minh Anh', 'Vũ Quang Huy', 'Dương Thanh Tâm', 'Trịnh Hải Yến'],
  ['Trần Gia Bảo', 'Đặng Khánh Linh', 'Lý Tuấn Kiệt', 'Hồ Anh Khoa'],
  ['Lê Ngọc Diệp', 'Bùi Đức Mạnh', 'Phan Bảo Ngọc', 'Hoàng Thảo Vy'],
  ['Phạm Hoàng Dũng', 'Đỗ Phương Nhi', 'Ngô Quốc Khánh', 'Võ Thành Đạt'],
];

export function parseStudentList(rawText: string): string[] {
  return rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

export function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function serializeGroups(groups: string[][]): string {
  return groups.map((group) => group.join('|')).join('||');
}

export interface SplitResult {
  groups: string[][];
  notice?: string;
}

export function splitIntoGroups(
  students: string[],
  mode: SplitMode,
  rawValue: number,
  previousGroups?: string[][]
): SplitResult {
  if (students.length === 0) {
    return { groups: [] };
  }

  const safeValue = Number.isFinite(rawValue) ? Math.max(1, Math.floor(rawValue)) : 1;
  let groupCount = 1;
  let notice: string | undefined;

  if (mode === 'by-groups') {
    if (safeValue > students.length) {
      groupCount = students.length;
      notice = `Đã điều chỉnh thành ${students.length} nhóm để không có nhóm trống (hiện có ${students.length} sinh viên).`;
    } else {
      groupCount = safeValue;
    }
  } else {
    groupCount = Math.max(1, Math.ceil(students.length / safeValue));
  }

  const distribute = (ordered: string[]): string[][] => {
    const baseSize = Math.floor(ordered.length / groupCount);
    const remainder = ordered.length % groupCount;
    const result: string[][] = [];
    let offset = 0;

    for (let i = 0; i < groupCount; i++) {
      const size = baseSize + (i < remainder ? 1 : 0);
      result.push(ordered.slice(offset, offset + size));
      offset += size;
    }

    return result;
  };

  let bestGroups = distribute(shuffleArray(students));

  if (previousGroups && previousGroups.length > 0 && students.length > 1) {
    const prevKey = serializeGroups(previousGroups);
    let attempts = 0;
    while (serializeGroups(bestGroups) === prevKey && attempts < 10) {
      bestGroups = distribute(shuffleArray(students));
      attempts++;
    }
  }

  return { groups: bestGroups, notice };
}

export function formatGroupsForClipboard(groups: string[][]): string {
  return groups
    .map((members, index) => {
      const header = `Nhóm ${index + 1} (${members.length} sinh viên):`;
      const lines = members.map((name, idx) => `${idx + 1}. ${name}`);
      return [header, ...lines].join('\n');
    })
    .join('\n\n');
}
