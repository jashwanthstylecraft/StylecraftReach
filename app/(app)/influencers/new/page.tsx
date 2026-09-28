import { Header } from "@/components/layout/Header";
import { NewInfluencerForm } from "@/components/influencer/NewInfluencerForm";

export default function NewInfluencerPage() {
  return (
    <div>
      <Header title="Add influencer" subtitle="Manually add an influencer to the CRM" />
      <div className="p-8">
        <NewInfluencerForm />
      </div>
    </div>
  );
}
