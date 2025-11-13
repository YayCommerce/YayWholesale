import { createContext, Dispatch, SetStateAction, useState } from 'react';
import { PaginationState } from '@tanstack/react-table';
import { __ } from '@wordpress/i18n';

import RequestsContext from './RequestsContext';
import RequestsForm from './RequestsForm';
import RequestsList from './RequestsList';

export default function RequestsPage() {
  const [keyword, setKeyword] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [isLoadedList, setLoadedList] = useState(false);
  return (
    <div className="mx-auto mt-[84px] max-w-7xl space-y-6 px-6">
      <RequestsContext.Provider
        value={{ keyword, setKeyword, pagination, setPagination, isLoadedList, setLoadedList }}
      >
        <RequestsList />
        <RequestsForm />
      </RequestsContext.Provider>
    </div>
  );
}
