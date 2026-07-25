export type GradeColumn = {
  readonly id: string;
  readonly title: string;
  readonly subject: string;
  readonly total: number;
  readonly isNew?: boolean;
};

export type GradebookStudent = {
  readonly id: string;
  readonly fullName: string;
};

export function cellKey(studentId: string, columnId: string): string {
  return `${studentId}::${columnId}`;
}
