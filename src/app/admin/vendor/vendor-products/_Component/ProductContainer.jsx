"use client";
import { useState } from "react";
import {
  Card,
  Statistic,
  Table,
  Input,
  Tag,
  Image,
  Button,
  ConfigProvider,
  Tooltip,
  Collapse,
} from "antd";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Package,
  DollarSign,
  AlertTriangle,
  XCircle,
  BarChart3,
} from "lucide-react";
import {
  useGetProductsQuery,
  useDeleteProductMutation,
} from "@/redux/api/productApi";
import CustomConfirm from "@/components/CustomConfirm/CustomConfirm";
import ProductDetailsModal from "./ProductDetailsModal";
import CreateProductModal from "./CreateProductModal";
import EditProductModal from "./EditProductModal";
import ProductAnalyticsCards from "./ProductAnalyticsCards";
import toast from "react-hot-toast";
import { useLanguage } from "@/context/LanguageContext";
import StatCardsSkeleton from "@/components/Skeletons/StatCardsSkeleton";
import TableSkeleton from "@/components/Skeletons/TableSkeleton";

export default function ProductContainer({ limit = 10 }) {
  const { t } = useLanguage();
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [stockFilter, setStockFilter] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsId, setDetailsId] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const STOCK_FILTERS = [
    { key: null, label: t("common.all") },
    { key: "inStock", label: t("products.inStock"), color: "green" },
    { key: "low", label: t("products.lowStock"), color: "orange" },
    { key: "outStock", label: t("products.outOfStock"), color: "red" },
  ];

  const { data, isLoading } = useGetProductsQuery({
    page,
    limit,
    searchText,
    ...(stockFilter ? { stockFilter } : {}),
  });

  const [deleteProduct] = useDeleteProductMutation();

  const overview = data?.data?.stats?.overview;
  const analytics = data?.data?.stats?.analytics;
  const products = data?.data?.products || [];

  const handleFilterChange = (key) => {
    setStockFilter(key);
    setPage(1);
  };

  const handleDelete = async (id) => {
    try {
      const res = await deleteProduct(id).unwrap();
      toast.success(res?.message || t("products.deleteSuccess"));
    } catch (e) {
      toast.error(e?.data?.message || t("products.deleteFailed"));
    }
  };

  const columns = [
    {
      title: t("products.product"),
      dataIndex: "title",
      render: (value, record) => (
        <div className="flex items-center gap-3">
          <Image
            alt={value}
            src={record.banner}
            width={48}
            height={48}
            className="rounded-lg object-cover"
          />
          <div>
            <p className="max-w-[220px] truncate font-medium">{value}</p>
            <p className="text-xs text-slate-400">
              {record.category?.title} · {record.brand}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: t("products.type"),
      dataIndex: "inventoryType",
      render: (v) => <Tag className="capitalize">{v?.replace(/_/g, " ")}</Tag>,
    },
    {
      title: t("common.price"),
      render: (_, r) => (
        <div>
          <p className="font-semibold text-emerald-600">${r.discountPrice}</p>
          {r.discount > 0 && (
            <p className="text-xs text-slate-400 line-through">${r.price}</p>
          )}
        </div>
      ),
    },
    {
      title: t("products.stock"),
      dataIndex: "stock",
      render: (v, r) => {
        let color = "green";
        if (!r.inStock || v === 0) color = "red";
        else if (v < 10) color = "orange";
        return <Tag color={color}>{v}</Tag>;
      },
    },
    {
      title: t("products.variants"),
      dataIndex: "variants",
      render: (variants) =>
        variants?.length ? (
          <Tag color="blue">{variants.length} {t("products.variantCount")}</Tag>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        ),
    },
    {
      title: t("products.collection"),
      dataIndex: "collectionType",
      render: (v) => <span className="capitalize">{v}</span>,
    },
    {
      title: t("common.action"),
      width: 120,
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Tooltip title={t("common.view")}>
            <button
              onClick={() => {
                setDetailsId(record._id);
                setDetailsOpen(true);
              }}
            >
              <Eye size={18} color="#1B70A6" />
            </button>
          </Tooltip>
          <Tooltip title={t("common.edit")}>
            <button
              onClick={() => {
                setEditId(record._id);
                setEditOpen(true);
              }}
            >
              <Pencil size={18} color="#64748b" />
            </button>
          </Tooltip>
          <CustomConfirm
            title={t("products.deleteTitle")}
            description={t("products.deleteDesc")}
            onConfirm={() => handleDelete(record._id)}
          >
            <button>
              <Trash2 size={18} color="#ef4444" />
            </button>
          </CustomConfirm>
        </div>
      ),
    },
  ];

  const tableData = products.map((p) => ({ ...p, key: p._id }));
  const firstLoad = isLoading && !data;

  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#1B70A6" } }}>
      {/* Overview stats */}
      {firstLoad ? (
        <div className="mb-6">
          <StatCardsSkeleton count={4} columnsClassName="grid grid-cols-2 gap-4 lg:grid-cols-4" />
        </div>
      ) : (
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            {
              title: t("products.allProducts"),
              value: overview?.allProducts ?? 0,
              icon: <Package className="text-blue-600" size={24} />,
              bg: "bg-blue-50",
              filterKey: null,
            },
            {
              title: t("products.totalValue"),
              value: overview?.totalValue ?? 0,
              prefix: "$",
              icon: <DollarSign className="text-green-600" size={24} />,
              bg: "bg-green-50",
              filterKey: undefined,
            },
            {
              title: t("products.lowStock"),
              value: overview?.lowStock ?? 0,
              icon: <AlertTriangle className="text-orange-600" size={24} />,
              bg: "bg-orange-50",
              filterKey: "low",
            },
            {
              title: t("products.outOfStock"),
              value: overview?.outOfStock ?? 0,
              icon: <XCircle className="text-red-600" size={24} />,
              bg: "bg-red-50",
              filterKey: "outStock",
            },
          ].map((s) => (
            <Card
              key={s.title}
              className={`border-0 shadow-sm transition ${
                s.filterKey !== undefined
                  ? "cursor-pointer hover:ring-2 hover:ring-[#1B70A6]/30"
                  : ""
              } ${
                stockFilter === s.filterKey && s.filterKey !== undefined
                  ? "ring-2 ring-[#1B70A6]"
                  : ""
              }`}
              onClick={() => {
                if (s.filterKey === undefined) return;
                handleFilterChange(
                  stockFilter === s.filterKey ? null : s.filterKey,
                );
              }}
            >
              <div className="flex items-center justify-between">
                <Statistic
                  title={s.title}
                  value={s.value}
                  prefix={s.prefix}
                  valueStyle={{ fontSize: 20, fontWeight: 700 }}
                />
                <div className={`rounded-xl p-2.5 ${s.bg}`}>{s.icon}</div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Analytics — collapsible, default closed */}
      <div className="mb-6">
        <Collapse
          bordered={false}
          className="!bg-transparent"
          items={[
            {
              key: "analytics",
              label: (
                <span className="flex items-center gap-2 font-semibold text-slate-700">
                  <BarChart3 size={18} className="text-[#1B70A6]" />
                  {t("products.productAnalytics")}
                  <span className="text-xs font-normal text-slate-400">
                    ({t("products.analyticsSubtitle")})
                  </span>
                </span>
              ),
              children: <ProductAnalyticsCards analytics={analytics} />,
            },
          ]}
        />
      </div>

      {/* Search + filters + Add */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder={t("products.searchPlaceholder")}
            prefix={<Search size={18} className="text-gray-400" />}
            className="h-11 max-w-sm !rounded-lg"
            allowClear
            onChange={(e) => {
              setSearchText(e.target.value);
              setPage(1);
            }}
          />

          <div className="flex flex-wrap items-center gap-2">
            {STOCK_FILTERS.map((f) => (
              <button
                key={String(f.key)}
                type="button"
                onClick={() => handleFilterChange(f.key)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                  stockFilter === f.key
                    ? "border-[#1B70A6] bg-[#1B70A6] text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-[#1B70A6]/50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <Button
          type="primary"
          size="large"
          icon={<Plus size={18} />}
          onClick={() => setCreateOpen(true)}
        >
          {t("products.addProduct")}
        </Button>
      </div>

      {firstLoad ? (
        <TableSkeleton columns={6} />
      ) : (
        <Table
          columns={columns}
          dataSource={tableData}
          loading={isLoading}
          scroll={{ x: "max-content" }}
          pagination={{
            current: page,
            pageSize: limit,
            total: data?.meta?.total || 0,
            onChange: setPage,
            showTotal: (total) => `${t("products.totalProducts")}: ${total}`,
          }}
        />
      )}

      <ProductDetailsModal
        open={detailsOpen}
        setOpen={setDetailsOpen}
        productId={detailsId}
      />
      <CreateProductModal open={createOpen} setOpen={setCreateOpen} />
      <EditProductModal
        open={editOpen}
        setOpen={setEditOpen}
        productId={editId}
      />
    </ConfigProvider>
  );
}
