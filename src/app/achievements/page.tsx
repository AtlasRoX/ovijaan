"use client";

import Link from "next/link";
import { Award, Trophy, Sparkles, ExternalLink, FileText, Calendar } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { formatDate, formatCurrency } from "@/lib/utils";

export default function AchievementsPage() {
  const { results, competitions } = useAppStore();

  const wins = results.filter((r) => r.outcome === "Winner");
  const finalists = results.filter((r) => r.outcome === "Finalist");
  const specialAwards = results.filter((r) => r.outcome === "Special Award");

  // Sum prize amounts by currency
  const prizesByCurrency = results.reduce<Record<string, number>>((acc, curr) => {
    if (curr.prizeAmount && curr.prizeCurrency) {
      const cur = curr.prizeCurrency.toUpperCase();
      acc[cur] = (acc[cur] || 0) + curr.prizeAmount;
    }
    return acc;
  }, {});

  const handleCelebrate = async () => {
    try {
      const confettiModule = await import("canvas-confetti");
      const confetti = confettiModule.default || confettiModule;
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch (e) {
      console.warn("Confetti error:", e);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Achievements & Hall of Fame
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Verifiable record of your competition outcomes, rankings, awards, and prize totals.
          </p>
        </div>

        <button
          onClick={handleCelebrate}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:from-amber-600 hover:to-amber-700 transition"
        >
          <Sparkles className="h-4 w-4" />
          <span>Celebrate Wins</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
          <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
            1st Place / Wins
          </span>
          <p className="mt-2 text-2xl font-bold text-amber-900 dark:text-amber-100">
            {wins.length}
          </p>
        </div>

        <div className="rounded-2xl border border-purple-500/30 bg-purple-500/10 p-4">
          <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">
            Finalist Appearances
          </span>
          <p className="mt-2 text-2xl font-bold text-purple-900 dark:text-purple-100">
            {finalists.length}
          </p>
        </div>

        <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4">
          <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
            Special Recognitions
          </span>
          <p className="mt-2 text-2xl font-bold text-blue-900 dark:text-blue-100">
            {specialAwards.length}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            Prize Money Won
          </span>
          <p className="mt-2 text-sm font-bold text-emerald-900 dark:text-emerald-100 truncate">
            {Object.keys(prizesByCurrency).length > 0
              ? Object.entries(prizesByCurrency)
                  .map(([c, val]) => formatCurrency(val, c))
                  .join(" + ")
              : "$0.00"}
          </p>
        </div>
      </div>

      {/* Results List */}
      {results.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <Award className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <h3 className="mt-4 text-base font-bold text-foreground">No results recorded yet</h3>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
            When you complete a hackathon or receive results, record your ranking, prize, or certificate inside the competition page.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((res) => {
          const comp = competitions.find((c) => c.id === res.competitionId);

          return (
            <div
              key={res.id}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm hover:border-primary-500/30 transition flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      res.outcome === "Winner"
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                        : "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30"
                    }`}
                  >
                    {res.outcome}
                  </span>
                  {res.rank && (
                    <span className="text-xs font-bold text-foreground">
                      {res.rank}
                    </span>
                  )}
                </div>

                {comp && (
                  <Link
                    href={`/competitions/${comp.id}`}
                    className="text-base font-bold text-foreground hover:text-primary-500 block pt-1"
                  >
                    {comp.name}
                  </Link>
                )}

                {res.awardCategory && (
                  <p className="text-xs text-muted-foreground font-medium">
                    Category: <span className="text-foreground">{res.awardCategory}</span>
                  </p>
                )}

                {res.feedback && (
                  <p className="text-xs text-muted-foreground italic mt-2 bg-muted/40 p-2.5 rounded-xl border border-border">
                    "{res.feedback}"
                  </p>
                )}
              </div>

              {/* Prize & Certificate */}
              <div className="flex flex-col md:items-end justify-between shrink-0 space-y-2">
                {res.prizeAmount && (
                  <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(res.prizeAmount, res.prizeCurrency)}
                  </span>
                )}
                {res.resultDate && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formatDate(res.resultDate)}</span>
                  </span>
                )}
                {res.certificateName && (
                  <span className="inline-flex items-center gap-1 text-xs text-primary-500 font-medium">
                    <FileText className="h-3.5 w-3.5" />
                    <span>{res.certificateName}</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
}
