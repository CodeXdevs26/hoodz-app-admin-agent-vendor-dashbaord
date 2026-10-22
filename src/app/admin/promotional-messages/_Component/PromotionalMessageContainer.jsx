"use client";

import { Form, Input, Button, Card } from "antd";
import { useSendPromotionalMessageMutation } from "@/redux/api/notificationApi";
import toast from "react-hot-toast";
import { Send, Megaphone } from "lucide-react";

const { TextArea } = Input;

export default function PromotionalMessageContainer() {
  const [form] = Form.useForm();
  const [sendPromotionalMessage, { isLoading }] =
    useSendPromotionalMessageMutation();

  const handleSubmit = async (values) => {
    try {
      const payload = {
        body: values.body?.trim(),
        description: values.description?.trim(),
        messageArabic: values.messageArabic?.trim(),
        descriptionArabic: values.descriptionArabic?.trim(),
      };

      const res = await sendPromotionalMessage(payload).unwrap();
      toast.success(res?.message || "Promotional message sent successfully");
      form.resetFields();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to send message");
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50">
          <Megaphone className="text-[#F75908]" size={24} />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-800">
            Promotional Message
          </h2>
          <p className="text-sm text-slate-500">
            Send a push notification to all users
          </p>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          size="large"
          requiredMark={false}
        >
          {/* English Title */}
          <Form.Item
            name="body"
            label="Title / Body"
            rules={[
              { required: true, message: "Please enter message title" },
              { min: 3, message: "At least 3 characters" },
            ]}
          >
            <Input
              placeholder="Eid Sale is live!"
              className="!rounded-lg"
              maxLength={100}
              showCount
            />
          </Form.Item>

          {/* Arabic Title */}
          <Form.Item
            name="messageArabic"
            label="Title / Body (Arabic)"
            rules={[
              { required: true, message: "Please enter Arabic message title" },
              { min: 3, message: "At least 3 characters" },
            ]}
          >
            <Input
              placeholder="عرض العيد مباشر!"
              className="!rounded-lg"
              maxLength={100}
              showCount
              dir="rtl"
              style={{ textAlign: "right" }}
            />
          </Form.Item>

          {/* English Description */}
          <Form.Item
            name="description"
            label="Description"
            rules={[
              { required: true, message: "Please enter description" },
              { min: 5, message: "At least 5 characters" },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Up to 50% off on selected products"
              className="!rounded-lg"
              maxLength={300}
              showCount
            />
          </Form.Item>

          {/* Arabic Description */}
          <Form.Item
            name="descriptionArabic"
            label="Description (Arabic)"
            rules={[
              { required: true, message: "Please enter Arabic description" },
              { min: 5, message: "At least 5 characters" },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="خصم يصل إلى 50٪ على منتجات مختارة"
              className="!rounded-lg"
              maxLength={300}
              showCount
              dir="rtl"
              style={{ textAlign: "right" }}
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={isLoading}
            icon={<Send size={18} />}
            className="!h-12 !rounded-xl"
          >
            Send Message
          </Button>
        </Form>
      </Card>
    </div>
  );
}
