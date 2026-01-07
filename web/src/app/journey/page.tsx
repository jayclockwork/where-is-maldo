import { SiteAppBar } from "@/components/SiteAppBar";
import { JourneyView } from "@/components/journey/JourneyView";
import { loadJourney } from "@/lib/journey/loadJourney";

export const dynamic = "force-static";

export default async function JourneyPage() {
  const journey = await loadJourney();

  return (
    <>
      <SiteAppBar />
      <JourneyView journey={journey} />
    </>
  );
}


