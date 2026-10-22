"use client";

import { Modal, Avatar, Tag, Descriptions, Empty } from "antd";
import dayjs from "dayjs";
import { useLanguage } from "@/context/LanguageContext";

export default function VendorOwnTxnDetailsModal({
  open,
  setOpen,
  transaction,
}) {
  const { t } = useLanguage();
  const txn = transaction;
  const vendor = txn?.vendor;
  const paidBy = txn?.paidBy;

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <span>{t("transaction.paymentDetails")}</span>
          {txn?.id && (
            <Tag color="blue" className="!m-0 font-mono">
              {txn.id}
            </Tag>
          )}
        </div>
      }
      open={open}
      onCancel={() => setOpen(false)}
      footer={null}
      centered
      width={560}
      destroyOnClose
    >
      {!txn ? (
        <Empty description={t("transaction.noData")} />
      ) : (
        <div className="space-y-5">
          {/* Amount highlight */}
          <div className="rounded-xl bg-emerald-50 p-4 text-center">
            <p className="text-sm text-slate-500">{t("transaction.amountReceived")}</p>
            <p className="text-3xl font-bold text-emerald-600">
              ${Number(txn.amount ?? 0).toFixed(2)}
            </p>
          </div>

          {/* Vendor (you) */}
          {vendor && (
            <div>
              <h4 className="mb-2 text-sm font-semibold text-slate-500">
                {t("transaction.vendor")}
              </h4>
              <div className="flex items-center gap-3 rounded-xl border p-3">
                <Avatar size={48} src={vendor.profileAvatar}>
                  {vendor.name?.[0]}
                </Avatar>
                <div>
                  <p className="font-semibold">{vendor.name}</p>
                  <p className="text-sm text-slate-500">{vendor.email}</p>
                  <Tag color="blue" className="mt-1">
                    {vendor.id}
                  </Tag>
                </div>
              </div>
            </div>
          )}

          {/* Paid by admin */}
          {paidBy && (
            <div>
              <h4 className="mb-2 text-sm font-semibold text-slate-500">
                {t("transaction.paidBy")}
              </h4>
              <div className="flex items-center gap-3 rounded-xl border p-3">
                <Avatar size={48} src={paidBy.profileAvatar}>
                  {paidBy.name?.[0]}
                </Avatar>
                <div>
                  <p className="font-semibold">{paidBy.name}</p>
                  <p className="text-sm text-slate-500">{paidBy.email}</p>
                  <Tag className="mt-1 capitalize">{paidBy.role}</Tag>
                </div>
              </div>
            </div>
          )}

          <Descriptions bordered size="small" column={1}>
            <Descriptions.Item label={t("transaction.transactionId")}>
              <span className="font-mono">{txn.id}</span>
            </Descriptions.Item>
            <Descriptions.Item label={t("transaction.amount")}>
              ${Number(txn.amount ?? 0).toFixed(2)}
            </Descriptions.Item>
            <Descriptions.Item label={t("transaction.note")}>
              {txn.note || "—"}
            </Descriptions.Item>
            <Descriptions.Item label={t("transaction.date")}>
              {txn.createdAt
                ? dayjs(txn.createdAt).format("DD MMM YYYY, hh:mm A")
                : "—"}
            </Descriptions.Item>
          </Descriptions>
        </div>
      )}
    </Modal>
  );
}
