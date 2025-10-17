import AppointmentFormComponent from '../components/AppointmentForm';

export default function AppointmentPage({setActiveTab }: { setActiveTab?: (tab: string) => void }) {
  return (
    <div >
      <AppointmentFormComponent />
    </div>
  );
}
