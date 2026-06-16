import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Icon component ────────────────────────────────────────────────────────────
// Swap this out for @expo/vector-icons when ready:
// import { Feather } from "@expo/vector-icons";
const Icon = ({
  name,
  size = 16,
  color = "#94a3b8",
}: {
  name: string;
  size?: number;
  color?: string;
}) => {
  const icons: Record<string, string> = {
    ArrowLeft: "←",
    ShieldCheck: "🛡",
    Globe: "🌐",
    Activity: "📊",
    Calendar: "📅",
    Clock: "🕐",
    Sparkles: "✨",
    ExternalLink: "↗",
    FileText: "📄",
    AlertTriangle: "⚠️",
    ShieldAlert: "🔔",
    Info: "ℹ️",
    CheckCircle2: "✅",
    XCircle: "❌",
    Circle: "⭕",
    Loader2: "⏳",
    Trash2: "🗑",
    FileDown: "📥",
    ArrowRight: "→",
  };
  return (
    <Text style={{ fontSize: size, color, lineHeight: size * 1.4 }}>
      {icons[name] ?? "•"}
    </Text>
  );
};

// ─── Types ─────────────────────────────────────────────────────────────────────
type ReportStatus = "PROCESSING" | "COMPLETED" | "FAILED" | "PENDING";
type ReportType = "All" | "High" | "Medium" | "Low" | "Informational";

