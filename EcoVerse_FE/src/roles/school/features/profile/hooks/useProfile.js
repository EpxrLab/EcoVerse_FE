import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { profileService } from '../services/profile.service';
import { uploadFile, getProvinces, getWards } from '@/features/auth/services';

export function useProfile() {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await profileService.getProfile();
      const resStatus = response?.data?.status;
      if (response?.data && (resStatus == 200 || resStatus == 0 || resStatus === "200" || resStatus === "0")) {
        setProfile(response.data.data);
      } else {
        toast.error(response?.data?.message || 'Lỗi khi tải thông tin hồ sơ.');
      }
    } catch (error) {
      console.error("Error fetching school profile:", error);
      toast.error('Có lỗi xảy ra khi tải thông tin hồ sơ.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data) => {
    setIsUpdating(true);
    try {
      const response = await profileService.updateProfile(data);
      const resStatus = response?.data?.status;
      if (response?.data && (resStatus == 200 || resStatus == 0 || resStatus === "200" || resStatus === "0")) {
        toast.success("Cập nhật thông tin thành công!");
        setProfile(response.data.data);
        return { success: true, data: response.data.data };
      } else {
        toast.error(response?.data?.message || "Cập nhật thất bại.");
        return { success: false, error: response?.data?.message };
      }
    } catch (error) {
      console.error("Error updating school profile:", error);
      toast.error("Có lỗi xảy ra khi cập nhật hồ sơ.");
      return { success: false, error: error.message };
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const handleFileUpload = async (file) => {
    if (!file) return null;
    setIsUploadingFile(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await uploadFile(formData);
      const status = response?.status;
      if (status == 200 || status == 0 || status === "200" || status === "0") {
        return response?.data?.url || response?.url;
      }
      toast.error("Upload file thất bại.");
      return null;
    } catch (error) {
      toast.error("Lỗi khi upload file.");
      return null;
    } finally {
      setIsUploadingFile(false);
    }
  };

  const fetchProvinces = useCallback(async () => {
    try {
      const data = await getProvinces();
      if (data) setProvinces(data);
    } catch (error) {
      console.error("Error fetching provinces:", error);
    }
  }, []);

  const fetchWards = useCallback(async () => {
    try {
      const data = await getWards();
      if (data) setWards(data);
    } catch (error) {
      console.error("Error fetching wards:", error);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchProvinces();
    fetchWards();
  }, [fetchProfile, fetchProvinces, fetchWards]);

  return {
    profile,
    isLoading,
    isUpdating,
    isUploadingFile,
    provinces,
    wards,
    fetchProfile,
    updateProfile,
    handleFileUpload,
  };
}
