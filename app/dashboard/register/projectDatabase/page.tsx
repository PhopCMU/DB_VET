import SimpleLoading from "@/components/Loadings/SimpleLoading";
import ProjectDatabaseContent from "./ProjectDatabaseContent";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<SimpleLoading />}>
      <ProjectDatabaseContent />
    </Suspense>
  );
}
