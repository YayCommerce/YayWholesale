export type RequestField = {
  label: string;
  value: string;
  type: string;
};

export type Request = {
  id: number;
  name: string;
  email: string;
  message: string;
  firstName: string;
  lastName: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
  avatar: string;
  fields: RequestField[];
  defaultFieldLabels: {
    email: string;
    message: string;
    firstName: string;
    lastName: string;
  };
};

export type CountRequestByStatus = {
  pending: number;
  rejected: number;
  total: number;
};

export type RequestFilter = {
  status: 'all' | Request['status'];
  search: string;
  page: number;
  perPage: number;
};
