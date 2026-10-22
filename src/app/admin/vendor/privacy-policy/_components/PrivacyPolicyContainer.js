"use client";

import { Empty, Card, Skeleton } from "antd";
import { Shield } from "lucide-react";
import { useGetPrivecyQuery } from "@/redux/api/settingsApi";
import { useLanguage } from "@/context/LanguageContext";
import SafeHtml from "@/components/SafeHtml/SafeHtml";

export default function PrivacyPolicyContainer() {
  const { t } = useLanguage();
  const { data, isLoading } = useGetPrivecyQuery({
    key: "vendorPrivacyAndPolicy",
  });

  const value = data?.data?.value;

  if (isLoading) {
    return (
      <section className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center gap-3">
          <Skeleton.Avatar active shape="square" size={48} />
          <div className="flex-1 space-y-2">
            <Skeleton.Input active size="small" style={{ width: 180 }} />
            <Skeleton.Input active size="small" style={{ width: 260 }} />
          </div>
        </div>
        <Card className="border-0 shadow-md">
          <Skeleton active paragraph={{ rows: 8 }} />
        </Card>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50">
          <Shield className="text-emerald-600" size={24} />
        </div>
        <div>
          <h3 className="text-2xl font-semibold text-slate-800">
            {t("settings.privacyPolicy")}
          </h3>
          <p className="text-sm text-slate-500">
            {t("settings.privacyPolicySubtitle")}
          </p>
        </div>
      </div>

      <Card className="border-0 shadow-md">
        {!value ? (
          <Empty description={t("settings.noPolicyAvailable")} />
        ) : (
          <SafeHtml
            html={value}
            className="prose prose-slate prose-headings:font-semibold prose-headings:text-slate-800 prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-slate-600 prose-a:text-blue-600 max-w-none"
          />
        )}
      </Card>
    </section>
  );
}
