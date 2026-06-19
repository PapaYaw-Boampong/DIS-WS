import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { routes } from "@/lib/routes";

export default function NotFound() {
  return (
    <main className="pattern-checker flex min-h-screen items-center py-20">
      <Container className="text-center">
        <p className="text-sm font-extrabold tracking-[0.18em] text-curry-orange uppercase">
          404
        </p>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-charcoal sm:text-5xl">
          Page not found
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-muted-grey">
          The page you requested is not available or may have moved.
        </p>
        <div className="mt-8 flex justify-center">
          <Button href={routes.home}>Return Home</Button>
        </div>
      </Container>
    </main>
  );
}