interface Report {
  _id: string;
  scanId: string;
  userId: string;
  typeOfRisk: ReportType;
  reportName: string;
  fileUrl: string | null;
  cloudinaryPublicId: string | null;
  status: ReportStatus;
  generationTimeMs: number | null;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ScanDetails {
  _id: string;
  target: string;
  scanType: string;
  status: string;
  startedAt: string;
  finishedAt: string;
  durationText?: string;
  failureReason: string | null;
  result: {
    summary: {
      high: number;
      medium: number;
      low: number;
      informational: number;
    };
    baseUrl: string;
    alertsCount: number;
    summaryTotal: number;
  };
}

// ─── Helpers ────────────────────────────────────────────────────────────────────
const reportDescriptions: Record<ReportType, string> = {
  All: "Comprehensive overview of all vulnerabilities and risks.",
  High: "Detailed report for high severity vulnerabilities.",
  Medium: "Detailed report for medium severity vulnerabilities.",
  Low: "Detailed report for low severity vulnerabilities.",
  Informational: "Informational findings and best practice suggestions.",
};

const formatDate = (date?: string) => {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleString();
};

const formatGenerationTime = (ms: number | null) => {
  if (!ms) return "-";
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return minutes === 0 ? `${rest}s` : `${minutes}m ${rest}s`;
};

// ─── Color maps ─────────────────────────────────────────────────────────────────
const riskColors: Record<
  ReportType,
  { border: string; bg: string; text: string }
> = {
  High: { border: "#ef444460", bg: "#ef44440d", text: "#fca5a5" },
  Medium: { border: "#f9731660", bg: "#f973160d", text: "#fdba74" },
  Low: { border: "#eab30860", bg: "#eab3080d", text: "#fde047" },
  Informational: { border: "#3b82f660", bg: "#3b82f60d", text: "#93c5fd" },
  All: { border: "#a855f760", bg: "#a855f70d", text: "#d8b4fe" },
};

const statusColors: Record<
  ReportStatus,
  { border: string; bg: string; text: string }
> = {
  COMPLETED: { border: "#10b98160", bg: "#10b9810d", text: "#6ee7b7" },
  PROCESSING: { border: "#eab30860", bg: "#eab3080d", text: "#fde047" },
  FAILED: { border: "#ef444460", bg: "#ef44440d", text: "#fca5a5" },
  PENDING: { border: "#64748b60", bg: "#64748b0d", text: "#cbd5e1" },
};

const scanStatusColor = (status?: string) => {
  const v = status?.toLowerCase();
  if (v === "completed") return statusColors.COMPLETED;
  if (v === "failed") return statusColors.FAILED;
  if (["scanning", "processing", "preparing"].includes(v ?? ""))
    return statusColors.PROCESSING;
  return statusColors.PENDING;
};

// ─── Real API imports ──────────────────────────────────────────────────────────
// ✅ استبدل الـ paths دي بالمسارات الصح عندك:
import { deleteReport, getReportsByScan } from "../services/ReportApi";
import { getScanResult } from "../services/ScanReportApi";

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function ScanReports() {
  const router = useRouter();
  const { scanId } = useLocalSearchParams<{ scanId: string }>();

  const [scan, setScan] = useState<ScanDetails | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = async () => {
    if (!scanId) {
      setLoading(false); // ✅ مش هيفضل loading لو scanId مش موجود
      return;
    }
    try {
      setLoading(true);
      setErrorMsg("");
      const [scanRes, reportsRes] = await Promise.all([
        getScanResult(scanId),
        getReportsByScan(scanId),
      ]);
      setScan(scanRes.data.data);
      setReports(reportsRes.data.data || []);
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message ||
          err?.response?.data?.err_message ||
          "Failed to load scan reports",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reportId: string) => {
    try {
      setDeletingId(reportId);
      const res = await deleteReport(reportId);
      setReports((prev) => prev.filter((r) => r._id !== reportId));
      showToast(
        res?.data?.message || "Report deleted successfully.",
        "success",
      );
    } catch (err: any) {
      showToast(
        err?.response?.data?.err_message ||
          err?.response?.data?.message ||
          "Failed to delete report.",
        "error",
      );
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchData();
  }, [scanId]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#22d3ee" />
        <Text style={s.loadingText}>Loading reports...</Text>
      </View>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <View style={s.root}>
      {/* Toast */}
      {toast !== null && (
        <View
          style={[
            s.toast,
            toast.type === "success" ? s.toastSuccess : s.toastError,
          ]}
        >
          <Text style={s.toastText}>{toast.msg}</Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={s.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Back */}
        <TouchableOpacity
          style={s.backBtn}
          onPress={() => router.push("/scan/history")}
        >
          <Icon name="ArrowLeft" size={16} color="#22d3ee" />
          <Text style={s.backBtnText}> Back to Scans</Text>
        </TouchableOpacity>

        {/* Error banner */}
        {errorMsg !== "" && (
          <View style={s.errorBanner}>
            <Text style={s.errorBannerText}>{errorMsg}</Text>
          </View>
        )}

        {/* Scan card */}
        {scan !== null && (
          <ScanCard
            scan={scan}
            onViewDetails={() =>
              router.push({
                pathname: "/tools/dashboard",
                params: { scanId: scanId },
              })
            }
          />
        )}
        {/* Heading */}
        <View style={s.headingRow}>
          <Text style={s.sectionTitle}>AI Reports</Text>
          <View style={{ marginLeft: 8 }}>
            <Icon name="Info" size={16} color="#64748b" />
          </View>
        </View>
        <Text style={s.sectionSub}>
          View and manage AI-powered security reports for this scan.
        </Text>

        {/* Reports */}
        {reports.length === 0 ? (
          <View style={s.emptyBox}>
            <Text style={s.emptyText}>No reports found for this scan.</Text>
          </View>
        ) : (
          reports.map((report) => (
            <ReportCard
              key={report._id}
              report={report}
              isDeleting={deletingId === report._id}
              onDelete={() => handleDelete(report._id)}
            />
          ))
        )}

        {/* How it works */}
        <HowItWorks />
      </ScrollView>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

// ── Scan info card ──────────────────────────────────────────────────────────────
function ScanCard({
  scan,
  onViewDetails,
}: {
  scan: ScanDetails;
  onViewDetails: () => void;
}) {
  const sc = scanStatusColor(scan.status);

  return (
    <View style={s.card}>
      {/* Top row */}
      <View style={s.row}>
        <View style={s.shieldBadge}>
          <Icon name="ShieldCheck" size={24} color="#6ee7b7" />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={s.cardTitle} numberOfLines={1}>
            {scan.target} Scan
          </Text>
          <View style={[s.row, { marginTop: 4 }]}>
            <Icon name="Globe" size={13} color="#64748b" />
            <Text style={[s.metaText, { marginLeft: 4 }]} numberOfLines={1}>
              {scan.result?.baseUrl
                ? scan.result.baseUrl
                : (scan.target ?? "")}{" "}
            </Text>
          </View>
        </View>
      </View>

      {/* View details */}
      <TouchableOpacity style={s.cyanBtn} onPress={onViewDetails}>
        <Icon name="ExternalLink" size={14} color="#22d3ee" />
        <Text style={s.cyanBtnText}> View Scan Details</Text>
      </TouchableOpacity>

      {/* Meta grid */}
      <View style={s.metaGrid}>
        <MetaItem
          icon="Activity"
          label="Scan Type"
          value={scan.scanType}
          capitalize
        />
        <MetaItem
          icon="ShieldCheck"
          label="Status"
          value={scan.status}
          badge
          badgeColors={sc}
        />
        <MetaItem
          icon="Calendar"
          label="Started At"
          value={formatDate(scan.startedAt)}
        />
        <MetaItem
          icon="Clock"
          label="Duration"
          value={scan.durationText ?? "-"}
        />
        <MetaItem
          icon="Sparkles"
          label="Total Alerts"
          value={String(scan.result?.summaryTotal ?? 0)}
        />
      </View>
    </View>
  );
}

// ── Meta item ────────────────────────────────────────────────────────────────────
function MetaItem({
  icon,
  label,
  value,
  capitalize = false,
  badge = false,
  badgeColors,
}: {
  icon: string;
  label: string;
  value: string;
  capitalize?: boolean;
  badge?: boolean;
  badgeColors?: { border: string; bg: string; text: string };
}) {
  return (
    <View style={s.metaItem}>
      <View style={s.row}>
        <Icon name={icon} size={13} color="#64748b" />
        <Text style={[s.metaLabel, { marginLeft: 4 }]}>{label}</Text>
      </View>
      {badge && badgeColors !== undefined ? (
        <View
          style={[
            s.badge,
            {
              borderColor: badgeColors.border,
              backgroundColor: badgeColors.bg,
              marginTop: 4,
            },
          ]}
        >
          <Text style={[s.badgeText, { color: badgeColors.text }]}>
            {value}
          </Text>
        </View>
      ) : (
        <Text
          style={[
            s.metaValue,
            capitalize ? { textTransform: "capitalize" } : {},
          ]}
        >
          {value}
        </Text>
      )}
    </View>
  );
}

// ── Report card ───────────────────────────────────────────────────────────────────
function ReportCard({
  report,
  isDeleting,
  onDelete,
}: {
  report: Report;
  isDeleting: boolean;
  onDelete: () => void;
}) {
  const risk = riskColors[report.typeOfRisk];
  const status = statusColors[report.status];

  const riskIconName =
    report.typeOfRisk === "High"
      ? "AlertTriangle"
      : report.typeOfRisk === "All"
        ? "FileText"
        : "Info";

  const statusIconName =
    report.status === "COMPLETED"
      ? "CheckCircle2"
      : report.status === "PROCESSING"
        ? "Loader2"
        : report.status === "FAILED"
          ? "XCircle"
          : "Circle";

  return (
    <View style={[s.reportCard, isDeleting ? { opacity: 0.4 } : {}]}>
      <View style={s.row}>
        {/* Risk icon box */}
        <View
          style={[
            s.reportIconBox,
            { borderColor: risk.border, backgroundColor: risk.bg },
          ]}
        >
          <Icon name={riskIconName} size={18} color={risk.text} />
        </View>

        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={s.reportName}>{report.reportName}</Text>
          <Text style={s.reportDesc} numberOfLines={2}>
            {reportDescriptions[report.typeOfRisk] ??
              "AI generated security report."}
          </Text>

          {/* Risk & status badges */}
          <View style={s.badgesRow}>
            <View
              style={[
                s.badge,
                { borderColor: risk.border, backgroundColor: risk.bg },
              ]}
            >
              <Text style={[s.badgeText, { color: risk.text }]}>
                {report.typeOfRisk === "All" ? "All Risks" : report.typeOfRisk}
              </Text>
            </View>

            <View
              style={[
                s.badge,
                s.row,
                {
                  borderColor: status.border,
                  backgroundColor: status.bg,
                  marginLeft: 6,
                },
              ]}
            >
              <Icon name={statusIconName} size={11} color={status.text} />
              <Text
                style={[s.badgeText, { color: status.text, marginLeft: 4 }]}
              >
                {report.status}
              </Text>
            </View>
          </View>

          {/* Date */}
          <Text style={[s.metaText, { marginTop: 8 }]}>
            {formatDate(report.createdAt)}
          </Text>
          {report.generationTimeMs !== null && (
            <Text style={s.dimText}>
              {formatGenerationTime(report.generationTimeMs)}
            </Text>
          )}
        </View>
      </View>

      {/* Action buttons */}
      <View style={s.actionsRow}>
        {report.status === "COMPLETED" && report.fileUrl !== null ? (
          <TouchableOpacity
            style={s.pdfBtn}
            onPress={() => Linking.openURL(report.fileUrl!)}
          >
            <Icon name="ExternalLink" size={14} color="#d8b4fe" />
            <Text style={s.pdfBtnText}> Open PDF</Text>
          </TouchableOpacity>
        ) : (
          <View style={s.pdfBtnDisabled}>
            <Icon name="FileDown" size={14} color="#475569" />
            <Text style={s.pdfBtnDisabledText}> Open PDF</Text>
          </View>
        )}

        <TouchableOpacity
          style={s.deleteBtn}
          onPress={onDelete}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <ActivityIndicator size={14} color="#fca5a5" />
          ) : (
            <Icon name="Trash2" size={14} color="#fca5a5" />
          )}
          <Text style={s.deleteBtnText}> Delete</Text>
        </TouchableOpacity>
      </View>

      {/* Failure reason */}
      {report.status === "FAILED" && report.failureReason !== null && (
        <Text style={s.failureText}>{report.failureReason}</Text>
      )}
    </View>
  );
}

// ── How it works ──────────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      num: "1",
      title: "Choose report type",
      desc: "Select the type of risk you want to include.",
    },
    {
      num: "2",
      title: "AI is generating",
      desc: "We analyze the findings and create your report.",
    },
    {
      num: "3",
      title: "Download & Share",
      desc: "Download the PDF report or share it with your team.",
    },
  ];

  return (
    <View style={s.howCard}>
      <View style={[s.row, { marginBottom: 16 }]}>
        <Icon name="Sparkles" size={16} color="#fde047" />
        <View style={{ marginLeft: 10, flex: 1 }}>
          <Text style={s.howTitle}>How it works</Text>
          <Text style={s.howDesc}>
            Reports are generated using AI based on the vulnerabilities found in
            this scan.
          </Text>
        </View>
      </View>

      {steps.map((step, i) => (
        <View
          key={step.num}
          style={[
            s.row,
            { alignItems: "flex-start", marginBottom: i < 2 ? 14 : 0 },
          ]}
        >
          <View style={s.stepBubble}>
            <Text style={s.stepNum}>{step.num}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={s.stepTitle}>{step.title}</Text>
            <Text style={s.stepDesc}>{step.desc}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════════
const NAVY_900 = "#0d1b2e";
const NAVY_950 = "#070f1d";
const NAVY_800 = "#162035";
const WHITE = "#ffffff";
const CYAN = "#22d3ee";

const s = StyleSheet.create({
  // ── Layout ──────────────────────────────────────────────────────────────────
  root: { flex: 1, backgroundColor: NAVY_950, paddingTop: 80 },
  center: {
    flex: 1,
    backgroundColor: NAVY_950,
    alignItems: "center",
    justifyContent: "center",
  },
  container: { padding: 16, paddingBottom: 48 },
  row: { flexDirection: "row", alignItems: "center" },

  // ── Loading ─────────────────────────────────────────────────────────────────
  loadingText: {
    marginTop: 12,
    color: "#94a3b8",
    fontWeight: "700",
    fontSize: 14,
  },

  // ── Toast ────────────────────────────────────────────────────────────────────
  toast: {
    position: "absolute",
    top: Platform.OS === "ios" ? 52 : 16,
    left: 16,
    right: 16,
    zIndex: 99,
    borderRadius: 14,
    padding: 14,
  },
  toastSuccess: {
    backgroundColor: "#064e3b",
    borderWidth: 1,
    borderColor: "#10b98150",
  },
  toastError: {
    backgroundColor: "#450a0a",
    borderWidth: 1,
    borderColor: "#ef444450",
  },
  toastText: { color: WHITE, fontWeight: "700", fontSize: 13 },

  // ── Back button ──────────────────────────────────────────────────────────────
  backBtn: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  backBtnText: { color: CYAN, fontWeight: "700", fontSize: 13 },

  // ── Error banner ──────────────────────────────────────────────────────────────
  errorBanner: {
    backgroundColor: "#450a0a",
    borderWidth: 1,
    borderColor: "#ef444450",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  errorBannerText: { color: "#fca5a5", fontWeight: "700", fontSize: 13 },

  // ── Card (scan info) ──────────────────────────────────────────────────────────
  card: {
    backgroundColor: NAVY_900,
    borderWidth: 1,
    borderColor: NAVY_800,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  cardTitle: { fontSize: 18, fontWeight: "900", color: WHITE },
  shieldBadge: {
    height: 48,
    width: 48,
    borderRadius: 24,
    backgroundColor: "#10b9810d",
    borderWidth: 1,
    borderColor: "#10b98130",
    alignItems: "center",
    justifyContent: "center",
  },

  cyanBtn: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#22d3ee40",
    backgroundColor: "#22d3ee0d",
    paddingVertical: 10,
  },
  cyanBtnText: { color: CYAN, fontWeight: "900", fontSize: 12 },

  // ── Meta grid ────────────────────────────────────────────────────────────────
  metaGrid: {
    marginTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 14,
    columnGap: 14,
  },
  metaItem: { width: "47%" },
  metaLabel: { fontSize: 11, fontWeight: "700", color: "#64748b" },
  metaText: { fontSize: 12, fontWeight: "700", color: "#94a3b8" },
  metaValue: { fontSize: 13, fontWeight: "700", color: WHITE, marginTop: 3 },
  dimText: { fontSize: 11, color: "#64748b", marginTop: 2 },

  // ── Badge ─────────────────────────────────────────────────────────────────────
  badge: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: { fontSize: 11, fontWeight: "900" },

  // ── Section heading ───────────────────────────────────────────────────────────
  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 4,
  },
  sectionTitle: { fontSize: 22, fontWeight: "900", color: WHITE },
  sectionSub: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94a3b8",
    marginBottom: 14,
  },

  // ── Empty state ───────────────────────────────────────────────────────────────
  emptyBox: {
    backgroundColor: NAVY_900,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: NAVY_800,
    padding: 40,
    alignItems: "center",
  },
  emptyText: { color: "#94a3b8", fontWeight: "700", fontSize: 14 },

  // ── Report card ───────────────────────────────────────────────────────────────
  reportCard: {
    backgroundColor: NAVY_900,
    borderWidth: 1,
    borderColor: NAVY_800,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  reportIconBox: {
    height: 48,
    width: 48,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  reportName: { fontSize: 15, fontWeight: "900", color: WHITE },
  reportDesc: {
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: "700",
    marginTop: 3,
    lineHeight: 16,
  },
  badgesRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    flexWrap: "wrap",
  },
  failureText: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: "700",
    color: "#fca5a5",
  },

  // ── Action buttons ────────────────────────────────────────────────────────────
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    columnGap: 10,
  },

  pdfBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#a855f740",
    backgroundColor: "#a855f70d",
    paddingVertical: 11,
  },
  pdfBtnText: { color: "#d8b4fe", fontWeight: "900", fontSize: 12 },
  pdfBtnDisabled: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: NAVY_800,
    backgroundColor: NAVY_950,
    paddingVertical: 11,
  },
  pdfBtnDisabledText: { color: "#475569", fontWeight: "900", fontSize: 12 },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ef444440",
    backgroundColor: "#ef44440d",
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  deleteBtnText: { color: "#fca5a5", fontWeight: "900", fontSize: 12 },

  // ── How it works ──────────────────────────────────────────────────────────────
  howCard: {
    marginTop: 8,
    backgroundColor: NAVY_900,
    borderWidth: 1,
    borderColor: "#162035cc",
    borderRadius: 18,
    padding: 16,
  },
  howTitle: { fontSize: 13, fontWeight: "900", color: WHITE },
  howDesc: { fontSize: 11, fontWeight: "500", color: "#94a3b8", marginTop: 2 },
  stepBubble: {
    height: 24,
    width: 24,
    borderRadius: 12,
    backgroundColor: "#4f46e530",
    alignItems: "center",
    justifyContent: "center",
  },
  stepNum: { fontSize: 11, fontWeight: "900", color: WHITE },
  stepTitle: { fontSize: 12, fontWeight: "900", color: WHITE },
  stepDesc: { fontSize: 11, color: "#94a3b8", marginTop: 2, lineHeight: 15 },
});
