import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { schoolMessage } from "@/data/home";

export function SchoolMessage() {
  return (
    <section className="bg-white py-20 sm:py-24 lg:py-32">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-balance text-3xl font-extrabold tracking-[-0.03em] text-charcoal sm:text-4xl lg:text-[2.625rem]">
            {schoolMessage.title}
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-grey sm:text-xl">
            {schoolMessage.description}
          </p>
          <Button href={schoolMessage.action.href} className="mt-9">
            {schoolMessage.action.label}
          </Button>
        </div>
      </Container>
    </section>
  );
}
