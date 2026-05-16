// import { Colors } from "@/constants/colors";
// import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
// import { usePathname, useRouter } from "expo-router";
// import { Pressable, StyleSheet, Text, View } from "react-native";

// type Props = {
//   onClose: () => void;
// };

// export default function SideMenu({ onClose }: Props) {
//   const router = useRouter();
//   const pathname = usePathname();

//   return (
//     <View style={styles.overlay}>
//       <View style={styles.menu}>
//         {/* TOP BAR */}
//         <View style={styles.top}>
//           <View style={styles.logoRow}>
//             <View style={{ flexDirection: "row", alignItems: "center" }}>
//               <MaterialCommunityIcons
//                 name="shield-outline"
//                 size={26}
//                 color="#00ffcc"
//               />

//               <MaterialCommunityIcons
//                 name="cat"
//                 size={20}
//                 color="#00ffcc"
//                 style={{ marginLeft: -18 }}
//               />
//             </View>

//             <Text style={styles.logo}>
//               BLACK<Text style={styles.accent}>CAT</Text>
//             </Text>
//           </View>

//           <Pressable onPress={onClose}>
//             <Text style={styles.close}>✕</Text>
//           </Pressable>
//         </View>

//         {/* HOME */}
//         <Pressable
//           style={styles.itemRow}
//           onPress={() => {
//             onClose();
//             router.push("/");
//           }}
//         >
//           <Ionicons name="home-outline" size={18} color={Colors.primary} />
//           <Text style={styles.item}>Home</Text>
//         </Pressable>

//         {/* SCANNER */}
//         <Pressable
//           style={styles.itemRow}
//           onPress={() => {
//             onClose();
//             router.push("/tools/scanner");
//           }}
//         >
//           <Ionicons name="scan-outline" size={18} color={Colors.textPrimary} />
//           <Text style={styles.item}>Scanner</Text>
//         </Pressable>

//         {/* AI ASSISTANT يظهر بس في الصفحة الرئيسية */}
// {pathname !== "/ai/assistant" && (
//   <Pressable
//     style={styles.itemRow}
//     onPress={() => {
//       router.push("/ai/assistant");
//       setTimeout(() => onClose(), 100);
//     }}
//   >
//     <Ionicons
//       name="sparkles-outline"
//       size={18}
//       color={Colors.textPrimary}
//     />
//     <Text style={styles.item}>AI Assistant</Text>
//   </Pressable>
// )}

//         {/* CONTACT */}
//         <View style={styles.itemRow}>
//           <Ionicons name="mail-outline" size={18} color={Colors.textPrimary} />
//           <Text style={styles.item}>Contact</Text>
//         </View>

//         {/* ACTIONS */}
//         <View style={styles.actions}>
//           <Pressable
//             style={styles.loginRow}
//             onPress={() => {
//               onClose();
//               router.push("/auth/login");
//             }}
//           >
//             <Ionicons
//               name="log-in-outline"
//               size={18}
//               color={Colors.textPrimary}
//             />
//             <Text style={styles.login}>Login</Text>
//           </Pressable>

//           <Pressable
//             style={styles.register}
//             onPress={() => {
//               onClose();
//               router.push("/auth/register");
//             }}
//           >
//             <Ionicons name="person-add-outline" size={18} color="#00382C" />
//             <Text style={styles.registerText}>Register</Text>
//           </Pressable>
//         </View>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   overlay: {
//     position: "absolute",
//     top: 2,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: "rgba(0,0,0,0.65)",
//     zIndex: 200,
//   },

//   menu: {
//     backgroundColor: Colors.card,
//     padding: 28,
//     minHeight: "45%",
//     borderBottomLeftRadius: 30,
//     borderBottomRightRadius: 30,
//     borderWidth: 1,
//     borderColor: Colors.border,
//   },

//   top: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 30,
//   },

//   logo: {
//     color: Colors.textPrimary,
//     fontSize: 24,
//     fontWeight: "600",
//     letterSpacing: 1.5,
//   },

//   logoRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginLeft: -10,
//   },

//   accent: {
//     color: Colors.primary,
//   },

//   close: {
//     color: Colors.textPrimary,
//     fontSize: 26,
//   },

//   itemRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//     paddingVertical: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: Colors.border,
//   },

//   item: {
//     color: Colors.textPrimary,
//     fontSize: 16,
//     fontWeight: "400",
//     letterSpacing: 1.2,
//   },

//   actions: {
//     marginTop: 30,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },

//   loginRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//   },

//   login: {
//     color: Colors.textPrimary,
//     fontSize: 15,
//     fontWeight: "400",
//     letterSpacing: 1.2,
//   },

//   register: {
//     backgroundColor: Colors.primary,
//     paddingVertical: 14,
//     paddingHorizontal: 28,
//     borderRadius: 16,
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//   },

//   registerText: {
//     color: "#00382C",
//     fontWeight: "600",
//     letterSpacing: 1,
//   },
// });
