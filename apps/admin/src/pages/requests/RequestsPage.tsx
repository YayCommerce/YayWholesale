import RequestsForm from './RequestsForm';
import RequestsList from './RequestsList';

export default function RequestsPage() {
  return (
    <div className="mx-auto max-w-7xl px-6">
      <RequestsList />
      <RequestsForm />
    </div>
  );
}
