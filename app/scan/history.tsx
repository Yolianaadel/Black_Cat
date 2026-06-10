import React, { useEffect, useMemo, useState } from "react";

import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { useRouter } from "expo-router";

import { useLocalSearchParams } from "expo-router";
import { getAllScans } from "../services/ScanHistoryApi";

const PAGE_LIMIT = 3;
const getHostName = (url: string) => {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
};
export default function ScanHistory() {
  const { scanId } = useLocalSearchParams<{ scanId: string }>();

  const router = useRouter();

  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
  });

  const fetchScans = async (page: number) => {
    try {
      setLoading(true);

      const response = await getAllScans(page, PAGE_LIMIT);

      setScans(response.data || []);

      setPagination(response.pagination);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScans(pagination.page);
  }, [pagination.page]);

  const filteredScans = useMemo(() => {
    return scans.filter(
      (scan: any) =>
        scan.target.toLowerCase().includes(search.toLowerCase()) ||
        scan.scanType.toLowerCase().includes(search.toLowerCase()) ||
        scan.status.toLowerCase().includes(search.toLowerCase()),
    );
  }, [scans, search]);

  const renderScan = ({ item }: any) => {
    const summary = item.result?.summary;

    const canView = item.status === "completed";
    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <Ionicons name="globe-outline" size={22} color="#66FFDD" />

          <View
            style={{
              flex: 1,
            }}
          >
            <Text style={styles.target}>{item.target}</Text>
            <Text style={styles.small}>{getHostName(item.target)}</Text>
            <Text style={styles.date}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
            <View style={styles.metaRow}>
              <Text style={styles.scanType}>
                {item.scanType === "deep" ? "Deep Scan" : "Normal Scan"}
              </Text>

              <View
                style={[
                  styles.statusBadge,
                  item.status === "completed"
                    ? styles.completed
                    : item.status === "failed"
                      ? styles.failed
                      : styles.scanning,
                ]}
              >
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>{" "}
          </View>
        </View>

        <View style={styles.summary}>
          <Text style={styles.red}>
            H:
            {summary?.high || 0}
          </Text>

          <Text style={styles.orange}>
            M:
            {summary?.medium || 0}
          </Text>

          <Text style={styles.green}>
            L:
            {summary?.low || 0}
          </Text>

          <Text style={styles.blue}>
            I:
            {summary?.informational || 0}
          </Text>
        </View>

        <Text style={styles.total}>
          Total:
          {item.result?.summaryTotal || 0}
        </Text>

        <Pressable
          disabled={!canView}
          style={[
            styles.button,

            !canView && {
              opacity: 0.4,
            },
          ]}
          onPress={() => {
            router.push(`/tools/dashboard`);
          }}
        >
          <Text style={styles.buttonText}>View Report</Text>
        </Pressable>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#66FFDD" />

        <Text
          style={{
            color: "white",
          }}
        >
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Scans</Text>

      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search scans"
        placeholderTextColor="#888"
        style={styles.input}
      />

      <FlatList
        data={filteredScans}
        keyExtractor={(item: any) => item._id}
        renderItem={renderScan}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="shield-checkmark" size={50} color="#66FFDD" />
            <Text style={styles.emptyText}>No scans found</Text>
          </View>
        }
      />

      <View style={styles.pagination}>
        <Pressable
          onPress={() => {
            if (pagination.page > 1) {
              setPagination((prev) => ({
                ...prev,

                page: prev.page - 1,
              }));
            }
          }}
        >
          <Ionicons name="chevron-back" size={24} color="#66FFDD" />
        </Pressable>

        <Text
          style={{
            color: "white",
          }}
        >
          {pagination.page}/{pagination.pages}
        </Text>

        <Pressable
          onPress={() => {
            if (pagination.page < pagination.pages) {
              setPagination((prev) => ({
                ...prev,

                page: prev.page + 1,
              }));
            }
          }}
        >
          <Ionicons name="chevron-forward" size={24} color="#66FFDD" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#07111f",
    padding: 20,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#07111f",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
  },

  input: {
    backgroundColor: "#111C2E",
    padding: 15,
    borderRadius: 15,
    color: "white",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#0F1A2B",
    padding: 15,
    borderRadius: 20,
    marginBottom: 15,
  },

  row: {
    flexDirection: "row",
    gap: 10,
  },

  target: {
    color: "white",
    fontWeight: "bold",
  },

  small: {
    color: "#888",
  },

  summary: {
    flexDirection: "row",
    gap: 10,
    marginVertical: 15,
  },

  red: {
    color: "#ff5a5a",
  },

  orange: {
    color: "#ff9933",
  },

  green: {
    color: "#44ff99",
  },

  blue: {
    color: "#66FFDD",
  },

  total: {
    color: "white",
  },

  button: {
    backgroundColor: "#66FFDD",
    padding: 12,
    borderRadius: 12,
    marginTop: 15,
  },

  buttonText: {
    textAlign: "center",
    fontWeight: "bold",
  },

  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    marginVertical: 20,
  },
  date: {
    color: "#666",
    fontSize: 12,
    marginTop: 4,
  },

  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },

  scanType: {
    color: "#66FFDD",
    fontWeight: "600",
    fontSize: 12,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  completed: {
    backgroundColor: "#1f6f4a",
  },

  failed: {
    backgroundColor: "#8b1e1e",
  },

  scanning: {
    backgroundColor: "#1d4ed8",
  },

  statusText: {
    color: "white",
    fontSize: 11,
    fontWeight: "bold",
  },

  emptyContainer: {
    alignItems: "center",
    marginTop: 60,
  },

  emptyText: {
    color: "#999",
    marginTop: 10,
  },
});
