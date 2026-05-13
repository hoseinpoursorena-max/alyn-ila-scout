import { AuthGate } from "@/components/AuthGate";
import { RecordsTable } from "@/components/RecordsTable";

export default function RecordsPage() {
  return (
    <AuthGate>
      <RecordsTable />
    </AuthGate>
  );
}
