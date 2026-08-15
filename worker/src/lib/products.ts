import type { Env } from "../env";
import type { Product, ProductImage } from "@mohini-artistry/shared";

interface ProductRow {
  id: number;
  slug: string;
  name: string;
  category_id: number;
  category_slug?: string;
  category_name?: string;
  description: string;
  price_paise: number;
  compare_at_paise: number | null;
  stock: number;
  is_new_arrival: number;
  is_bestseller: number;
  is_active: number;
  rating_avg: number;
  rating_count: number;
  order_count: number;
  created_at: number;
  updated_at: number;
}

interface ImageRow {
  id: number;
  product_id: number;
  url: string;
  sort_order: number;
  is_primary: number;
}

export const PRODUCT_SELECT_COLUMNS = `
  p.id, p.slug, p.name, p.category_id, c.slug AS category_slug, c.name AS category_name,
  p.description, p.price_paise, p.compare_at_paise, p.stock, p.is_new_arrival, p.is_bestseller,
  p.is_active, p.rating_avg, p.rating_count, p.order_count, p.created_at, p.updated_at
`;

export const PRODUCT_FROM_CLAUSE = `FROM products p JOIN categories c ON c.id = p.category_id`;

function rowToProduct(row: ProductRow, images: ProductImage[]): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    categoryId: row.category_id,
    categorySlug: row.category_slug,
    categoryName: row.category_name,
    description: row.description,
    pricePaise: row.price_paise,
    compareAtPaise: row.compare_at_paise,
    stock: row.stock,
    isNewArrival: row.is_new_arrival === 1,
    isBestseller: row.is_bestseller === 1,
    isActive: row.is_active === 1,
    ratingAvg: row.rating_avg,
    ratingCount: row.rating_count,
    orderCount: row.order_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    images,
  };
}

export async function attachImages(env: Env, rows: ProductRow[]): Promise<Product[]> {
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);
  const placeholders = ids.map(() => "?").join(",");
  const imagesResult = await env.DB.prepare(
    `SELECT id, product_id, url, sort_order, is_primary FROM product_images
     WHERE product_id IN (${placeholders}) ORDER BY is_primary DESC, sort_order ASC`
  )
    .bind(...ids)
    .all<ImageRow>();

  const imagesByProduct = new Map<number, ProductImage[]>();
  for (const img of imagesResult.results ?? []) {
    const list = imagesByProduct.get(img.product_id) ?? [];
    list.push({
      id: img.id,
      productId: img.product_id,
      url: img.url,
      sortOrder: img.sort_order,
      isPrimary: img.is_primary === 1,
    });
    imagesByProduct.set(img.product_id, list);
  }

  return rows.map((row) => rowToProduct(row, imagesByProduct.get(row.id) ?? []));
}

export type { ProductRow };
