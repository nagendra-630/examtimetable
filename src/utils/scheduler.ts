import {
  Chapter,
  Difficulty,
  Exam,
  Priority,
  RevisionTask,
  RevisionType,
  ScheduleGeneratorOptions,
  Subject,
} from '../types';

/**
 * Format Date to YYYY-MM-DD
 */
export function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse YYYY-MM-DD into a localized Date object at midnight
 */
export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

/**
 * Add days to a date string and return YYYY-MM-DD
 */
export function addDays(dateStr: string, days: number): string {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

/**
 * Difference in days (d2 - d1)
 */
export function getDaysDiff(d1Str: string, d2Str: string): number {
  const d1 = parseDate(d1Str);
  const d2 = parseDate(d2Str);
  const diffMs = d2.getTime() - d1.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Convert time string HH:mm to minutes from midnight
 */
export function timeToMinutes(timeStr: string): number {
  const [hh, mm] = timeStr.split(':').map(Number);
  return hh * 60 + mm;
}

/**
 * Convert minutes from midnight to HH:mm
 */
export function minutesToTime(minutes: number): string {
  const hh = Math.floor(minutes / 60) % 24;
  const mm = Math.floor(minutes % 60);
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

/**
 * Calculate weight multiplier based on difficulty, importance and understanding
 */
function calculateChapterWeight(chapter: Chapter, boostWeakChapters: boolean): number {
  let diffMult = 1.0;
  if (chapter.difficulty === 'Medium') diffMult = 1.25;
  if (chapter.difficulty === 'Hard') diffMult = 1.6;

  let impMult = 1.0;
  if (chapter.importance === 'Medium') impMult = 1.2;
  if (chapter.importance === 'High') impMult = 1.5;

  // Understanding level is 1 to 5
  // If understanding is 1 (poor), weight is high. If 5 (expert), weight is lower.
  let underMult = 1.0;
  if (chapter.understandingLevel <= 2) {
    underMult = boostWeakChapters ? 1.5 : 1.3;
  } else if (chapter.understandingLevel === 3) {
    underMult = 1.1;
  } else if (chapter.understandingLevel >= 4) {
    underMult = 0.85;
  }

  if (chapter.preparationStatus === 'Needs Revision') {
    underMult *= 1.3;
  }

  return diffMult * impMult * underMult;
}

interface ChapterScheduleItem {
  chapter: Chapter;
  subject: Subject;
  exam: Exam;
  weight: number;
  daysUntilExam: number;
}

/**
 * Smart Spaced Repetition Scheduling Algorithm
 */
export function generateSmartSchedule(
  exams: Exam[],
  subjects: Subject[],
  chapters: Chapter[],
  existingTasks: RevisionTask[],
  options: ScheduleGeneratorOptions
): { newTasks: RevisionTask[]; preservedTasks: RevisionTask[]; totalGenerated: number } {
  const todayStr = formatDate(new Date());
  const effectiveStartDateStr = options.startDate >= todayStr ? options.startDate : todayStr;

  // 1. Separate preserved tasks if requested
  const preservedTasks: RevisionTask[] = options.preserveCompletedSessions
    ? existingTasks.filter((t) => t.isCompleted)
    : [];

  const subjectMap = new Map<string, Subject>(subjects.map((s) => [s.id, s]));
  const examMap = new Map<string, Exam>(exams.map((e) => [e.id, e]));

  // Find upcoming valid exams that occur on or after start date
  const upcomingExams = exams
    .filter((e) => e.examDate >= effectiveStartDateStr)
    .sort((a, b) => a.examDate.localeCompare(b.examDate));

  if (upcomingExams.length === 0 || chapters.length === 0) {
    return { newTasks: preservedTasks, preservedTasks, totalGenerated: 0 };
  }

  // Pre-index existing daily occupied minutes by preserved tasks to prevent overlaps
  const dailyOccupiedMinutes = new Map<string, number>();
  const dailyTimeSlots = new Map<string, { start: number; end: number }[]>();

  preservedTasks.forEach((pt) => {
    const dur = pt.durationMinutes || options.sessionDurationMinutes;
    dailyOccupiedMinutes.set(pt.scheduledDate, (dailyOccupiedMinutes.get(pt.scheduledDate) || 0) + dur);

    const sMin = timeToMinutes(pt.startTime);
    const eMin = timeToMinutes(pt.endTime);
    const slots = dailyTimeSlots.get(pt.scheduledDate) || [];
    slots.push({ start: sMin, end: eMin });
    dailyTimeSlots.set(pt.scheduledDate, slots);
  });

  // Calculate earliest and latest dates
  const maxExamDate = upcomingExams.reduce((max, e) => (e.examDate > max ? e.examDate : max), upcomingExams[0].examDate);

  // Group chapters by exam
  const itemsToSchedule: ChapterScheduleItem[] = [];

  for (const chapter of chapters) {
    const subject = subjectMap.get(chapter.subjectId);
    if (!subject) continue;

    // Find the exam for this subject
    const relatedExam = upcomingExams.find((e) => e.subjectId === subject.id);
    if (!relatedExam) continue;

    const daysUntilExam = getDaysDiff(effectiveStartDateStr, relatedExam.examDate);
    if (daysUntilExam <= 0) continue; // Exam has passed or is today

    const weight = calculateChapterWeight(chapter, options.boostWeakChapters);

    itemsToSchedule.push({
      chapter,
      subject,
      exam: relatedExam,
      weight,
      daysUntilExam,
    });
  }

  // Sort items: Priority goes to closer exam date first, then higher weight
  itemsToSchedule.sort((a, b) => {
    if (a.daysUntilExam !== b.daysUntilExam) {
      return a.daysUntilExam - b.daysUntilExam;
    }
    return b.weight - a.weight;
  });

  const generatedTasks: RevisionTask[] = [];
  const maxDailyMinutes = options.dailyAvailableHours * 60;
  const sessionMinutes = options.sessionDurationMinutes;
  const breakMinutes = options.breakDurationMinutes;
  const baseStartMinutes = timeToMinutes(options.preferredDailyStartTime || '09:00');

  // Spaced intervals:
  // For standard learning: Day 0 (Initial or quick study), +2 days (Review 1), +5 days (Review 2), +10 days (Review 3)
  // Or spaced intervals: 1, 3, 7, 14
  const standardIntervals = [0, 2, 6, 13];

  for (const item of itemsToSchedule) {
    const { chapter, subject, exam } = item;
    const examDate = exam.examDate;
    const totalDaysAvailable = getDaysDiff(effectiveStartDateStr, examDate);

    if (totalDaysAvailable < 1) continue;

    // Number of sessions based on chapter status and weight
    let sessionsCount = 2; // baseline
    if (chapter.preparationStatus === 'Not Started') {
      sessionsCount = item.weight > 1.8 ? 4 : 3;
    } else if (chapter.preparationStatus === 'In Progress') {
      sessionsCount = item.weight > 1.5 ? 3 : 2;
    } else if (chapter.preparationStatus === 'Needs Revision') {
      sessionsCount = 3;
    } else if (chapter.preparationStatus === 'Completed') {
      // Completed chapters only need spaced maintenance review
      sessionsCount = 2;
    }

    // Never exceed the days available minus pre-exam reserve
    const reserveDays = Math.min(options.reservePreExamDays, Math.floor(totalDaysAvailable / 2));
    const latestAllowedStudyDate = addDays(examDate, -Math.max(1, reserveDays));

    let plannedDayOffsets: number[] = [];

    if (sessionsCount === 1 || totalDaysAvailable <= 2) {
      plannedDayOffsets = [0];
    } else if (totalDaysAvailable <= 5) {
      plannedDayOffsets = [0, Math.floor(totalDaysAvailable / 2)];
    } else {
      // Generate spaced offsets within available window
      for (let i = 0; i < sessionsCount; i++) {
        const targetOffset = standardIntervals[i] || standardIntervals[standardIntervals.length - 1] + i * 5;
        if (targetOffset < totalDaysAvailable - reserveDays) {
          plannedDayOffsets.push(targetOffset);
        } else {
          // Spread backwards before the exam
          const fallbackOffset = Math.max(0, totalDaysAvailable - reserveDays - (sessionsCount - i));
          if (!plannedDayOffsets.includes(fallbackOffset) && fallbackOffset >= 0) {
            plannedDayOffsets.push(fallbackOffset);
          }
        }
      }
    }

    // Ensure sorted and unique
    plannedDayOffsets = Array.from(new Set(plannedDayOffsets)).sort((a, b) => a - b);

    // Now schedule each session on an available day
    plannedDayOffsets.forEach((dayOffset, idx) => {
      let idealDate = addDays(effectiveStartDateStr, dayOffset);
      if (idealDate > latestAllowedStudyDate) {
        idealDate = latestAllowedStudyDate;
      }
      if (idealDate < effectiveStartDateStr) {
        idealDate = effectiveStartDateStr;
      }

      // Check daily capacity, shift forward if full
      let scheduledDate = idealDate;
      let attempts = 0;

      while (attempts < 10) {
        const currentDailyMin = dailyOccupiedMinutes.get(scheduledDate) || 0;
        if (currentDailyMin + sessionMinutes <= maxDailyMinutes && scheduledDate <= latestAllowedStudyDate) {
          break; // found an open day!
        }
        // Try next day
        scheduledDate = addDays(scheduledDate, 1);
        attempts++;
      }

      // If pushed beyond latest allowed date, fallback to closest feasible day
      if (scheduledDate > latestAllowedStudyDate) {
        scheduledDate = latestAllowedStudyDate;
      }

      // Determine time slot for this day
      const existingSlots = dailyTimeSlots.get(scheduledDate) || [];
      let startMin = baseStartMinutes;

      if (existingSlots.length > 0) {
        // Sort existing slots by start time
        existingSlots.sort((a, b) => a.start - b.start);
        const lastSlot = existingSlots[existingSlots.length - 1];
        startMin = lastSlot.end + breakMinutes;
      }

      const endMin = startMin + sessionMinutes;

      // Determine revision type label
      let revType: RevisionType = 'Initial Study';
      let spacedInterval = 0;

      if (idx === 0) {
        revType = chapter.preparationStatus === 'Completed' ? '1st Spaced Review (Day 1)' : 'Initial Study';
        spacedInterval = 1;
      } else if (idx === 1) {
        revType = '2nd Spaced Review (Day 3)';
        spacedInterval = 3;
      } else if (idx === 2) {
        revType = '3rd Spaced Review (Day 7)';
        spacedInterval = 7;
      } else {
        revType = '4th Spaced Review (Day 14)';
        spacedInterval = 14;
      }

      const newTask: RevisionTask = {
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        userId: subject.userId,
        examId: exam.id,
        subjectId: subject.id,
        subjectName: subject.name,
        subjectColor: subject.color,
        chapterId: chapter.id,
        chapterName: chapter.chapterName,
        scheduledDate,
        startTime: minutesToTime(startMin),
        endTime: minutesToTime(endMin),
        durationMinutes: sessionMinutes,
        revisionType: revType,
        priority: chapter.importance,
        isCompleted: false,
        spacedIntervalDay: spacedInterval,
      };

      generatedTasks.push(newTask);

      // Update tracking map
      dailyOccupiedMinutes.set(
        scheduledDate,
        (dailyOccupiedMinutes.get(scheduledDate) || 0) + sessionMinutes
      );

      existingSlots.push({ start: startMin, end: endMin });
      dailyTimeSlots.set(scheduledDate, existingSlots);
    });

    // If there is reserve day right before exam, create high-yield final recap
    if (reserveDays >= 1) {
      const preExamDate = addDays(examDate, -1);
      const preExamMinutes = dailyOccupiedMinutes.get(preExamDate) || 0;
      if (preExamMinutes + 45 <= maxDailyMinutes) {
        const slots = dailyTimeSlots.get(preExamDate) || [];
        let sMin = baseStartMinutes;
        if (slots.length > 0) {
          slots.sort((a, b) => a.start - b.start);
          sMin = slots[slots.length - 1].end + breakMinutes;
        }
        const eMin = sMin + 45;

        // Add pre-exam recap task for this high importance/difficulty chapter
        if (chapter.importance === 'High' || chapter.difficulty === 'Hard') {
          generatedTasks.push({
            id: `task-recap-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            userId: subject.userId,
            examId: exam.id,
            subjectId: subject.id,
            subjectName: subject.name,
            subjectColor: subject.color,
            chapterId: chapter.id,
            chapterName: `${chapter.chapterName} (Exam Final Recap)`,
            scheduledDate: preExamDate,
            startTime: minutesToTime(sMin),
            endTime: minutesToTime(eMin),
            durationMinutes: 45,
            revisionType: 'High-Yield Recap',
            priority: 'High',
            isCompleted: false,
          });

          dailyOccupiedMinutes.set(preExamDate, preExamMinutes + 45);
          slots.push({ start: sMin, end: eMin });
          dailyTimeSlots.set(preExamDate, slots);
        }
      }
    }
  }

  // Combine preserved tasks and newly generated tasks
  const allTasks = [...preservedTasks, ...generatedTasks];

  // Sort chronologically by date and start time
  allTasks.sort((a, b) => {
    if (a.scheduledDate !== b.scheduledDate) {
      return a.scheduledDate.localeCompare(b.scheduledDate);
    }
    return a.startTime.localeCompare(b.startTime);
  });

  return {
    newTasks: allTasks,
    preservedTasks,
    totalGenerated: generatedTasks.length,
  };
}

/**
 * Intelligent Rescheduling for Missed Sessions
 */
export function rescheduleMissedTask(
  missedTask: RevisionTask,
  existingTasks: RevisionTask[],
  options: ScheduleGeneratorOptions
): { updatedTasks: RevisionTask[]; rescheduledTask: RevisionTask } {
  const todayStr = formatDate(new Date());
  let targetDate = todayStr;
  const sessionMinutes = missedTask.durationMinutes || options.sessionDurationMinutes;
  const breakMinutes = options.breakDurationMinutes;
  const maxDailyMinutes = options.dailyAvailableHours * 60;
  const baseStartMinutes = timeToMinutes(options.preferredDailyStartTime || '09:00');

  // Find a day from today onwards with capacity
  let foundSlot: { date: string; start: number; end: number } | null = null;
  let attempts = 0;

  while (attempts < 14) {
    const dayTasks = existingTasks.filter((t) => t.scheduledDate === targetDate && !t.isCompleted);
    const dayOccupiedMin = dayTasks.reduce((sum, t) => sum + (t.durationMinutes || sessionMinutes), 0);

    if (dayOccupiedMin + sessionMinutes <= maxDailyMinutes) {
      // Find open time slot
      dayTasks.sort((a, b) => a.startTime.localeCompare(b.startTime));
      let sMin = baseStartMinutes;

      if (dayTasks.length > 0) {
        const lastTask = dayTasks[dayTasks.length - 1];
        sMin = timeToMinutes(lastTask.endTime) + breakMinutes;
      }

      foundSlot = {
        date: targetDate,
        start: sMin,
        end: sMin + sessionMinutes,
      };
      break;
    }

    targetDate = addDays(targetDate, 1);
    attempts++;
  }

  if (!foundSlot) {
    // If all full, schedule today at end of day
    foundSlot = {
      date: todayStr,
      start: baseStartMinutes + 180,
      end: baseStartMinutes + 180 + sessionMinutes,
    };
  }

  const rescheduledTask: RevisionTask = {
    ...missedTask,
    scheduledDate: foundSlot.date,
    startTime: minutesToTime(foundSlot.start),
    endTime: minutesToTime(foundSlot.end),
    notes: (missedTask.notes ? missedTask.notes + ' ' : '') + `[Rescheduled from ${missedTask.scheduledDate}]`,
  };

  const updatedTasks = existingTasks.map((t) => (t.id === missedTask.id ? rescheduledTask : t));

  return { updatedTasks, rescheduledTask };
}
