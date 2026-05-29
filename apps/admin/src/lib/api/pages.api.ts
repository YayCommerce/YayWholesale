import { wordpressApi } from './api';

interface WpPageResponse {
  id: number;
  slug: string;
  title: {
    rendered: string;
  };
}

function mapPage(page: WpPageResponse) {
  return {
    id: page.id,
    title: page.title.rendered,
    slug: page.slug,
  };
}

async function fetchPage(page: number) {
  return wordpressApi.get('pages', {
    searchParams: {
      per_page: '100',
      status: 'publish',
      _fields: 'id,title,slug',
      page: page,
    },
  });
}

async function fetchPageData(page: number) {
  const response = await fetchPage(page);
  return response.json<WpPageResponse[]>();
}

export async function fetchAllPages() {
  const firstResponse = await fetchPage(1);
  const totalPages = Number(firstResponse.headers.get('X-WP-TotalPages') ?? 1);
  const firstPages = await firstResponse.json<WpPageResponse[]>();

  if (totalPages === 1) {
    return firstPages.map(mapPage);
  }

  const remainingPages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) => fetchPageData(index + 2)),
  );

  return [...firstPages, ...remainingPages.flat()].map(mapPage);
}
