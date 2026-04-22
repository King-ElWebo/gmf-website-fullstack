import { listNavCatalogTypes } from '@/lib/repositories/catalog-types';
import { HeaderClient, type NavCatalogType } from '@/components/public/HeaderClient';

export async function Header() {
  const catalogTypes = await listNavCatalogTypes();

  const navCatalogTypes: NavCatalogType[] = catalogTypes.map((ct) => ({
    slug: ct.slug,
    label: ct.navLabel?.trim() || ct.name,
    isDefault: ct.isDefault,
  }));

  return <HeaderClient navCatalogTypes={navCatalogTypes} />;
}
