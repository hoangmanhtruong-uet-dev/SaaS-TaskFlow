import { SearchPageContainer } from "@/app/components/search/SearchPageContainer";
import { PageHeading } from "@/app/components/product-views";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeading eyebrow="Workspace" title="Tìm kiếm thông minh" />
      <SearchPageContainer />
    </div>
  );
}
