"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle,
  Notepad,
  ShieldCheck,
  Wrench,
} from "@phosphor-icons/react";
import { apiPost } from "@/lib/api";

const valueProps = [
  {
    icon: Notepad,
    title: "Personalized walkthrough",
    description:
      "Tailored to your district size, planning structure, and board reporting cadence.",
  },
  {
    icon: Wrench,
    title: "Implementation consultation",
    description:
      "Direct access to discuss timelines, import from your current spreadsheet, and district branding setup.",
  },
  {
    icon: ShieldCheck,
    title: "Procurement readiness",
    description:
      "Review security protocols, data hosting, and pricing aligned to district budget cycles.",
  },
] as const;

const roleOptions = [
  "Superintendent",
  "Chief Academic Officer",
  "Chief Technology Officer",
  "Director",
  "Board Member",
  "Communications / PR",
  "Other",
] as const;

const workflowSteps = [
  {
    step: "1",
    title: "Bring in the plan",
    description:
      "Start from the spreadsheet or board document you already have.",
  },
  {
    step: "2",
    title: "Shape the public surface",
    description:
      "Apply branding, organize ownership, decide public vs. internal.",
  },
  {
    step: "3",
    title: "Update in your rhythm",
    description:
      "Leadership refreshes notes; the public page stays current automatically.",
  },
] as const;

const faqItems = [
  {
    question: "Can we import from our current spreadsheet?",
    answer:
      "Yes. Most districts begin with an existing spreadsheet or document and map it into the plan hierarchy during onboarding.",
  },
  {
    question: "Do we need a separate public website project?",
    answer:
      "No. StrataDash hosts the public planning surface so the district can link to a single destination without a custom web build.",
  },
  {
    question: "Can some updates stay internal?",
    answer:
      "Yes. Teams can keep sensitive operational notes inside the admin workflow while still publishing a useful public-facing summary.",
  },
  {
    question: "What changes for board reporting?",
    answer:
      "The board gets a cleaner current view of progress, and leadership stops duplicating the same update across PDFs, slides, and disconnected spreadsheets.",
  },
] as const;

type FormState = "idle" | "submitting" | "success" | "error";

