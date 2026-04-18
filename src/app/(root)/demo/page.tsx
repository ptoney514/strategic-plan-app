"use client";
import dynamic from "next/dynamic";
import { V2MarketingLayout } from "@/components/v2/layout/V2MarketingLayout";

const DemoPage = dynamic(
  () =>
    import("@/views/v2/marketing/DemoPage").then((m) => ({
      default: m.DemoPage,
    })),
  { ssr: false },
);

export default function Page() {
  return (
    <V2MarketingLayout>
      <DemoPage />
    </V2MarketingLayout>
  );
}
