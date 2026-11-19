"use client";

import { useGetSingleOrderDetailsQuery } from "@/redux/api/orderApi";
import {
  Modal,
  Spin,
  Tag,
  Descriptions,
  Avatar,
  Image,
  Divider,
  Steps,
  Empty,
  Skeleton,
} from "antd";
import dayjs from "dayjs";
import { useMemo } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Polyline,
} from "@react-google-maps/api";
import { useLanguage } from "@/context/LanguageContext";
import { deliveryStep, statusColor, statusLabel } from "@/utils/orderStatus";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const formatDate = (d) => (d ? dayjs(d).format("DD MMM YYYY, hh:mm A") : "—");

const getDeliveryCurrentStep = (order) => deliveryStep(order?.status);

function MapSection({ pickup, destination }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY || "",
  });

  const pickupPos = useMemo(() => {
    if (!pickup?.coordinates?.length) return null;
    return { lat: pickup.coordinates[1], lng: pickup.coordinates[0] };
  }, [pickup]);

  const destPos = useMemo(() => {
    if (!destination?.coordinates?.length) return null;
    return {
      lat: destination.coordinates[1],
      lng: destination.coordinates[0],
    };
  }, [destination]);

  const center = pickupPos || destPos || { lat: 23.78, lng: 90.4 };

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="flex h-[280px] items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-500">
        Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex h-[280px] items-center justify-center rounded-xl bg-slate-50">
        <Spin />
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={{ width: "100%", height: "280px", borderRadius: 12 }}
      center={center}
      zoom={12}
      options={{
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
      }}
    >
      {pickupPos && (
        <Marker
          position={pickupPos}
          label={{ text: "P", color: "white", fontWeight: "bold" }}
          title={`Pickup: ${pickup?.address || ""}`}
        />
      )}
      {destPos && (
        <Marker
          position={destPos}
          label={{ text: "D", color: "white", fontWeight: "bold" }}
          title={`Destination: ${destination?.address || ""}`}
        />
      )}
      {pickupPos && destPos && (
        <Polyline
          path={[pickupPos, destPos]}
          options={{
            strokeColor: "#1B70A6",
            strokeOpacity: 0.8,
            strokeWeight: 3,
          }}
        />
      )}
    </GoogleMap>
  );
}

