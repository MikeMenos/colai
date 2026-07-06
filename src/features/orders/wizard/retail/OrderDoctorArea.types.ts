export type SuggestedDoctorSnapshot = {
  has_suggested_doctor: number;
  hasOtherSystinonIatroBool: boolean;
  doctorSuggested_amka: string;
  doctorSuggested_name: string;
  doctorSuggested_afm: string;
  doctorSuggested_domi: string;
  doctorSuggested_tel: string;
  doctorSuggested_ErpGID: string;
};

export type OrderDoctorAreaProps = {
  errors?: Record<string, string | boolean>;
  clearError?: (field: string) => void;
};
