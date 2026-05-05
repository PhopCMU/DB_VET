import ProjectDatabaseContent from "./ProjectDatabaseContent";
import { Suspense } from "react";
import SimpleLoading from "@/components/Loadings/SimpleLoading";

export default function Page() {
  return (
    <Suspense fallback={<SimpleLoading />}>
      <ProjectDatabaseContent />
    </Suspense>
  );
}
