import { createContext, Dispatch, SetStateAction } from 'react';
import { PaginationState } from '@tanstack/react-table';

interface RequestsContextProps {
  keyword: string;
  setKeyword: Dispatch<SetStateAction<string>>;
  pagination: PaginationState;
  setPagination: Dispatch<SetStateAction<PaginationState>>;
  isLoadedList: boolean;
  setLoadedList: Dispatch<SetStateAction<boolean>>;
}

const RequestsContext = createContext<RequestsContextProps>({
  keyword: '',
  setKeyword: () => {},
  pagination: { pageIndex: 0, pageSize: 10 },
  setPagination: () => {},
  isLoadedList: false,
  setLoadedList: () => {},
});

export default RequestsContext;