export default function OrderDetailsModal({ open, setOpen, orderId }) {
  const { t } = useLanguage();
  const { data, isLoading, isFetching } = useGetSingleOrderDetailsQuery(
    orderId,
    { skip: !orderId || !open },
  );

  const order = data?.data;

  const formatStatus = (s) => (s ? statusLabel(s, t) : t("common.na"));

  // Delivery job steps
  const DELIVERY_STEPS = [
    { key: "assigned", title: t("orders.stepAssigned") },
    { key: "picked_up", title: t("orders.stepPickedUp") },
    { key: "on_the_way", title: t("orders.stepOnTheWay") },
    { key: "delivered", title: t("orders.stepDelivered") },
  ];

  // Order timeline steps
  const ORDER_TIMELINE = [
    { key: "createdAt", title: t("orders.timelinePlaced"), field: "createdAt" },
    { key: "confirmedAt", title: t("orders.timelineConfirmed"), field: "confirmedAt" },
    { key: "processedAt", title: t("orders.timelineProcessing"), field: "processedAt" },
    { key: "riderAssignedAt", title: t("orders.timelineRiderAssigned"), field: "riderAssignedAt" },
    { key: "pickedUpAt", title: t("orders.timelinePickedUp"), field: "pickedUpAt" },
    { key: "onTheWayAt", title: t("orders.timelineOnTheWay"), field: "onTheWayAt" },
    { key: "deliveredAt", title: t("orders.timelineDelivered"), field: "deliveredAt" },
  ];

  return (
    <Modal
      title={
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold">{t("orders.orderDetails")}</span>
          {order?.id && (
            <Tag color="blue" className="!m-0">
              {order.id}
            </Tag>
          )}
        </div>
      }
      open={open}
      onCancel={() => setOpen(false)}
      footer={null}
      centered
      width={1200}
      destroyOnClose
      styles={{
        body: { maxHeight: "78vh", overflowY: "auto", paddingTop: 12 },
      }}
    >
      {isLoading || isFetching ? (
        <div className="space-y-4 py-2">
          <Skeleton active paragraph={{ rows: 2 }} />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Skeleton.Input active block style={{ height: 90 }} />
            <Skeleton.Input active block style={{ height: 90 }} />
          </div>
          <Skeleton active paragraph={{ rows: 4 }} />
        </div>
      ) : !order ? (
        <Empty description={t("orders.orderNotFound")} />
      ) : (
        <div className="space-y-6">
          {/* ========== TOP STATUS + AMOUNTS ========== */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-4">
            <div className="flex flex-wrap gap-2">
              <Tag
                color={statusColor(order.status)}
                className="!text-sm"
              >
                {formatStatus(order.status)}
              </Tag>
              <Tag color={order.paymentStatus === "paid" ? "green" : "orange"}>
                {t("orders.payment")}: {order.paymentStatus?.toUpperCase()}
              </Tag>
              <Tag>{order.deliveryType || t("orders.regularDelivery")}</Tag>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-slate-800">
                EGP {order.totalAmount}
              </p>
              <p className="text-xs text-slate-500">
                {t("orders.items")} EGP {order.amount} + {t("orders.delivery2")} EGP {order.deliveryCharge}
              </p>
            </div>
          </div>

          {/* ========== CUSTOMER & VENDOR ========== */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Customer */}
            <div className="rounded-xl border p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {t("orders.customer")}
              </p>
              <div className="flex items-center gap-3">
                <Avatar size={48} src={order.user?.profileAvatar}>
                  {order.user?.name?.[0]}
                </Avatar>
                <div>
                  <p className="font-semibold">{order.user?.name || t("common.na")}</p>
                  <p className="text-sm text-slate-500">{order.user?.email}</p>
                  <p className="text-sm text-slate-500">
                    {order.user?.phone || t("orders.noPhone")}
                  </p>
                </div>
              </div>
            </div>

            {/* Vendor / Author */}
            <div className="rounded-xl border p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {t("orders.vendor")}
              </p>
              <div className="flex items-center gap-3">
                <Avatar size={48} src={order.author?.profileAvatar}>
                  {order.author?.name?.[0]}
                </Avatar>
                <div>
                  <p className="font-semibold">{order.author?.name || t("common.na")}</p>
                  <p className="text-sm text-slate-500">
                    {order.author?.email}
                  </p>
                  <p className="text-sm text-slate-500">
                    {order.author?.phone || t("orders.noPhone")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ========== ITEMS ========== */}
          <div>
            <h3 className="mb-3 text-base font-semibold">{t("orders.orderItems")}</h3>
            <div className="space-y-3">
              {order.items?.map((item) => (
                <div
                  key={item._id}
                  className="flex gap-4 rounded-xl border p-3"
                >
                  <Image
                    src={item.product?.banner}
                    alt={item.product?.title}
                    width={72}
                    height={72}
                    className="rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{item.product?.title}</p>
                    <div className="mt-1 flex flex-wrap gap-3 text-sm text-slate-500">
                      {item.size && <span>{t("orders.size")}: {item.size}</span>}
                      {item.color && (
                        <span className="flex items-center gap-1">
                          {t("orders.color")}:
                          <span
                            className="inline-block h-3 w-3 rounded-full border"
                            style={{ backgroundColor: item.color.code }}
                          />
                          {item.color.name}
                        </span>
                      )}
                      <span>{t("orders.qty")}: {item.quantity}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">EGP {item.totalPrice}</p>
                    {item.product?.discountPrice < item.product?.price && (
                      <p className="text-xs text-slate-400 line-through">
                        EGP {item.product.price}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ========== BILLING ========== */}
          {order.billingDetails && (
            <div>
              <h3 className="mb-3 text-base font-semibold">
                {t("orders.billingAddress")}
              </h3>
              <Descriptions bordered size="small" column={2}>
                <Descriptions.Item label={t("orders.name")}>
                  {order.billingDetails.name}
                </Descriptions.Item>
                <Descriptions.Item label={t("orders.phone")}>
                  {order.billingDetails.phoneNumber}
                </Descriptions.Item>
                <Descriptions.Item label={t("orders.email")}>
                  {order.billingDetails.email}
                </Descriptions.Item>
                <Descriptions.Item label={t("orders.city")}>
                  {order.billingDetails.city}, {order.billingDetails.country}
                </Descriptions.Item>
                <Descriptions.Item label={t("orders.address")} span={2}>
                  {order.billingDetails.address}
                </Descriptions.Item>
                <Descriptions.Item label={t("orders.building")}>
                  {order.billingDetails.buildingNo || "—"}
                </Descriptions.Item>
                <Descriptions.Item label={t("orders.floorApt")}>
                  {order.billingDetails.floorNo || "—"} /{" "}
                  {order.billingDetails.apartment || "—"}
                </Descriptions.Item>
                {order.billingDetails.note && (
                  <Descriptions.Item label={t("orders.note")} span={2}>
                    {order.billingDetails.note}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </div>
          )}

          {/* ========== PAYMENT & META ========== */}
          <div>
            <h3 className="mb-3 text-base font-semibold">{t("orders.paymentMeta")}</h3>
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label={t("transaction.transactionId")}>
                {order.transactionId || "—"}
              </Descriptions.Item>
              <Descriptions.Item label={t("orders.paymentStatus")}>
                <Tag
                  color={order.paymentStatus === "paid" ? "green" : "orange"}
                >
                  {order.paymentStatus}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label={t("orders.subtotal")}>
                EGP {order.amount}
              </Descriptions.Item>
              <Descriptions.Item label={t("orders.deliveryCharge")}>
                EGP {order.deliveryCharge}
              </Descriptions.Item>
              <Descriptions.Item label={t("orders.coinDiscount")}>
                EGP {order.coinDiscount || 0}
              </Descriptions.Item>
              <Descriptions.Item label={t("orders.voucherDiscount")}>
                EGP {order.voucherDiscount || 0}
              </Descriptions.Item>
              <Descriptions.Item label={t("orders.total")}>
                EGP {order.totalAmount}
              </Descriptions.Item>
              <Descriptions.Item label={t("orders.created")}>
                {formatDate(order.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label={t("orders.updated")}>
                {formatDate(order.updatedAt)}
              </Descriptions.Item>
            </Descriptions>
          </div>

          {/* ========== RIDER ========== */}
          {order.rider && (
            <div>
              <h3 className="mb-3 text-base font-semibold">{t("orders.rider")}</h3>
              <div className="flex items-center gap-4 rounded-xl border p-4">
                <Avatar size={52} src={order.rider.profileAvatar}>
                  {order.rider.name?.[0]}
                </Avatar>
                <div>
                  <p className="font-semibold">{order.rider.name}</p>
                  <p className="text-sm text-slate-500">
                    {order.rider.phone || t("orders.noPhone")} · {t("orders.vehicle")}:{" "}
                    {order.rider.vehicle || "—"}
                  </p>
                  <p className="text-sm text-slate-500">
                    {t("orders.rating")}: {order.rider.avgRating ?? 0} (
                    {order.rider.ratingCount ?? 0} {t("orders.reviews")})
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========== MAP + LOCATIONS ========== */}
          {order.deliveryJob && (
            <div>
              <h3 className="mb-3 text-base font-semibold">
                {t("orders.deliveryRoute")}
                {order.deliveryJob.distance != null && (
                  <span className="ml-2 text-sm font-normal text-slate-500">
                    ({order.deliveryJob.distance} km)
                  </span>
                )}
              </h3>

              <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
                  <p className="text-xs font-semibold uppercase text-blue-600">
                    {t("orders.pickup")}
                  </p>
                  <p className="mt-1 text-sm font-medium">
                    {order.deliveryJob.pickup?.address || "—"}
                  </p>
                </div>
                <div className="rounded-lg border border-green-100 bg-green-50 p-3">
                  <p className="text-xs font-semibold uppercase text-green-600">
                    {t("orders.destination")}
                  </p>
                  <p className="mt-1 text-sm font-medium">
                    {order.deliveryJob.destination?.address ||
                      order.billingDetails?.address ||
                      "—"}
                  </p>
                </div>
              </div>

              <MapSection
                pickup={order.deliveryJob.pickup}
                destination={order.deliveryJob.destination}
              />
            </div>
          )}

          {/* ========== DELIVERY STEPPER ========== */}
          <div>
            <h3 className="mb-4 text-base font-semibold">{t("orders.deliveryProgress")}</h3>
            <Steps
              current={getDeliveryCurrentStep(order)}
              size="small"
              items={DELIVERY_STEPS.map((s) => ({ title: s.title }))}
            />
          </div>

          <Divider className="!my-2" />

          {/* ========== ORDER TIMELINE ========== */}
          <div>
            <h3 className="mb-4 text-base font-semibold">{t("orders.orderTimeline")}</h3>
            <Steps
              direction="vertical"
              size="small"
              current={
                order.status === "cancelled"
                  ? -1
                  : ORDER_TIMELINE.filter((step) => order[step.field]).length - 1
              }
              items={ORDER_TIMELINE.map((step) => ({
                title: step.title,
                description: formatDate(order[step.field]),
                status: order[step.field]
                  ? "finish"
                  : order.status === "cancelled"
                    ? "error"
                    : "wait",
              }))}
            />
            {order.cancelledAt && (
              <p className="mt-2 text-sm text-red-500">
                {t("orders.cancelledAtLabel")}: {formatDate(order.cancelledAt)}
              </p>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
