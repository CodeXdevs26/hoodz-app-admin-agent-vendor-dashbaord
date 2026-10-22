"use client";

import { useEffect, useState } from "react";
import {
  Table,
  Input,
  Image,
  Tag,
  Dropdown,
  ConfigProvider,
  Tooltip,
} from "antd";
import { Search, Eye, MoreVertical, Filter } from "lucide-react";
import {
  useGetVendorOrdersQuery,
  useMakeOrderConfirmMutation,
  useMakeOrderProccessMutation,
  useOrderStatusMutation,
} from "@/redux/api/orderApi";
import dayjs from "dayjs";
import CustomConfirm from "@/components/CustomConfirm/CustomConfirm";
import toast from "react-hot-toast";
import OrderDetailsModal from "./OrderDetailsModal";
import { useSocket } from "@/context/SocketContextApi";
import { useLanguage } from "@/context/LanguageContext";
import TableSkeleton from "@/components/Skeletons/TableSkeleton";

export default function OrderTableContainer({ limit = 10 }) {
  const { t } = useLanguage();
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const { socket } = useSocket();

  const { data, isLoading, refetch } = useGetVendorOrdersQuery({
    page: currentPage,
    limit,
    searchText,
  });

  const [makeConfirm, { isLoading: confirming }] =
    useMakeOrderConfirmMutation();
  const [makeProcess, { isLoading: processing }] =
    useMakeOrderProccessMutation();
  const [orderStatus] = useOrderStatusMutation();

  const statusColors = {
    pending: "orange",
    confirmed: "blue",
    processing: "cyan",
    rider_assigned: "purple",
    picked_up: "geekblue",
    on_the_way: "gold",
    delivered: "green",
    cancelled: "red",
  };

  const statusLabels = {
    pending: t("orders.statusPending"),
    confirmed: t("orders.statusConfirmed"),
    processing: t("orders.statusProcessing"),
    rider_assigned: t("orders.statusRiderAssigned"),
    picked_up: t("orders.statusPickedUp"),
    on_the_way: t("orders.statusOnTheWay"),
    delivered: t("orders.statusDelivered"),
    cancelled: t("orders.statusCancelled"),
  };

  const formatStatus = (status) => statusLabels[status] || status;

  // 🔔 Realtime: order update → refetch list
  useEffect(() => {
    if (!socket) return;

    const onOrderUpdated = () => {
      refetch();
    };

    socket.on("order:updated", onOrderUpdated);
    return () => {
      socket.off("order:updated", onOrderUpdated);
    };
  }, [socket, refetch]);

  const handleConfirm = async (id) => {
    try {
      const res = await makeConfirm({ id }).unwrap();
      toast.success(res?.message || t("orders.orderConfirmed"));
    } catch (error) {
      toast.error(error?.data?.message || t("orders.orderConfirmFailed"));
    }
  };

  const handleProcess = async (id) => {
    try {
      const res = await makeProcess({ id }).unwrap();
      toast.success(res?.message || t("orders.orderProcessing"));
    } catch (error) {
      toast.error(error?.data?.message || t("orders.orderProcessFailed"));
    }
  };

  const handleCancel = async (id) => {
    try {
      const res = await orderStatus({ id, status: "cancelled" }).unwrap();
      toast.success(res?.message || t("orders.orderCancelled"));
    } catch (error) {
      toast.error(error?.data?.message || t("orders.orderCancelFailed"));
    }
  };

  const getStatusMenuItems = (record) => {
    const items = [];
    const { status, id } = record;

    if (status === "pending") {
      items.push({
        key: "confirmed",
        label: (
          <CustomConfirm
            title={t("orders.confirmOrderTitle")}
            description={t("orders.confirmOrderDesc")}
            onConfirm={() => handleConfirm(id)}
          >
            <span className="block w-full">{t("orders.markAsConfirmed")}</span>
          </CustomConfirm>
        ),
      });
    }

    if (status === "confirmed") {
      items.push({
        key: "processing",
        label: (
          <CustomConfirm
            title={t("orders.processOrderTitle")}
            description={t("orders.processOrderDesc")}
            onConfirm={() => handleProcess(id)}
          >
            <span className="block w-full">{t("orders.markAsProcessing")}</span>
          </CustomConfirm>
        ),
      });
    }

    if (status !== "delivered" && status !== "cancelled") {
      items.push({
        key: "cancelled",
        danger: true,
        label: (
          <CustomConfirm
            title={t("orders.cancelOrderTitle")}
            description={t("orders.cancelOrderDesc")}
            onConfirm={() => handleCancel(id)}
          >
            <span className="block w-full text-red-500">
              {t("orders.cancelOrder")}
            </span>
          </CustomConfirm>
        ),
      });
    }

    return items;
  };

  const tableData = data?.data?.map((order, index) => ({
    key: order._id || index,
    id: order._id,
    orderId: order.id,
    product: order.items?.[0]?.product?.title || t("common.na"),
    banner: order.items?.[0]?.product?.banner,
    color: order.items?.[0]?.color,
    size: order.items?.[0]?.size,
    totalItem: order.totalItem,
    totalAmount: order.totalAmount,
    deliveryCharge: order.deliveryCharge,
    status: order.status,
    paymentStatus: order.paymentStatus,
    transactionId: order.transactionId,
    deliveryType: order.deliveryType,
    createdAt: order.createdAt,
  }));

  const columns = [
    {
      title: t("orders.orderId"),
      dataIndex: "orderId",
      render: (value) => (
        <span className="font-medium text-[#1B70A6]">{value}</span>
      ),
    },
    {
      title: t("orders.product"),
      dataIndex: "product",
      render: (value, record) => (
        <div className="flex items-center gap-3">
          {record.banner ? (
            <Image
              src={record.banner}
              alt="product"
              width={48}
              height={48}
              className="rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
              {t("common.na")}
            </div>
          )}
          <div>
            <p className="max-w-[220px] truncate font-medium">{value}</p>
            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
              {record.size && (
                <span>
                  {t("orders.size")}: {record.size}
                </span>
              )}
              {record.color && (
                <span className="flex items-center gap-1">
                  <span
                    className="inline-block h-3 w-3 rounded-full border"
                    style={{ backgroundColor: record.color.code }}
                  />
                  {record.color.name}
                </span>
              )}
            </div>
            {record.totalItem > 1 && (
              <p className="text-xs text-gray-400">
                +{record.totalItem - 1} {t("orders.moreItems")}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      title: t("orders.amount"),
      dataIndex: "totalAmount",
      render: (value, record) => (
        <div>
          <p className="font-semibold">${value}</p>
          <p className="text-xs text-gray-400">
            {t("orders.delivery")}: ${record.deliveryCharge}
          </p>
        </div>
      ),
    },
    {
      title: t("orders.payment"),
      dataIndex: "paymentStatus",
      render: (value) => (
        <Tag color={value === "paid" ? "green" : "orange"}>
          {value?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: t("orders.status"),
      dataIndex: "status",
      filters: [
        { text: t("orders.statusPending"), value: "pending" },
        { text: t("orders.statusConfirmed"), value: "confirmed" },
        { text: t("orders.statusProcessing"), value: "processing" },
        { text: t("orders.statusRiderAssigned"), value: "rider_assigned" },
        { text: t("orders.statusPickedUp"), value: "picked_up" },
        { text: t("orders.statusOnTheWay"), value: "on_the_way" },
        { text: t("orders.statusDelivered"), value: "delivered" },
        { text: t("orders.statusCancelled"), value: "cancelled" },
      ],
      filterIcon: (filtered) => (
        <Filter size={16} color={filtered ? "#1B70A6" : "#000"} />
      ),
      onFilter: (value, record) => record.status === value,
      render: (value) => (
        <Tag color={statusColors[value] || "default"}>
          {formatStatus(value)}
        </Tag>
      ),
    },
    {
      title: t("orders.date"),
      dataIndex: "createdAt",
      render: (value) =>
        value ? dayjs(value).format("DD MMM YYYY, hh:mm A") : t("common.na"),
    },
    {
      title: t("orders.action"),
      key: "action",
      fixed: "right",
      width: 100,
      render: (_, record) => {
        const menuItems = getStatusMenuItems(record);

        return (
          <div className="flex items-center gap-3">
            <Tooltip title={t("common.viewDetails")}>
              <button
                onClick={() => {
                  setSelectedOrderId(record.id);
                  setDetailsOpen(true);
                }}
              >
                <Eye size={20} color="#1B70A6" />
              </button>
            </Tooltip>

            {menuItems.length > 0 && (
              <Dropdown
                menu={{ items: menuItems }}
                trigger={["click"]}
                placement="bottomRight"
              >
                <button>
                  <MoreVertical size={20} color="#64748b" />
                </button>
              </Dropdown>
            )}
          </div>
        );
      },
    },
  ];

  const firstLoad = isLoading && !data;

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1B70A6",
        },
      }}
    >
      <div className="mb-4 ml-auto w-full max-w-sm">
        <Input
          placeholder={t("orders.searchPlaceholder")}
          prefix={<Search size={18} className="mr-1 text-gray-400" />}
          className="h-11 !rounded-lg"
          allowClear
          onChange={(e) => {
            setSearchText(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {firstLoad ? (
        <TableSkeleton columns={7} />
      ) : (
        <Table
          columns={columns}
          dataSource={tableData}
          loading={isLoading || confirming || processing}
          scroll={{ x: "max-content" }}
          pagination={{
            current: currentPage,
            pageSize: limit,
            total: data?.meta?.total || 0,
            onChange: (page) => setCurrentPage(page),
            showTotal: (total) => t("orders.totalOrders", { count: total }),
          }}
        />
      )}

      <OrderDetailsModal
        open={detailsOpen}
        setOpen={setDetailsOpen}
        orderId={selectedOrderId}
      />
    </ConfigProvider>
  );
}
