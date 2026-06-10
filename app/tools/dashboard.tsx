import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import {
  generateReport,
  getReportStatus,
  ReportRiskType,
} from "../services/ReportApi";

const BASE_URL = "https://black-cat.up.railway.app";
const SCAN_ID = "6a1930194da0337829c58e65";

type Risk = "High" | "Medium" | "Low" | "Informational";
type RiskFilter = "All" | Risk;

type Vulnerability = {
  _id: string;
  scanId: string;
  url: string;
  alert: string;
  param: string;
  attack: string;
  risk: Risk;
  createdAt: string;
};

type ScanDetails = {
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
};

type Pagination = { page: number; limit: number; total: number; pages: number };

const riskColor = (risk: Risk) => {
  if (risk === "High")
    return { bg: "#FF3B3020", border: "#FF3B30", text: "#FF3B30" };
  if (risk === "Medium")
    return { bg: "#FF950020", border: "#FF9500", text: "#FF9500" };
  if (risk === "Low")
    return { bg: "#34C75920", border: "#34C759", text: "#34C759" };
  return { bg: "#00ffcc20", border: "#00ffcc", text: "#00ffcc" };
};

const formatDate = (date?: string) => {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleString();
};

const getDuration = (startedAt?: string, finishedAt?: string) => {
  if (!startedAt || !finishedAt) return "-";
  const diff = Math.floor(
    (new Date(finishedAt).getTime() - new Date(startedAt).getTime()) / 1000,
  );
  if (diff < 0) return "-";
  const m = Math.floor(diff / 60);
  const s = diff % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

// ===== Summary Card =====
function SummaryCard({
  title,
  value,
  color,
  icon,
}: {
  title: string;
  value: number;
  color: string;
  icon: string;
}) {
  return (
    <View
      style={[
        styles.summaryCard,
        { borderColor: color + "50", backgroundColor: color + "15" },
      ]}
    >
      <View>
        <Text style={[styles.summaryNumber, { color }]}>{value}</Text>
        <Text style={[styles.summaryLabel, { color }]}>{title}</Text>
      </View>
      <Ionicons name={icon as any} size={28} color={color} />
    </View>
  );
}

// ===== Alert Ratio Card =====
function AlertRatioCard({
  label,
  value,
  percent,
  color,
}: {
  label: string;
  value: number;
  percent: number;
  color: string;
}) {
  return (
    <View
      style={[
        styles.ratioCard,
        { borderColor: color + "40", backgroundColor: color + "15" },
      ]}
    >
      <View style={styles.ratioCardHeader}>
        <View
          style={[
            styles.ratioIconBox,
            { backgroundColor: color + "20", borderColor: color + "40" },
          ]}
        >
          <Ionicons name="shield-outline" size={20} color={color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.ratioLabel}>{label}</Text>
          <Text style={[styles.ratioSubLabel, { color: "#888" }]}>
            {percent}% of scan alerts
          </Text>
        </View>
        <Text style={[styles.ratioValue, { color }]}>{value}</Text>
      </View>
      <View style={styles.progressBg}>
        <View
          style={[
            styles.progressFill,
            { width: `${percent}%`, backgroundColor: color },
          ]}
        />
      </View>
      <View style={styles.ratioFooter}>
        <Text style={styles.ratioFooterLabel}>RATIO</Text>
        <Text style={[styles.ratioFooterValue, { color }]}>{percent}%</Text>
      </View>
    </View>
  );
}

// ===== Vuln Row =====
function VulnRow({ vuln }: { vuln: Vulnerability }) {
  const c = riskColor(vuln.risk);
  return (
    <View style={styles.vulnRow}>
      <View style={styles.vulnRowTop}>
        <View
          style={[
            styles.riskBadge,
            { backgroundColor: c.bg, borderColor: c.border },
          ]}
        >
          <Text style={[styles.riskBadgeText, { color: c.text }]}>
            {vuln.risk}
          </Text>
        </View>
        <View style={styles.openBadge}>
          <Text style={styles.openBadgeText}>Open</Text>
        </View>
      </View>
      <Text style={styles.vulnAlert}>{vuln.alert}</Text>
      <Text style={styles.vulnUrl} numberOfLines={1}>
        {vuln.url}
      </Text>
      {vuln.param ? (
        <Text style={styles.vulnParam}>Param: {vuln.param}</Text>
      ) : null}
      <Text style={styles.vulnDate}>
        {new Date(vuln.createdAt).toLocaleDateString()} ·{" "}
        {new Date(vuln.createdAt).toLocaleTimeString()}
      </Text>
    </View>
  );
}

export default function Dashboard() {
  const { scanId: paramScanId } = useLocalSearchParams();
  const router = useRouter();
  const scanId = (paramScanId as string) || SCAN_ID;
  const screenWidth = Dimensions.get("window").width;

  const [scan, setScan] = useState<ScanDetails | null>(null);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const [page, setPage] = useState(1);
  const [scanLoading, setScanLoading] = useState(true);
  const [vulnsLoading, setVulnsLoading] = useState(true);
  const [scanError, setScanError] = useState<string | null>(null);
  const [riskFilter, setRiskFilter] = useState<RiskFilter>("All");
  const [search, setSearch] = useState("");

  const [selectedReportType, setSelectedReportType] =
    useState<ReportRiskType>("All");

  const [generatingReport, setGeneratingReport] = useState(false);

  const fetchScan = async () => {
    try {
      setScanLoading(true);
      const token = await AsyncStorage.getItem("access_token");
      const res = await fetch(`${BASE_URL}/scan/${scanId}/result`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setScan(json.data);
    } catch (e: any) {
      setScanError(e.message || "Failed to load scan");
    } finally {
      setScanLoading(false);
    }
  }; // ✅ fetchScan بتتقفل هنا

  const handleGenerateReport = async () => {
    try {
      setGeneratingReport(true);
      const response = await generateReport(SCAN_ID, selectedReportType);
      const reportId = response.data?.data?._id;
      console.log("Report ID:", reportId); 

      if (!reportId) throw new Error("Report ID not found");

const interval = setInterval(async () => {
  try {
    const statusResponse = await getReportStatus(reportId);
    const status = statusResponse.data?.data?.status;
    const reportData = statusResponse.data?.data;

    if (status === "COMPLETED") {
      clearInterval(interval);
      setGeneratingReport(false);
      // افتح الـ report أو اعمل اللي محتاجه
      Alert.alert("Success", "Report generated successfully!");
      // مثلاً لو عندك fileUrl
      // Linking.openURL(reportData.fileUrl);

    } else if (status === "FAILED") {
      clearInterval(interval);
      setGeneratingReport(false);
      Alert.alert("Error", reportData?.failureReason || "Report generation failed");
    }
    // لو status === "PENDING" أو "PROCESSING" → استنى وخلي الـ interval يكمل

  } catch (e) {
    console.log("Interval error:", e);
    clearInterval(interval);
    setGeneratingReport(false);
  }
}, 3000);
    } catch (error: any) {
      console.log("Full error:", error); 
      console.log("Error response:", error?.response?.data); 
      setGeneratingReport(false);
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to generate report",
      );
    }
  };

  const fetchVulns = async (p: number) => {
    try {
      setVulnsLoading(true);
      const token = await AsyncStorage.getItem("access_token");
      const res = await fetch(
        `${BASE_URL}/scan/${scanId}/vulnerabilities?page=${p}&limit=10`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const json = await res.json();
      setVulnerabilities(json.data || []);
      setPagination(
        json.pagination || { page: 1, limit: 10, total: 0, pages: 1 },
      );
    } catch (e) {
      console.log("Vulns error:", e);
    } finally {
      setVulnsLoading(false);
    }
  };

  useEffect(() => {
    fetchScan();
  }, [scanId]);
  useEffect(() => {
    fetchVulns(page);
  }, [scanId, page]);

  const filteredVulns = useMemo(() => {
    return vulnerabilities.filter((v) => {
      const matchRisk = riskFilter === "All" || v.risk === riskFilter;
      const matchSearch =
        v.alert.toLowerCase().includes(search.toLowerCase()) ||
        v.url.toLowerCase().includes(search.toLowerCase()) ||
        v.param.toLowerCase().includes(search.toLowerCase());
      return matchRisk && matchSearch;
    });
  }, [vulnerabilities, search, riskFilter]);

  // ===== Loading =====
  if (scanLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#00ffcc" />
        <Text style={styles.loadingText}>LOADING SCAN REPORT...</Text>
      </View>
    );
  }

  // ===== Error =====
  if (scanError || !scan) {
    return (
      <View style={styles.centered}>
        <Ionicons name="warning-outline" size={40} color="#FF3B30" />
        <Text style={styles.errorText}>{scanError || "Scan not found"}</Text>
      </View>
    );
  }

  const summary = scan.result.summary;
  const total =
    summary.high + summary.medium + summary.low + summary.informational;
  const getPercent = (v: number) => (total ? Math.round((v / total) * 100) : 0);

  const highPercent = getPercent(summary.high);
  const mediumPercent = getPercent(summary.medium);
  const lowPercent = getPercent(summary.low);
  const infoPercent = getPercent(summary.informational);

  // Donut
  const radius = 70;
  const strokeWidth = 40;
  const circumference = 2 * Math.PI * radius;
  const gap = 6;
  const highLen = Math.max(0, (highPercent / 100) * circumference - gap);
  const medLen = Math.max(0, (mediumPercent / 100) * circumference - gap);
  const lowLen = Math.max(0, (lowPercent / 100) * circumference - gap);
  const infoLen = Math.max(0, (infoPercent / 100) * circumference - gap);

  const startResult = pagination.total === 0 ? 0 : (page - 1) * 10 + 1;
  const endResult = Math.min(page * 10, pagination.total);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* ===== BACK + TITLE ===== */}
      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={18} color="#888" />
        <Text style={styles.backText}>Back to My Scans</Text>
      </Pressable>

      {/* ===== SCAN INFO ===== */}
      <View style={styles.box}>
        <View style={styles.scanTitleRow}>
          <View>
            <View style={styles.row}>
              <Text style={styles.scanTitle}>Scan Report</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{scan.status}</Text>
              </View>
            </View>
            <View style={[styles.row, { marginTop: 10 }]}>
              <Ionicons name="globe-outline" size={18} color="#00ffcc" />
              <Text style={styles.targetText} numberOfLines={1}>
                {scan.target}
              </Text>
            </View>
          </View>
        </View>

        {/* Meta */}
        <View style={[styles.box2, { marginTop: 16 }]}>
          <View style={styles.metaGrid}>
            {[
              { label: "Scan Type", value: scan.scanType },
              { label: "Status", value: scan.status },
              { label: "Started", value: formatDate(scan.startedAt) },
              { label: "Finished", value: formatDate(scan.finishedAt) },
              {
                label: "Duration",
                value:
                  scan.durationText ||
                  getDuration(scan.startedAt, scan.finishedAt),
              },
            ].map((item) => (
              <View key={item.label} style={styles.metaItem}>
                <Text style={styles.metaLabel}>{item.label}</Text>
                <Text style={styles.metaValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* ===== SUMMARY ===== */}
      <View style={[styles.box, { marginTop: 16 }]}>
        <Text style={styles.sectionTitle}>Summary</Text>

        <SummaryCard
          title="Total Alerts"
          value={scan.result.summaryTotal}
          color="#a855f7"
          icon="shield-alert-outline"
        />

        <View style={styles.summaryGrid}>
          <SummaryCard
            title="High"
            value={summary.high}
            color="#FF3B30"
            icon="shield-alert-outline"
          />
          <SummaryCard
            title="Medium"
            value={summary.medium}
            color="#FF9500"
            icon="shield-alert-outline"
          />
          <SummaryCard
            title="Low"
            value={summary.low}
            color="#34C759"
            icon="shield-checkmark-outline"
          />
          <SummaryCard
            title="Informational"
            value={summary.informational}
            color="#00ffcc"
            icon="information-circle-outline"
          />
        </View>
      </View>

      {/* ===== ALERT RATIO ===== */}
      <View style={[styles.box, { marginTop: 16 }]}>
        <View style={styles.ratioBadge}>
          <Ionicons name="pie-chart-outline" size={16} color="#00ffcc" />
          <Text style={styles.ratioBadgeText}>Alert Ratio</Text>
        </View>
        <Text style={styles.sectionTitle}>Vulnerability Risk Distribution</Text>
        <Text style={styles.sectionSub}>
          Visual overview of all detected alerts grouped by severity level.
        </Text>

        <View style={styles.ratioTopRow}>
          <View style={styles.ratioTotalBox}>
            <Text style={styles.ratioTotalLabel}>Total Alerts</Text>
            <Text style={styles.ratioTotalValue}>{total}</Text>
          </View>
          <View
            style={[
              styles.ratioTotalBox,
              { borderColor: "#00ffcc40", backgroundColor: "#00ffcc15" },
            ]}
          >
            <Text style={styles.ratioTotalLabel}>Highest Ratio</Text>
            <Text style={[styles.ratioTotalValue, { color: "#00ffcc" }]}>
              {
                [
                  { short: "High", value: summary.high },
                  { short: "Medium", value: summary.medium },
                  { short: "Low", value: summary.low },
                  { short: "Info", value: summary.informational },
                ].reduce((max, item) => (item.value > max.value ? item : max))
                  .short
              }
            </Text>
          </View>
        </View>

        {/* Donut */}
        <View style={styles.donutContainer}>
          <Svg width={220} height={220}>
            <Circle
              cx="110"
              cy="110"
              r={radius}
              stroke="#1E2A3A"
              strokeWidth={strokeWidth}
              fill="none"
            />
            {highLen > 0 && (
              <Circle
                cx="110"
                cy="110"
                r={radius}
                stroke="#FF3B30"
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={`${highLen} ${circumference}`}
                rotation="-90"
                origin="110,110"
              />
            )}
            {medLen > 0 && (
              <Circle
                cx="110"
                cy="110"
                r={radius}
                stroke="#FF9500"
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={`${medLen} ${circumference}`}
                strokeDashoffset={-(highLen + gap)}
                rotation="-90"
                origin="110,110"
              />
            )}
            {lowLen > 0 && (
              <Circle
                cx="110"
                cy="110"
                r={radius}
                stroke="#34C759"
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={`${lowLen} ${circumference}`}
                strokeDashoffset={-(highLen + medLen + gap * 2)}
                rotation="-90"
                origin="110,110"
              />
            )}
            {infoLen > 0 && (
              <Circle
                cx="110"
                cy="110"
                r={radius}
                stroke="#00ffcc"
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={`${infoLen} ${circumference}`}
                strokeDashoffset={-(highLen + medLen + lowLen + gap * 3)}
                rotation="-90"
                origin="110,110"
              />
            )}
          </Svg>
          <View style={styles.donutCenter}>
            <Text style={styles.donutTotal}>{total}</Text>
            <Text style={styles.donutLabel}>TOTAL ALERTS</Text>
          </View>
        </View>

        {/* Ratio Cards */}
        <View style={styles.ratioGrid}>
          <AlertRatioCard
            label="High Alerts"
            value={summary.high}
            percent={highPercent}
            color="#FF3B30"
          />
          <AlertRatioCard
            label="Medium Alerts"
            value={summary.medium}
            percent={mediumPercent}
            color="#FF9500"
          />
          <AlertRatioCard
            label="Low Alerts"
            value={summary.low}
            percent={lowPercent}
            color="#34C759"
          />
          <AlertRatioCard
            label="Informational Alerts"
            value={summary.informational}
            percent={infoPercent}
            color="#00ffcc"
          />
        </View>
      </View>

      {/* ===== VULNERABILITIES ===== */}
      <View style={[styles.box, { marginTop: 16 }]}>
        <Text style={styles.sectionTitle}>All Vulnerabilities</Text>
        <Text style={styles.sectionSub}>
          Total: {pagination.total} vulnerabilities
        </Text>

        {/* Search */}
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={16} color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search vulnerability..."
            placeholderTextColor="#888"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Risk Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 16 }}
        >
          <View style={styles.filterRow}>
            {(["All", "High", "Medium", "Low", "Informational"] as const).map(
              (f) => (
                <Pressable
                  key={f}
                  style={[
                    styles.filterBtn,
                    riskFilter === f && styles.filterBtnActive,
                  ]}
                  onPress={() => {
                    setRiskFilter(f);
                    setPage(1);
                  }}
                >
                  <Text
                    style={[
                      styles.filterText,
                      riskFilter === f && styles.filterTextActive,
                    ]}
                  >
                    {f}
                  </Text>
                </Pressable>
              ),
            )}
          </View>
        </ScrollView>

        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, { flex: 1 }]}>RISK</Text>
          <Text style={[styles.tableHeaderText, { flex: 3 }]}>
            VULNERABILITY
          </Text>
          <Text style={[styles.tableHeaderText, { flex: 1 }]}>DATE</Text>
        </View>

        {/* Rows */}
        {vulnsLoading ? (
          <View style={styles.centered2}>
            <ActivityIndicator color="#00ffcc" />
            <Text style={{ color: "#888", marginTop: 8 }}>
              Loading vulnerabilities...
            </Text>
          </View>
        ) : filteredVulns.length === 0 ? (
          <View style={styles.centered2}>
            <Text style={{ color: "#888" }}>No vulnerabilities found</Text>
          </View>
        ) : (
          filteredVulns.map((vuln) => <VulnRow key={vuln._id} vuln={vuln} />)
        )}

        {/* Pagination */}
        <View style={styles.paginationContainer}>
          <Text style={styles.paginationInfo}>
            Showing {startResult} to {endResult} of {pagination.total} results
          </Text>

          {pagination.pages > 1 && (
            <View style={styles.paginationRow}>
              <Pressable
                style={[styles.pageBtn, page === 1 && styles.pageBtnDisabled]}
                onPress={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1 || vulnsLoading}
              >
                <Ionicons
                  name="chevron-back"
                  size={16}
                  color={page === 1 ? "#444" : "#fff"}
                />
              </Pressable>

              {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                let p = i + 1;
                if (pagination.pages > 5 && page > 3) p = page - 2 + i;
                if (p > pagination.pages) return null;
                return (
                  <Pressable
                    key={p}
                    style={[
                      styles.pageNumBtn,
                      page === p && styles.pageNumBtnActive,
                    ]}
                    onPress={() => setPage(p)}
                    disabled={vulnsLoading}
                  >
                    <Text
                      style={[
                        styles.pageNumText,
                        page === p && styles.pageNumTextActive,
                      ]}
                    >
                      {p}
                    </Text>
                  </Pressable>
                );
              })}

              <Pressable
                style={[
                  styles.pageBtn,
                  page === pagination.pages && styles.pageBtnDisabled,
                ]}
                onPress={() =>
                  setPage((p) => Math.min(p + 1, pagination.pages))
                }
                disabled={page === pagination.pages || vulnsLoading}
              >
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={page === pagination.pages ? "#444" : "#fff"}
                />
              </Pressable>
            </View>
          )}
        </View>
      </View>

      {/* ===== AI INSIGHT ===== */}
      <View style={[styles.aiCard, { marginTop: 16 }]}>
        <View style={styles.aiHeader}>
          <View style={styles.aiIconBox}>
            <Ionicons name="sparkles-outline" size={22} color="#0F1A2B" />
          </View>
          <View>
            <Text style={styles.aiTitle}>AI Generate Report</Text>
          </View>
        </View>

        {[
          {
            title: "Generate All Vulnerabilities",
            value: "All",
          },
          {
            title: "Generate High Only",
            value: "High",
          },
          {
            title: "Generate Medium Only",
            value: "Medium",
          },
          {
            title: "Generate Low Only",
            value: "Low",
          },
        ].map((item) => (
          <Pressable
            key={item.value}
            style={[
              styles.aiOption,
              selectedReportType === item.value && styles.aiOptionActive,
            ]}
            onPress={() => setSelectedReportType(item.value as ReportRiskType)}
          >
            <View
              style={[
                styles.aiRadio,
                selectedReportType === item.value && styles.aiRadioActive,
              ]}
            >
              {selectedReportType === item.value && (
                <View style={styles.aiRadioDot} />
              )}
            </View>

            <View>
              <Text style={styles.aiOptionTitle}>{item.title}</Text>

              <Text style={styles.aiOptionSub}>Generate AI PDF report.</Text>
            </View>
          </Pressable>
        ))}

        <Pressable
          style={[
            styles.aiButton,
            generatingReport && {
              opacity: 0.6,
            },
          ]}
          disabled={generatingReport}
          onPress={handleGenerateReport}
        >
          <Ionicons
            name={generatingReport ? "reload-outline" : "flash-outline"}
            size={20}
            color="#0F1A2B"
          />

          <Text style={styles.aiButtonText}>
            {generatingReport ? "Generating..." : "Generate"}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingTop: 100, paddingBottom: 40 },

  centered: {
    flex: 1,
    backgroundColor: "#070F1C",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  centered2: { paddingVertical: 40, alignItems: "center" },
  loadingText: {
    color: "#00ffcc",
    fontSize: 13,
    letterSpacing: 2,
    marginTop: 12,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 14,
    marginTop: 10,
    textAlign: "center",
    paddingHorizontal: 30,
  },

  box: {
    backgroundColor: "#0F1A2B",
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#1E2A3A",
  },
  box2: { backgroundColor: "#070F1C", padding: 16, borderRadius: 16 },

  row: { flexDirection: "row", alignItems: "center", gap: 8 },

  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },
  backText: { color: "#888", fontWeight: "600" },

  scanTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  scanTitle: { color: "#fff", fontSize: 24, fontWeight: "800" },
  statusBadge: {
    backgroundColor: "#34C75920",
    borderWidth: 1,
    borderColor: "#34C75950",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  statusText: { color: "#34C759", fontSize: 12, fontWeight: "700" },
  targetText: { color: "#00ffcc", fontWeight: "700", flex: 1 },

  metaGrid: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
  metaItem: { minWidth: "45%", flex: 1 },
  metaLabel: {
    color: "#666",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  metaValue: { color: "#fff", fontWeight: "700", fontSize: 13 },

  sectionTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 6,
  },
  sectionSub: { color: "#888", fontSize: 13, marginBottom: 16 },

  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 10,
  },
  summaryCard: {
    flex: 1,
    minWidth: "45%",
    borderWidth: 1.5,
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryNumber: { fontSize: 32, fontWeight: "900" },
  summaryLabel: { fontSize: 13, fontWeight: "700", marginTop: 2 },

  ratioBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: "#00ffcc15",
    borderWidth: 1,
    borderColor: "#00ffcc30",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 12,
  },
  ratioBadgeText: {
    color: "#00ffcc",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },

  ratioTopRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  ratioTotalBox: {
    flex: 1,
    backgroundColor: "#1E2A3A",
    borderWidth: 1,
    borderColor: "#2A3A4A",
    borderRadius: 16,
    padding: 16,
  },
  ratioTotalLabel: { color: "#888", fontSize: 12, fontWeight: "600" },
  ratioTotalValue: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "900",
    marginTop: 4,
  },

  donutContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    position: "relative",
  },
  donutCenter: { position: "absolute", alignItems: "center" },
  donutTotal: { color: "#fff", fontSize: 36, fontWeight: "900" },
  donutLabel: {
    color: "#888",
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: "700",
  },

  ratioGrid: { gap: 12 },
  ratioCard: { borderWidth: 1.5, borderRadius: 24, padding: 18 },
  ratioCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  ratioIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  ratioLabel: { color: "#fff", fontWeight: "800", fontSize: 15 },
  ratioSubLabel: { fontSize: 12, marginTop: 2 },
  ratioValue: { fontSize: 30, fontWeight: "900" },
  progressBg: {
    height: 14,
    backgroundColor: "#1E2A3A",
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#2A3A4A",
  },
  progressFill: { height: 14, borderRadius: 10 },
  ratioFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  ratioFooterLabel: {
    color: "#666",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  ratioFooterValue: { fontSize: 13, fontWeight: "800" },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#070F1C",
    padding: 12,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1E2A3A",
  },
  searchInput: { flex: 1, color: "#fff", fontSize: 14 },

  filterRow: { flexDirection: "row", gap: 8 },
  filterBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1E2A3A",
    backgroundColor: "#070F1C",
  },
  filterBtnActive: { backgroundColor: "#00ffcc", borderColor: "#00ffcc" },
  filterText: { color: "#888", fontWeight: "700", fontSize: 13 },
  filterTextActive: { color: "#0F1A2B" },

  tableHeader: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#070F1C",
    borderRadius: 10,
    marginBottom: 8,
  },
  tableHeaderText: {
    color: "#666",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },

  vulnRow: {
    backgroundColor: "#111C2E",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#1E2A3A",
  },
  vulnRowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  riskBadge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  riskBadgeText: { fontSize: 11, fontWeight: "800" },
  openBadge: {
    backgroundColor: "#FF3B3020",
    borderWidth: 1,
    borderColor: "#FF3B3040",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  openBadgeText: { color: "#FF3B30", fontSize: 11, fontWeight: "800" },
  vulnAlert: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
    marginBottom: 4,
  },
  vulnUrl: { color: "#888", fontSize: 12, marginBottom: 4 },
  vulnParam: { color: "#666", fontSize: 11, marginBottom: 4 },
  vulnDate: { color: "#555", fontSize: 11 },

  paginationContainer: { marginTop: 20, gap: 12 },
  paginationInfo: { color: "#888", fontSize: 13, textAlign: "center" },
  paginationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  pageBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1E2A3A",
    backgroundColor: "#070F1C",
    alignItems: "center",
    justifyContent: "center",
  },
  pageBtnDisabled: { opacity: 0.4 },
  pageNumBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1E2A3A",
    backgroundColor: "#070F1C",
    alignItems: "center",
    justifyContent: "center",
  },
  pageNumBtnActive: { backgroundColor: "#00ffcc", borderColor: "#00ffcc" },
  pageNumText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  pageNumTextActive: { color: "#0F1A2B" },

  aiCard: {
    backgroundColor: "#0F1A2B",
    borderRadius: 28,
    padding: 22,
    borderWidth: 1.5,
    borderColor: "#00ffcc40",
  },
  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  aiIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#66FFDD",
    alignItems: "center",
    justifyContent: "center",
  },
  aiTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
  aiOption: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderWidth: 1,
    borderColor: "#1E2A3A",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    backgroundColor: "#070F1C",
  },
  aiOptionActive: { borderColor: "#00ffcc", backgroundColor: "#00ffcc15" },
  aiRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#666",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  aiRadioActive: { borderColor: "#00ffcc" },
  aiRadioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#00ffcc",
  },
  aiOptionTitle: { color: "#fff", fontWeight: "700", fontSize: 14 },
  aiOptionSub: { color: "#888", fontSize: 12, marginTop: 4 },
  aiButton: {
    backgroundColor: "#66FFDD",
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  aiButtonText: { color: "#0F1A2B", fontWeight: "800", fontSize: 15 },
});
