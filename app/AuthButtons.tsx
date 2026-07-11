"use client";
import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";

export function SignUpFreeButton({ className }: { className?: string }) {
  return (
    <Show when="signed-out">
      <SignUpButton>
        <button className={className}>
          Get Started Free →
        </button>
      </SignUpButton>
    </Show>
  );
}

export function PostJobButton({ className }: { className?: string }) {
  return (
    <Show when="signed-out">
      <SignUpButton>
        <button className={className}>
          Post a Job — It&apos;s Free
        </button>
      </SignUpButton>
    </Show>
  );
}

export function JoinProviderButton({ className }: { className?: string }) {
  return (
    <Show when="signed-out">
      <SignUpButton>
        <button className={className}>
          Join as a Provider
        </button>
      </SignUpButton>
    </Show>
  );
}