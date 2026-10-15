"use client";

import dynamic from "next/dynamic";

const AnnotatedText = dynamic(
  () =>
    import("@/components/showpiece/annotated-text").then(
      (module) => module.AnnotatedText,
    ),
  { loading: () => <span>with you in it.</span>, ssr: false },
);

export function LandingAnnotation() {
  return (
    <AnnotatedText animate className="text-primary">
      with you in it.
    </AnnotatedText>
  );
}
