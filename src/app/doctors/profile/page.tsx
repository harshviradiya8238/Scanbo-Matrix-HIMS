import { Suspense } from 'react';
import DoctorProfilePage from '@/src/screens/doctors/DoctorProfilePage';

export default function Page() {
  return (
    <Suspense>
      <DoctorProfilePage />
    </Suspense>
  );
}
