import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import Svg, { Circle } from "react-native-svg";

export default function Dashboard() {
  const high = 2;
  const medium = 4;
  const low = 1;
  const info = 3;

  const total = high + medium + low + info;

  // ===== Percentages =====
  const highPercent = (high / total) * 100;
  const mediumPercent = (medium / total) * 100;
  const lowPercent = (low / total) * 100;
  const infoPercent = (info / total) * 100;

  // ===== Donut Settings =====
  const radius = 60;
  const strokeWidth = 38;
  const circumference = 2 * Math.PI * radius;
  const gap = 8;

  const highLength = (highPercent / 100) * circumference - gap;
  const mediumLength = (mediumPercent / 100) * circumference - gap;
  const lowLength = (lowPercent / 100) * circumference - gap;
  const infoLength = (infoPercent / 100) * circumference - gap;

  const screenWidth = Dimensions.get("window").width;

  const [tooltip, setTooltip] = useState<any>(null);

  const exposureData = {
    labels: ["High", "Medium", "Low", "Info"],
    datasets: [
      {
        data: [high, medium, low, info],
        strokeWidth: 5,
      },
    ],
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* ===== BOTTOM BOX ===== */}
      <View style={styles.bottomBox}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons
            name="pie-chart-outline"
            size={20}
            color="#66FFDD"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.sectionTitle}>
            ALERTS <Text style={styles.accent}>RATIO</Text>
          </Text>
        </View>


        {/* ===== DONUT ===== */}
        <View style={styles.chartContainer}>
          <Svg width={200} height={200}>
            <Circle
              cx="100"
              cy="100"
              r={radius}
              stroke="#1E2A3A"
              strokeWidth={strokeWidth}
              fill="none"
            />

            <Circle
              cx="100"
              cy="100"
              r={radius}
              stroke="#FF3B30"
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={`${highLength} ${circumference}`}
              rotation="-90"
              origin="100,100"
            />

            <Circle
              cx="100"
              cy="100"
              r={radius}
              stroke="#FF9500"
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={`${mediumLength} ${circumference}`}
              strokeDashoffset={-highLength - gap}
              rotation="-90"
              origin="100,100"
            />

            <Circle
              cx="100"
              cy="100"
              r={radius}
              stroke="#FFC107"
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={`${lowLength} ${circumference}`}
              strokeDashoffset={-(highLength + mediumLength + gap * 2)}
              rotation="-90"
              origin="100,100"
            />

            <Circle
              cx="100"
              cy="100"
              r={radius}
              stroke="#34C759" // أخضر للـ info
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={`${infoLength} ${circumference}`}
              strokeDashoffset={
                -(highLength + mediumLength + lowLength + gap * 3)
              }
              rotation="-90"
              origin="100,100"
            />
          </Svg>

          <Text style={styles.legendText}>
            🔴 HIGH 🟠 MEDIUM 🟡 LOW 🟢 INFO
          </Text>
        </View>

        {/* ===== ALERT CARDS ===== */}
        <AlertCard
          title="HIGH ALERTS"
          percent={Math.round(highPercent)}
          color="#FF3B30"
          count={3}
        />
        <AlertCard
          title="MEDIUM ALERTS"
          percent={Math.round(mediumPercent)}
          color="#FF9500"
          count={3}
        />
        <AlertCard
          title="LOW ALERTS"
          percent={Math.round(lowPercent)}
          color="#FFC107"
          count={2}
        />

        <AlertCard
          title="INFO ALERTS"
          percent={Math.round(infoPercent)}
          color="#34C759"
          count={info}
        />
        {/* ===== EXPOSURE OVER TIME ===== */}
        <View style={styles.chartBox}>
          <View style={styles.titleRow}>
            <Ionicons
              name="bar-chart-outline"
              size={22}
              color="#66FFDD"
              style={{ marginRight: 8 }}
            />

            <Text style={styles.sectionTitle}>
              VULNERABILITY EXPOSURE OVER TIME
            </Text>
          </View>

          <View style={[styles.chartWrapper, styles.fullWidthChart]}>
            <Pressable
              onPress={(event) => {
                const { locationX } = event.nativeEvent;

                const chartWidth = screenWidth - 40;
                const data = exposureData.datasets[0].data;
                const dataLength = data.length;

                const step = chartWidth / dataLength;

                let index = Math.floor(locationX / step);
                if (index < 0) index = 0;
                if (index > dataLength - 1) index = dataLength - 1;

                const value = data[index];
                const maxValue = Math.max(...data);
                const chartHeight = 280;
                const labelSpace = 30; // مساحة الأرقام تحت
                const usableHeight = chartHeight - labelSpace;

                const y = usableHeight - (value / maxValue) * usableHeight;

                // const y =
                //   chartHeight - (value / maxValue) * chartHeight;

                setTooltip({
                  label: exposureData.labels[index],
                  value,
                  x: index * step + step / 2,
                  y,
                });
              }}
              onPressOut={() => setTooltip(null)}
            >
              <LineChart
                data={exposureData}
                width={screenWidth - 40}
                height={280}
                withDots
                withInnerLines={false}
                withOuterLines={false}
                withVerticalLines={false}
                withHorizontalLines={true}
                withShadow
                fromZero={true}
                chartConfig={{
                  backgroundGradientFrom: "#0F1A2B",
                  backgroundGradientTo: "#0F1A2B",
                  decimalPlaces: 0,
                  color: () => "#03c79d",
                  labelColor: () => "#aaa", // خليها أفتح
                  fillShadowGradient: "#00ffcc",
                  fillShadowGradientOpacity: 0.35,
                  propsForDots: {
                    r: "4",
                    strokeWidth: "1",
                    stroke: "#00ffcc",
                  },
                }}
                bezier
                style={{ borderRadius: 0 }}
              />
            </Pressable>

            {tooltip && (
              <>
                {/* Vertical Line */}
                <View style={[styles.verticalLine, { left: tooltip.x }]} />

                {/* Active Dot */}
                <View
                  style={[
                    styles.activeDot,
                    {
                      left: tooltip.x - 6,
                      top: tooltip.y - 6,
                    },
                  ]}
                />

                {/* Tooltip */}
                <View
                  style={[
                    styles.tooltip,
                    {
                      left: tooltip.x - 60,
                      top: tooltip.y - 70,
                    },
                  ]}
                >
                  <Text style={styles.tooltipLabel}>{tooltip.label}</Text>
                  <Text style={styles.tooltipValue}>
                    threats : {tooltip.value}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>
      </View>
            {/* ===== TOP BOX ===== */}
      <View style={styles.topBox}>
        <Text style={styles.sectionTitle}>RISK SUMMARY</Text>

        <View style={[styles.card, styles.cardRed]}>
          <Text style={styles.cardLabel}>HIGH</Text>
          <Text style={styles.cardNumber}>{high}</Text>
        </View>

        <View style={[styles.card, styles.cardOrange]}>
          <Text style={styles.cardLabel}>MEDIUM</Text>
          <Text style={styles.cardNumber}>{medium}</Text>
        </View>

        <View style={[styles.card, styles.cardYellow]}>
          <Text style={styles.cardLabel}>LOW</Text>
          <Text style={styles.cardNumber}>{low}</Text>
        </View>

        <View style={[styles.card, styles.cardGreen]}>
          <Text style={styles.cardLabel}>INFO</Text>
          <Text style={styles.cardNumber}>{info}</Text>
        </View>
      </View>
              <View style={styles.aiCard}>
  <View style={styles.aiHeader}>
    <View style={styles.aiIconBox}>
      <Ionicons name="flash-outline" size={22} color="#0F1A2B" />
    </View>

    <View>
      <Text style={styles.aiTitle}>AI INSIGHT</Text>
      <Text style={styles.aiSub}>GENERATOR</Text>
    </View>
  </View>

  <Text style={styles.aiDescription}>
    Click the button below to generate a comprehensive technical report via
    Black Cat AI.
  </Text>

  <Pressable style={styles.aiButton}>
    <Text style={styles.aiButtonText}>GENERATE AI REPORT</Text>
    <Ionicons name="chevron-forward" size={18} color="#0F1A2B" />
  </Pressable>

<View style={styles.aiFooter}>
  <View style={styles.footerItem}>
    <Text style={styles.footerLabel}>ACCURACY</Text>
    <Text style={styles.footerValue}>98.3%</Text>
  </View>

  <View style={styles.footerItem}>
    <Text style={styles.footerLabel}>CONFIDENCE</Text>
    <Text style={styles.footerValue}>Very High</Text>
  </View>

  <View style={styles.footerItem}>
    <Text style={styles.footerLabel}>TIME</Text>
    <Text style={styles.footerValue}>1800.7s</Text>
  </View>
</View>

</View>

    </ScrollView>
  );
}

