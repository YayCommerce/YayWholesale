import { wordpressApi } from './api';

/**
 * The WordPress page response
 */
interface WpPageResponse {
  id: number;
  slug: string;
  title: {
    rendered: string;
  };
}

/**
 * The page size
 */
const PAGE_SIZE = 100;

/**
 * Map the page response to the page type
 * @param page - The page response
 * @returns The page
 */
function mapPage({ id, slug, title }: WpPageResponse) {
  return {
    id,
    slug,
    title: title.rendered,
  };
}

/**
 * Get pages from the WordPress API
 * @param page - The page number to get
 * @returns The total number of pages and the pages for the given page number
 */
async function getPages(page: number) {
  const response = await wordpressApi.get('pages', {
    searchParams: {
      page,
      per_page: PAGE_SIZE.toString(),
      status: 'publish',
      _fields: 'id,title,slug',
    },
  });

  return {
    totalPages: Number(response.headers.get('X-WP-TotalPages') ?? 1),
    pages: await response.json<WpPageResponse[]>(),
  };
}

/**
 * Fetch all pages from the WordPress API
 * @returns The pages
 */
export async function fetchAllPages() {
  const { totalPages, pages: firstPage } = await getPages(1);

  const remainingPages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) => getPages(index + 2).then(({ pages }) => pages)),
  );

  return [firstPage, ...remainingPages].flat().map(mapPage);
}
