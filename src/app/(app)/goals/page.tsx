import { TopBar } from "@/components/TopBar";
import { PageHeader } from "@/components/PageHeader";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { listGoals } from "@/lib/db/goals";
import { GoalsList } from "./GoalsList";

export default async function GoalsPage() {
  const goals = await listGoals();

  return (
    <>
      <TopBar right={<UserAvatar />} />
      <div className="mx-auto w-full max-w-md lg:max-w-5xl lg:px-8">
        <PageHeader
          eyebrow="Savings"
          title="Goals"
          subtitle="Set targets. Watch them grow."
        />
        <div className="grid gap-3 px-4 pb-6 lg:grid-cols-2 lg:px-0">
          <GoalsList goals={goals} />
        </div>
      </div>
    </>
  );
}