function AlertCard({ title, percent, color, count }: any) {
  return (
    <View style={styles.alertCard}>
      <Text style={styles.alertTitle}>{title}</Text>

      <View style={styles.row}>
        <Text style={styles.percent}>{percent}%</Text>
        <Text style={styles.count}>count: {count}</Text>
      </View>

      <View style={styles.progressBackground}>
        <View
          style={[
            styles.progressFill,
            { width: `${percent}%`, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  content: {
    padding: 20,
    paddingTop: 120,
    paddingBottom: 40,
  },

  topBox: {
    backgroundColor: "#0F1A2B",
    padding: 20,
    borderRadius: 24,
    marginBottom: 10,
    marginTop: 30,
  },

  bottomBox: {
    backgroundColor: "#0F1A2B",
    padding: 20,
    borderRadius: 24,
  },

  chartBox: {
    marginTop: 30,
  },

  fullWidthChart: {
    marginHorizontal: -20,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 1,
    marginBottom: 15,
  },

  accent: {
    color: Colors.primary,
  },

  card: {
    borderWidth: 2,
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
  },

  cardRed: { borderColor: "#FF3B30" },
  cardYellow: { borderColor: "#FFC107" },
  cardGreen: { borderColor: "#34C759" },
  cardOrange: { borderColor: "#FF9500" },

  cardLabel: {
    color: "#aaa",
    marginBottom: 8,
  },

  cardNumber: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
  },

  chartContainer: {
    alignItems: "center",
    marginBottom: 30,
  },

  legendText: {
    color: "#aaa",
    marginTop: 15,
  },

  alertCard: {
    backgroundColor: "#111C2E",
    padding: 18,
    borderRadius: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(0, 255, 204, 0.25)",
    shadowColor: "#00ffcc80",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },

  alertTitle: {
    color: "#888",
    marginBottom: 10,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  percent: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },

  count: {
    color: "#999",
  },

  progressBackground: {
    height: 8,
    backgroundColor: "#1E2A3A",
    borderRadius: 10,
    marginTop: 12,
  },

  progressFill: {
    height: 8,
    borderRadius: 10,
  },
  chartWrapper: {
    position: "relative",
  },

  tooltip: {
    position: "absolute",
    backgroundColor: "#111C2E",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#00ffcc",
  },

  tooltipLabel: {
    color: "#888",
    fontSize: 12,
  },

  tooltipValue: {
    color: "#00ffcc",
    fontWeight: "bold",
    fontSize: 14,
  },

  verticalLine: {
    position: "absolute",
    width: 1,
    height: 250,
    backgroundColor: "rgba(255,255,255,0.4)",
  },

  activeDot: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#00ffcc",
    borderWidth: 2,
    borderColor: "#0F1A2B",
    shadowColor: "#00ffcc",
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
  aiCard: {
  marginTop: 30,
  backgroundColor: "#0F1A2B",
  borderRadius: 28,
  padding: 22,
  borderWidth: 1.5,
  borderColor: "#00ffcc",
},

aiHeader: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 18,
},

aiIconBox: {
  width: 48,
  height: 48,
  borderRadius: 16,
  backgroundColor: "#66FFDD",
  alignItems: "center",
  justifyContent: "center",
  marginRight: 14,
},

aiTitle: {
  color: "#fff",
  fontSize: 18,
  fontWeight: "bold",
},

aiSub: {
  color: "#00ffcc",
  fontSize: 12,
  letterSpacing: 2,
},

aiDescription: {
  color: "#9CA3AF",
  lineHeight: 20,
  marginBottom: 22,
},

aiButton: {
  backgroundColor: "#66FFDD",
  paddingVertical: 16,
  borderRadius: 18,
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: 25,
},

aiButtonText: {
  color: "#0F1A2B",
  fontWeight: "bold",
  marginRight: 6,
},

aiFooter: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
},
footerItem: {
  alignItems: "center",
  flex: 1,
},

footerLabel: {
  color: "#888",
  fontSize: 12,
  marginBottom: 4,
},

footerValue: {
  color: "#fff",
  fontSize: 18,
  fontWeight: "bold",
},

chatCircle: {
  width: 50,
  height: 50,
  borderRadius: 25,
  backgroundColor: "#66FFDD",
  alignItems: "center",
  justifyContent: "center",
},

});
