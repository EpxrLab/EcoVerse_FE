import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// TODO: Replace with real API calls when backend is ready
// import api from '@/services/api';

// Auth route paths (must match App.jsx)
// /auth/partnership        → login
// /auth/partnership/register
// /auth/partnership/pending
// /auth/partnership/rejected

export function usePartnership() {
  const navigate = useNavigate();
  const [partnershipInfo, setPartnershipInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // TODO: Call API to verify token/session, e.g.:
        // const { data: session } = await api.get('/auth/session');
        // if (!session?.user) { navigate('/auth/partnership'); return; }

        // TODO: Call API to get partnership registration info, e.g.:
        // const { data: registration } = await api.get('/partnership/me');
        // if (!registration) { navigate('/auth/partnership/register'); return; }
        // if (registration.status === 'pending')  { navigate('/auth/partnership/pending'); return; }
        // if (registration.status === 'rejected') { navigate('/auth/partnership/rejected'); return; }
        // setPartnershipInfo(registration);

        // Temporary: skip auth check, use mock data for development
        setPartnershipInfo({
          organization_name: 'Đối tác Demo',
          partnership_type: 'sponsor',
          status: 'approved',
        });
      } catch (error) {
        console.error('Auth check error:', error);
        navigate('/auth/partnership');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      // TODO: Call API logout endpoint, e.g.:
      // await api.post('/auth/logout');

      // Clear local auth state (token, etc.) here if needed
    } catch (error) {
      console.error('Logout error:', error);
    }
    navigate('/auth/partnership');
  };

  const getPartnershipTypeLabel = (type) => {
    const types = {
      'sponsor': 'Nhà tài trợ',
      'ngo': 'Tổ chức phi chính phủ',
      'media': 'Truyền thông',
      'technology': 'Công nghệ',
      'education': 'Giáo dục',
      'other': 'Khác',
    };
    return types[type] || type;
  };

  return {
    partnershipInfo,
    isLoading,
    handleLogout,
    getPartnershipTypeLabel,
  };
}