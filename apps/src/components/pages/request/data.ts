export type Request = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'approved' | 'pending' | 'rejected';
  date: string;
  avatar: string;
};

export const requests: Request[] = Array.from({ length: 68 }).map((_, i) => ({
  id: `${i + 1}`,
  name: [
    'Hannah Morgan',
    'Nathaniel Boyd',
    'Iris Powell',
    'Fiona Ellis',
    'Emily West',
    'Lucy Freeman',
    'Audrey Bennett',
    'Dean Simmons',
    'Kate Richards',
  ][i % 9],
  email: 'example@gmail.com',
  role: ['Diamond', 'Gold', 'Silver'][i % 3],
  status: ['approved', 'pending', 'rejected'][i % 3] as 'approved' | 'pending' | 'rejected',
  date: 'Sep 5, 2024 8:50 am',
  avatar: `https://i.pravatar.cc/40?img=${i % 10}`,
}));
