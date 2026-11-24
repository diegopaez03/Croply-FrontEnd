import { useQuery } from '@tanstack/react-query';
import { dashboardAdminCroplyService } from '@/services/dashboardAdminCroply.service';

export const useDashboardAdminCroplyQuery = () => {
  return useQuery({
    queryKey: ['admin-croply', 'tablero-global'],
    queryFn: () => dashboardAdminCroplyService.getTableroGlobal(),
  });
};
