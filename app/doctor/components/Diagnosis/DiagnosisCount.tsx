export default function DiagnosisCount({ count }: { count: number }) {
  return (
    <div className="bg-green-500 p-4 rounded-lg mb-4 text-white flex items-center justify-between shadow-md gap-8">
      <h3 className="text-lg font-semibold">Total Patients</h3>
      <span className="text-2xl font-bold text-white-400">{count}</span>
    </div>
  );
}