import dbConnect from "@/lib/mongoose";
import DoctorProfile from "@/models/DoctorProfile";
import TimeSlot, { ITimeSlot } from "@/models/TimeSlot";

// ── helpers ──────────────────────────────────────────────────────────────────

/** Parse "HH:mm" → total minutes from midnight */
function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/** Format total minutes → "HH:mm" */
function fromMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Midnight UTC for a given date (strips time component) */
function toDateOnly(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

/** Iterate every calendar day in [startDate, endDate] inclusive */
function* eachDay(startDate: Date, endDate: Date): Generator<Date> {
  const cur = toDateOnly(startDate);
  const end = toDateOnly(endDate);
  while (cur <= end) {
    yield new Date(cur);
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
}

// ── public API ────────────────────────────────────────────────────────────────

export interface GenerateResult {
  created: number;
  skipped: number; // already existed (duplicate key)
}

/**
 * Generate TimeSlots for a doctor over a date range using their workingHours
 * template. Duplicate slots (same doctor + date + startTime) are silently
 * skipped via the unique index.
 */
export async function generateSlots(
  doctorId: string,
  startDate: Date,
  endDate: Date
): Promise<GenerateResult> {
  await dbConnect();

  if (endDate < startDate) throw new Error("endDate must be >= startDate");

  const MAX_DAYS = 90;
  const diffDays = Math.ceil(
    (toDateOnly(endDate).getTime() - toDateOnly(startDate).getTime()) / 86_400_000
  );
  if (diffDays > MAX_DAYS) {
    throw new Error(`Date range exceeds maximum of ${MAX_DAYS} days`);
  }

  const profile = await DoctorProfile.findOne({ userId: doctorId }).lean();
  if (!profile) throw new Error("Doctor profile not found");
  if (!profile.workingHours.length) throw new Error("Doctor has no working hours configured");

  // Build a map: dayOfWeek → schedule entry
  const scheduleMap = new Map(profile.workingHours.map((wh) => [wh.dayOfWeek, wh]));

  const slotsToInsert: Array<{
    doctorId: string;
    date: Date;
    startTime: string;
    endTime: string;
    isBooked: boolean;
    lockedUntil: null;
    lockedBy: null;
  }> = [];

  for (const day of eachDay(startDate, endDate)) {
    const dayOfWeek = day.getUTCDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;
    const schedule = scheduleMap.get(dayOfWeek);
    if (!schedule) continue; // doctor doesn't work this day

    const start = toMinutes(schedule.startTime);
    const end = toMinutes(schedule.endTime);
    const duration = schedule.slotDurationMinutes;

    for (let t = start; t + duration <= end; t += duration) {
      slotsToInsert.push({
        doctorId,
        date: day,
        startTime: fromMinutes(t),
        endTime: fromMinutes(t + duration),
        isBooked: false,
        lockedUntil: null,
        lockedBy: null,
      });
    }
  }

  if (!slotsToInsert.length) {
    return { created: 0, skipped: 0 };
  }

  // ordered: false → continue on duplicate key errors, don't abort batch
  let created = 0;
  let skipped = 0;
  try {
    const result = await TimeSlot.insertMany(slotsToInsert, {
      ordered: false,
      rawResult: true,
    });
    created = result.insertedCount ?? slotsToInsert.length;
  } catch (err: unknown) {
    // BulkWriteError: some inserted, some duplicate
    if (
      err instanceof Error &&
      "writeErrors" in err &&
      "result" in err
    ) {
      const bulkErr = err as { result: { nInserted: number }; writeErrors: unknown[] };
      created = bulkErr.result.nInserted;
      skipped = (err as { writeErrors: unknown[] }).writeErrors.length;
    } else {
      throw err;
    }
  }

  skipped = skipped || slotsToInsert.length - created;
  return { created, skipped };
}

export interface SlotInfo {
  id: string;
  date: string;       // ISO date string
  startTime: string;
  endTime: string;
  isAvailable: boolean; // false when booked OR lock still active
}

/**
 * Return distinct dates (YYYY-MM-DD UTC) that have at least one available slot
 * within the next `days` calendar days from today.
 */
export async function getAvailableDates(
  doctorId: string,
  days: number = 30
): Promise<string[]> {
  await dbConnect();

  const from = toDateOnly(new Date());
  const to = new Date(from);
  to.setUTCDate(to.getUTCDate() + days - 1);

  const now = new Date();

  const slots: ITimeSlot[] = await TimeSlot.find({
    doctorId,
    date: { $gte: from, $lte: to },
    isBooked: false,
    $or: [{ lockedUntil: null }, { lockedUntil: { $lt: now } }],
  })
    .select("date")
    .sort({ date: 1 })
    .lean();

  const seen = new Set<string>();
  for (const s of slots) {
    seen.add(s.date.toISOString().slice(0, 10));
  }
  return Array.from(seen);
}

/**
 * Return all slots for a doctor on a specific date.
 * "Available" = not booked AND (lockedUntil is null OR lockedUntil has expired).
 */
export async function getSlotsByDate(
  doctorId: string,
  date: Date
): Promise<SlotInfo[]> {
  await dbConnect();

  const day = toDateOnly(date);

  const slots: ITimeSlot[] = await TimeSlot.find({
    doctorId,
    date: day,
  })
    .sort({ startTime: 1 })
    .lean();

  const now = new Date();

  return slots.map((s) => ({
    id: s._id.toString(),
    date: s.date.toISOString(),
    startTime: s.startTime,
    endTime: s.endTime,
    isAvailable:
      !s.isBooked && (s.lockedUntil === null || s.lockedUntil < now),
  }));
}
