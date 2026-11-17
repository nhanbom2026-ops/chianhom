import { motion } from 'motion/react';
import { FontScale, GROUP_PALETTES } from '../utils/grouping';

interface GroupCardProps {
  groupIndex: number;
  members: string[];
  fontScale: FontScale;
  shuffleKey: number;
}

const FONT_SCALE_STYLES: Record<
  FontScale,
  {
    title: string;
    count: string;
    member: string;
    index: string;
    rowGap: string;
    headerPadding: string;
    bodyPadding: string;
  }
> = {
  normal: {
    title: 'text-lg sm:text-xl',
    count: 'text-sm',
    member: 'text-base sm:text-lg',
    index: 'text-sm sm:text-base w-6',
    rowGap: 'py-2',
    headerPadding: 'px-5 py-3.5',
    bodyPadding: 'px-5 py-3',
  },
  large: {
    title: 'text-xl sm:text-2xl',
    count: 'text-base',
    member: 'text-xl sm:text-[22px]',
    index: 'text-base sm:text-lg w-7',
    rowGap: 'py-2.5',
    headerPadding: 'px-6 py-4',
    bodyPadding: 'px-6 py-3.5',
  },
  xlarge: {
    title: 'text-2xl sm:text-[28px]',
    count: 'text-lg',
    member: 'text-2xl sm:text-[28px]',
    index: 'text-lg sm:text-xl w-9',
    rowGap: 'py-3',
    headerPadding: 'px-6 py-4.5',
    bodyPadding: 'px-6 py-4',
  },
};

export function GroupCard({
  groupIndex,
  members,
  fontScale,
  shuffleKey,
}: GroupCardProps) {
  const palette = GROUP_PALETTES[groupIndex % GROUP_PALETTES.length];
  const scale = FONT_SCALE_STYLES[fontScale];

  return (
    <motion.article
      key={`${shuffleKey}-${groupIndex}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.18,
        delay: Math.min(groupIndex * 0.03, 0.18),
        ease: [0.16, 1, 0.3, 1],
      }}
      className={`flex flex-col overflow-hidden rounded-xl border ${palette.cardBorder} ${palette.cardBg} shadow-xs`}
    >
      <header
        className={`flex items-center justify-between gap-4 ${palette.headerBg} ${scale.headerPadding}`}
      >
        <h3
          className={`font-display font-bold tracking-tight ${palette.headerText} ${scale.title} whitespace-nowrap`}
        >
          Nhóm {groupIndex + 1}
        </h3>
        <span
          className={`font-medium tabular-nums ${palette.headerSubtext} ${scale.count} whitespace-nowrap shrink-0`}
        >
          {members.length} thành viên
        </span>
      </header>

      <ol className={`flex-1 bg-white/85 ${scale.bodyPadding}`}>
        {members.map((student, idx) => (
          <li
            key={`${idx}-${student}`}
            className={`flex items-baseline gap-3 ${scale.rowGap} ${
              idx < members.length - 1 ? `border-b ${palette.rowDivider}` : ''
            }`}
          >
            <span
              className={`shrink-0 font-semibold tabular-nums ${palette.indexText} ${scale.index}`}
            >
              {idx + 1}.
            </span>
            <span
              className={`font-semibold leading-snug text-slate-900 ${scale.member} break-words min-w-0`}
            >
              {student}
            </span>
          </li>
        ))}
      </ol>
    </motion.article>
  );
}
