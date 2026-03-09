import { redirect } from 'next/navigation';

export default function ClinicalFlowOverviewPage() {
  redirect('/appointments/queue');
}
