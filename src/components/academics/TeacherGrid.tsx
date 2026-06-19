import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FacultyExplorer } from "@/components/academics/FacultyExplorer";
import {
  facultyMembers,
  teacherProfiles,
  teachingPrinciples,
} from "@/data/academics";

export function TeacherGrid() {
  return (
    <>
      <section className="bg-white py-20 sm:py-24 lg:py-28">
        <Container>
          <SectionHeader
            eyebrow="Teaching Teams"
            title="Working together across every stage"
            description="Official staff names and photographs will be added when approved. These role-based profiles show how teaching support is organised across the school."
          />
          <FacultyExplorer teams={teacherProfiles} faculty={facultyMembers} />
        </Container>
      </section>

      <section className="pattern-checker py-20 sm:py-24 lg:py-28">
        <Container>
          <SectionHeader
            eyebrow="Our Teaching Practice"
            title="Consistent principles, responsive support"
            description="Teaching practice is organised around clear expectations, knowledge of each learner and professional collaboration."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {teachingPrinciples.map((principle) => (
              <Card
                key={principle.title}
                title={principle.title}
                description={principle.description}
                icon={
                  <ContentIcon name={principle.icon} className="size-6" />
                }
              />
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
