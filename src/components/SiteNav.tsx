"use client";

import Link from "next/link";
import { BookOpen, ClipboardList, GraduationCap } from "lucide-react";

import { cn } from "@/lib/cn";

export type SiteSection = "cases" | "krok" | "notes" | "home";

const siteNavItems = [
  {
    href: "/cases",
    key: "cases",
    label: "ОСКІ станції",
    mobileLabel: "ОСКІ",
    Icon: ClipboardList
  },
  {
    href: "/krok",
    key: "krok",
    label: "КРОК тести",
    mobileLabel: "КРОК",
    Icon: GraduationCap
  },
  {
    href: "/notes",
    key: "notes",
    label: "Конспект",
    mobileLabel: "Конспект",
    Icon: BookOpen
  }
] as const;

export function SiteSectionLinks({
  active,
  className
}: {
  active: SiteSection;
  className?: string;
}) {
  return (
    <nav className={cn("grid gap-1.5", className)} aria-label="Навігація сайту">
      {siteNavItems.map(({ href, key, label, Icon }) => {
        const isActive = active === key;

        return (
          <Link
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex min-h-[42px] items-center gap-2.5 rounded-lg px-2.5 text-sm font-extrabold text-[#3d434b] transition hover:bg-clinical-accent-soft hover:text-[#171a1f]",
              isActive && "bg-clinical-accent-soft text-[#171a1f]"
            )}
            href={href}
            key={key}
          >
            <Icon size={18} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function SiteMobileTabbar({ active }: { active: SiteSection }) {
  return (
    <nav
      aria-label="Основні розділи"
      className="mobile-tabbar fixed inset-x-0 bottom-0 z-20 hidden min-h-16 grid-cols-3 border-t border-clinical-line bg-clinical-bg/95 px-1.5 pb-2 pt-1.5 backdrop-blur-xl max-md:grid"
      data-site-mobile-tabbar="primary"
    >
      {siteNavItems.map(({ href, key, mobileLabel, Icon }) => {
        const isActive = active === key;

        return (
          <Link
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex min-w-0 flex-col items-center justify-center gap-1 px-1 text-[11px] leading-tight text-[#5d6470]",
              isActive && "font-extrabold text-clinical-accent-strong"
            )}
            href={href}
            key={key}
          >
            <Icon size={19} />
            <span className="max-w-full truncate">{mobileLabel}</span>
          </Link>
        );
      })}
    </nav>
  );
}
