import { AuthGate } from "@/components/AuthGate";
import { PlanView } from "@/components/PlanView";

export default function PlanPage() {
  return (
    <AuthGate>
      <PlanView />
    </AuthGate>
  );
}
