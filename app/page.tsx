import { AuthGate } from "@/components/AuthGate";
import { ConversationForm } from "@/components/ConversationForm";

export default function HomePage() {
  return (
    <AuthGate>
      <ConversationForm />
    </AuthGate>
  );
}
