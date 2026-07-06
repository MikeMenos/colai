export type UploadSide = "front" | "back";

export type SectionStatus = "draft" | "submitting" | "success" | "error";

export type MassUploadSection = {
  id: string;
  frontFile: File | null;
  backFile: File | null;
  status: SectionStatus;
  message: string | null;
};

export type MassUploadPayload = {
  catid: 4;
  typeid: "eopyy";
  sellercode: string;
  orders: {
    files: {
      base64file: string;
      base64filename: string;
    }[];
  }[];
};

export type LocalFilePickerButtonProps = {
  id: string;
  disabled: boolean;
  ariaLabel: string;
  onFileChange: (file: File) => void;
};

export type PageUploadBoxProps = {
  id: string;
  title: string;
  file: File | null;
  disabled: boolean;
  onFileChange: (file: File) => void;
  onFileRemove: () => void;
};
