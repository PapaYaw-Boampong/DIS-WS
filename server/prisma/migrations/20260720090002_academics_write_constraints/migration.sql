-- CreateIndex
CREATE UNIQUE INDEX "daily_attendance_classId_studentId_date_key" ON "daily_attendance"("classId", "studentId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "gradebook_entries_classId_studentId_subject_assessment_key" ON "gradebook_entries"("classId", "studentId", "subject", "assessment");
