import { StatsHero } from "@/components/stats-hero";
import { CategoryRoadmap } from "@/components/category-roadmap";

export default function DashboardPage() {
  return (
    <div>
      <StatsHero />
      <h2 className="mt-10 font-display text-sm uppercase tracking-widest text-muted-foreground">
        Roadmap
      </h2>
      <CategoryRoadmap />
    </div>
  );
}
