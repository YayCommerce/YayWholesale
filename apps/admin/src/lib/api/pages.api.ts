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
 * Get pages from the WordPress API
 * @param page - The page number to get
 * @returns The total number of pages and the pages for the given page number
 */
export async function getPages(page: number, perPage: number = 100) {
  const response = await wordpressApi.get('pages', {
    searchParams: {
      page,
      per_page: perPage.toString(),
      status: 'publish',
      _fields: 'id,title,slug',
    },
  });

  return {
    totalPages: Number(response.headers.get('X-WP-TotalPages') ?? 1),
    pages: await response.json<WpPageResponse[]>(),
  };
}
