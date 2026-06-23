"use client";

import { useMemo, useState } from "react";
import { ClipboardCheck } from "lucide-react";

import type {
  AttendanceMark,
  DailyAttendanceRecord,
  StudentProfile,
} from "@/types/portal";

type AttendanceMarkerProps = {
  readonly students: readonly StudentProfile[];
  readonly records: readonly DailyAttendanceRecord[];
};

const attendanceOptions: readonly {
  value: AttendanceMark;
  label: string;
}[] = [
  { value: "present", label: "Present" },
  { value: "late", label: "Late" },
  { value: "absent", label: "Absent" },
  { value: "excused", label: "Excused" },
];

export function AttendanceMarker({
  students,
  records,
}: AttendanceMarkerProps) {
  const initialMarks = useMemo(
    () =>
      Object.fromEntries(
        students.map((student) => [
          student.id,
          records.find((record) => record.studentId === student.id)?.mark ??
            "present",
        ]),
      ) as Record<string, AttendanceMark>,
    [records, students],
  );
  const [marks, setMarks] = useState(initialMarks);
  const [message, setMessage] = useState<string | null>(null);

  const totals = attendanceOptions.map((option) => ({
    ...option,
    count: Object.values(marks).filter((mark) => mark === option.value).length,
  }));

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(
      `Attendance preview prepared for ${students.length} students. No register was saved.`,
    );
  }

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-4">
        {totals.map((total) => (
          <div
            key={total.value}
            className="rounded-2xl border border-border bg-soft-white p-4"
          >
            <p className="text-2xl font-extrabold text-charcoal">
              {total.count}
            </p>
            <p className="mt-1 text-sm text-muted-grey">{total.label}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-6">
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="min-w-full border-collapse text-left text-sm">
            <caption className="sr-only">
              Mock daily attendance register
            </caption>
            <thead className="bg-soft-cream text-xs tracking-[0.08em] text-charcoal uppercase">
              <tr>
                <th scope="col" className="px-5 py-4 font-bold">
                  Student
                </th>
                <th scope="col" className="px-5 py-4 font-bold">
                  Student ID
                </th>
                <th scope="col" className="px-5 py-4 font-bold">
                  Attendance
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {students.map((student) => (
                <tr key={student.id}>
                  <td className="px-5 py-4 font-semibold text-charcoal">
                    {student.fullName}
                  </td>
                  <td className="px-5 py-4 text-muted-grey">
                    {student.studentId}
                  </td>
                  <td className="px-5 py-4">
                    <select
                      value={marks[student.id]}
                      onChange={(event) =>
                        setMarks((current) => ({
                          ...current,
                          [student.id]: event.target.value as AttendanceMark,
                        }))
                      }
                      aria-label={`Attendance for ${student.fullName}`}
                      className="min-h-10 rounded-xl border border-border bg-white px-3 text-charcoal"
                    >
                      {attendanceOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          type="submit"
          className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-curry-orange px-6 font-bold text-white transition-colors hover:bg-deep-orange"
        >
          <ClipboardCheck aria-hidden="true" className="size-5" />
          Preview attendance submission
        </button>
      </form>

      {message ? (
        <p
          role="status"
          className="mt-5 rounded-2xl border border-curry-orange/25 bg-soft-cream p-4 text-sm font-semibold text-charcoal"
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