export function DemoPage() {
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormState("submitting");
    setErrorMessage("");

    const form = e.currentTarget;
    const data = new FormData(form);
    const fullName = (data.get("fullName") as string).trim();
    const email = (data.get("email") as string).trim();
    const organization = (data.get("organization") as string).trim();
    const role = data.get("role") as string;
    const message = (data.get("message") as string).trim();

    const spaceIdx = fullName.indexOf(" ");
    const firstName = spaceIdx > -1 ? fullName.slice(0, spaceIdx) : fullName;
    const lastName = spaceIdx > -1 ? fullName.slice(spaceIdx + 1) : "";

    try {
      await apiPost("/contact", {
        email,
        first_name: firstName,
        last_name: lastName,
        organization,
        topic: "demo_request",
        message: message
          ? `${message}\n\nRole: ${role}`
          : `Demo request\n\nRole: ${role}`,
      });
      setFormState("success");
    } catch (err) {
      setFormState("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong",
      );
    }
  }

  return (
    <div className="overflow-hidden">
      {/* ── Hero + Form ── */}
      <section className="mx-auto max-w-7xl px-8 pb-20 pt-32">
        <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-12">
          {/* Left: Value props */}
          <div className="space-y-12 lg:col-span-5">
            <div className="space-y-6">
              <h1 className="font-headline text-5xl font-extrabold leading-[1.1] tracking-tight text-on-surface">
                Experience the{" "}
                <span className="text-primary">Future</span> of Data
                Governance.
              </h1>
              <p className="text-lg leading-relaxed text-on-surface-variant">
                See how StrataDASH transforms your strategic plan into a
                unified, public-facing surface that stays current as leadership
                updates the work.
              </p>
            </div>

            <div className="space-y-10">
              {valueProps.map((prop) => (
                <div key={prop.title} className="group flex gap-6">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-surface-container-high text-primary transition-colors group-hover:bg-primary-fixed">
                    <prop.icon size={28} weight="bold" />
                  </div>
                  <div>
                    <h3 className="mb-2 font-headline text-xl font-bold text-on-surface">
                      {prop.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-on-surface-variant">
                      {prop.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Form */}
          <div className="lg:col-span-7">
            <div className="ambient-shadow rounded-xl bg-surface-container-lowest p-10">
              {formState === "success" ? (
                <div className="flex flex-col items-center gap-4 py-12 text-center">
                  <CheckCircle
                    size={48}
                    weight="fill"
                    className="text-green-600"
                  />
                  <h3 className="font-headline text-2xl font-bold text-on-surface">
                    Thanks for reaching out!
                  </h3>
                  <p className="max-w-md text-on-surface-variant">
                    We&apos;ll reach out within one business day to schedule your
                    walkthrough.
                  </p>
                  <Link
                    href="/"
                    className="mt-4 text-sm font-semibold text-primary hover:underline"
                  >
                    Back to home
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="ml-1 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                        Full Name
                      </label>
                      <input
                        name="fullName"
                        type="text"
                        required
                        placeholder="Jane Smith"
                        className="w-full rounded-lg border-none bg-surface-container-low p-4 text-on-surface placeholder:text-outline transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="ml-1 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                        Work Email
                      </label>
                      <input
                        name="email"
                        type="email"
                        required
                        placeholder="jane@district.org"
                        className="w-full rounded-lg border-none bg-surface-container-low p-4 text-on-surface placeholder:text-outline transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="ml-1 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                        District / Organization
                      </label>
                      <input
                        name="organization"
                        type="text"
                        placeholder="Metro District 12"
                        className="w-full rounded-lg border-none bg-surface-container-low p-4 text-on-surface placeholder:text-outline transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="ml-1 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                        Your Role
                      </label>
                      <select
                        name="role"
                        required
                        className="w-full rounded-lg border-none bg-surface-container-low p-4 text-on-surface transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/40"
                      >
                        <option value="">Select your role</option>
                        {roleOptions.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="ml-1 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      What are you hoping to solve?
                    </label>
                    <textarea
                      name="message"
                      rows={4}
                      placeholder="Briefly describe your current planning challenges..."
                      className="w-full rounded-lg border-none bg-surface-container-low p-4 text-on-surface placeholder:text-outline transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/40"
                    />
                  </div>

                  {formState === "error" && (
                    <p className="text-sm text-error">{errorMessage}</p>
                  )}

                  <button
                    type="submit"
                    disabled={formState === "submitting"}
                    className="hero-gradient w-full rounded-full py-5 font-headline text-lg font-extrabold text-white shadow-xl shadow-primary/20 transition-transform hover:scale-[0.98] disabled:opacity-60"
                  >
                    {formState === "submitting"
                      ? "Submitting..."
                      : "Submit Request"}
                  </button>

                  <p className="text-center text-xs text-on-surface-variant">
                    By submitting, you agree to our{" "}
                    <Link href="/privacy" className="underline">
                      Privacy Policy
                    </Link>{" "}
                    and{" "}
                    <Link href="/terms" className="underline">
                      Terms of Service
                    </Link>
                    .
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Product Preview ── */}
      <section className="mx-auto max-w-7xl px-8 pb-20">
        <div className="group relative">
          <div className="absolute -inset-4 rounded-xl bg-primary/5 blur-2xl transition-colors group-hover:bg-primary/10" />
          <div className="ambient-shadow relative overflow-hidden rounded-xl border border-white/50 bg-surface-container-high">
            <Image
              src="/images/marketing/dark-dashboard.jpg"
              alt="StrataDash platform dashboard"
              width={1280}
              height={600}
              className="h-auto w-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
          </div>
          <div className="ambient-shadow absolute -bottom-6 -right-6 hidden items-center gap-3 rounded-xl bg-white p-4 md:flex">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
              <CheckCircle size={20} weight="fill" />
            </div>
            <div className="pr-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                Live System Status
              </p>
              <p className="font-headline text-sm font-bold">
                99.9% Uptime Verified
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How Teams Go Live ── */}
      <section className="bg-surface-container-low py-24 px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="font-headline text-4xl font-extrabold">
              How teams go live
            </h2>
            <p className="mt-4 text-lg text-on-surface-variant">
              A rollout sequence that fits district reality.
            </p>
          </div>

          <div className="relative grid grid-cols-1 gap-16 md:grid-cols-3">
            <div className="absolute left-0 top-10 z-0 hidden h-0.5 w-full bg-outline-variant/30 md:block" />
            {workflowSteps.map((step) => (
              <div key={step.step} className="relative z-10 text-center">
                <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full border-4 border-surface bg-surface-container-lowest text-3xl font-extrabold text-primary shadow-xl">
                  {step.step}
                </div>
                <h3 className="mb-4 font-headline text-2xl font-bold">
                  {step.title}
                </h3>
                <p className="text-on-surface-variant">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="px-8 py-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-12 font-headline text-4xl font-extrabold">
            Questions districts ask before switching
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {faqItems.map((item) => (
              <div
                key={item.question}
                className="rounded-xl bg-surface-container-lowest p-6 ambient-shadow"
              >
                <h3 className="font-headline text-lg font-bold text-on-surface">
                  {item.question}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
