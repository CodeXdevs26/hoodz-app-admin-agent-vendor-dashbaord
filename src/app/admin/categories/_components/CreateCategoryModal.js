"use client";

import { useState } from "react";
import { Modal, Form, Input, Upload, Button, Image } from "antd";
import { Upload as UploadIcon } from "lucide-react";
import { useCreateCategoryMutation } from "@/redux/api/categoriesApi";
import useFileUpload from "@/hooks/useFileUpload";
import toast from "react-hot-toast";

export default function CreateCategoryModal({ open, setOpen }) {
  const [form] = Form.useForm();

  // Separate states for EN / AR icons
  const [fileListEn, setFileListEn] = useState([]);
  const [fileListAr, setFileListAr] = useState([]);
  const [preview, setPreview] = useState(null);
  const [previewArabic, setPreviewArabic] = useState(null);

  const [createCategory, { isLoading }] = useCreateCategoryMutation();
  const { uploadSingle, uploading } = useFileUpload();

  const resetAll = () => {
    form.resetFields();
    setFileListEn([]);
    setFileListAr([]);
    setPreview(null);
    setPreviewArabic(null);
  };

  const handleSubmit = async (values) => {
    try {
      if (!fileListEn.length) {
        toast.error("Please upload English category icon");
        return;
      }
      if (!fileListAr.length) {
        toast.error("Please upload Arabic category icon");
        return;
      }

      const iconUrl = await uploadSingle(fileListEn[0]);
      const iconUrlArabic = await uploadSingle(fileListAr[0]);

      if (!iconUrl || !iconUrlArabic) {
        toast.error("Icon upload failed");
        return;
      }

      const payload = {
        title: values.title.trim(),
        titleArabic: values.titleArabic.trim(),
        icon: iconUrl,
        iconArabic: iconUrlArabic,
      };

      const res = await createCategory(payload).unwrap();
      toast.success(res?.message || "Category created successfully");
      resetAll();
      setOpen(false);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to create category");
    }
  };

  const handleCancel = () => {
    resetAll();
    setOpen(false);
  };

  return (
    <Modal
      centered
      open={open}
      onCancel={handleCancel}
      footer={null}
      title="Create Category"
      destroyOnClose
      width={480}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-4"
      >
        {/* English title */}
        <Form.Item
          name="title"
          label="Category Name"
          rules={[
            { required: true, message: "Please enter category name" },
            { min: 2, message: "Name must be at least 2 characters" },
          ]}
        >
          <Input
            size="large"
            placeholder="Enter category name"
            className="!rounded-lg"
          />
        </Form.Item>

        {/* Arabic title — RTL */}
        <Form.Item
          name="titleArabic"
          label="Category Name (Arabic)"
          rules={[
            { required: true, message: "Please enter Arabic category name" },
            { min: 2, message: "Name must be at least 2 characters" },
          ]}
        >
          <Input
            size="large"
            placeholder="أدخل اسم الفئة"
            className="!rounded-lg"
            dir="rtl"
            style={{ textAlign: "right" }}
          />
        </Form.Item>

        {/* English icon */}
        <Form.Item label="Category Icon" required>
          <div className="flex items-center gap-4">
            {preview ? (
              <Image
                src={preview}
                width={80}
                height={80}
                alt="category icon"
                className="rounded-lg object-contain"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-dashed bg-slate-50 text-slate-400">
                No image
              </div>
            )}

            <Upload
              maxCount={1}
              fileList={fileListEn}
              beforeUpload={() => false}
              accept="image/*"
              showUploadList={false}
              onChange={({ fileList: fl }) => {
                setFileListEn(fl);
                if (fl[0]?.originFileObj) {
                  setPreview(URL.createObjectURL(fl[0].originFileObj));
                } else {
                  setPreview(null);
                }
              }}
            >
              <Button icon={<UploadIcon size={16} />}>
                {preview ? "Change Icon" : "Upload Icon"}
              </Button>
            </Upload>
          </div>
        </Form.Item>

        {/* Arabic icon */}
        <Form.Item label="Category Icon (Arabic)" required>
          <div className="flex items-center gap-4">
            {previewArabic ? (
              <Image
                src={previewArabic}
                width={80}
                height={80}
                alt="category icon arabic"
                className="rounded-lg object-contain"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-dashed bg-slate-50 text-slate-400">
                No image
              </div>
            )}

            <Upload
              maxCount={1}
              fileList={fileListAr}
              beforeUpload={() => false}
              accept="image/*"
              showUploadList={false}
              onChange={({ fileList: fl }) => {
                setFileListAr(fl);
                if (fl[0]?.originFileObj) {
                  setPreviewArabic(URL.createObjectURL(fl[0].originFileObj));
                } else {
                  setPreviewArabic(null);
                }
              }}
            >
              <Button icon={<UploadIcon size={16} />}>
                {previewArabic ? "Change Icon" : "Upload Icon"}
              </Button>
            </Upload>
          </div>
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          size="large"
          className="mt-2 w-full"
          loading={uploading || isLoading}
        >
          Submit
        </Button>
      </Form>
    </Modal>
  );
}
