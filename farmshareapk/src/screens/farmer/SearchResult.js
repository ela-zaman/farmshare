import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { useTranslation } from "react-i18next";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";

import { db, auth } from "../../firebase/firebaseConfig";
import { bdLocations } from "../../data/bdLocation";
import { useNavigation } from "@react-navigation/native";

export default function SearchResult({ route }) {
  const { t, i18n } = useTranslation();
  const { machineType } = route.params || {};
  const navigation = useNavigation();

  const [nearbyMachines, setNearbyMachines] = useState([]);
  const [districtMachines, setDistrictMachines] = useState([]);
  const [loading, setLoading] = useState(true);

  const [userDistrict, setUserDistrict] = useState("");
  const [userUpazila, setUserUpazila] = useState("");

  const isBn = i18n.language === "bn";

  const normalize = (text) => {
    if (!text) return "";
    return text.toString().trim().toLowerCase();
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = auth.currentUser;

      if (!user) {
        setLoading(false);
        return;
      }

      const userSnap = await getDoc(doc(db, "users", user.uid));

      if (userSnap.exists()) {
        const data = userSnap.data();

        setUserDistrict(data.district || "");
        setUserUpazila(data.upazila || "");

        await fetchMachines(
          data.district,
          data.upazila
        );
      }
    } catch (err) {
      console.log("LOAD ERROR:", err);
      setLoading(false);
    }
  };

  const fetchMachines = async (district, upazila) => {
    try {
      /*
       * ----------------------------------------------------
       * 1. MACHINES IN USER'S UPAZILA
       * ----------------------------------------------------
       */

      const qUpazila = query(
        collection(db, "machines"),
        where("machineType", "==", machineType),
        where("district", "==", district),
        where("upazila", "==", upazila)
      );

      const upazilaSnap = await getDocs(qUpazila);

      const upazilaData = upazilaSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      /*
       * ----------------------------------------------------
       * 2. ALL MACHINES IN USER'S DISTRICT
       * ----------------------------------------------------
       */

      const qDistrict = query(
        collection(db, "machines"),
        where("machineType", "==", machineType),
        where("district", "==", district)
      );

      const districtSnap = await getDocs(qDistrict);

      const districtData = districtSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      /*
       * ----------------------------------------------------
       * 3. REMOVE MACHINES FROM USER'S UPAZILA
       *
       * Only machines from OTHER upazilas remain here.
       * ----------------------------------------------------
       */

      const outsideUpazilaData = districtData.filter(
        (machine) =>
          normalize(machine.upazila) !== normalize(upazila)
      );

      setNearbyMachines(upazilaData);
      setDistrictMachines(outsideUpazilaData);

    } catch (error) {
      console.log("ERROR FETCHING MACHINES:", error);

      setNearbyMachines([]);
      setDistrictMachines([]);
    } finally {
      setLoading(false);
    }
  };

  // Default image by machine type
  const getDefaultMachineImage = (type) => {
    switch (normalize(type)) {
      case "tractor":
        return require("../../../assets/images/Machines/tractor.png");

      case "powertiller":
        return require("../../../assets/images/Machines/powertiller.png");

      case "reaper":
        return require("../../../assets/images/Machines/reaper.png");

      case "sprayer":
        return require("../../../assets/images/Machines/sprayer.jpg");

      case "thresher":
        return require("../../../assets/images/Machines/thresher.png");

      case "combine harvester":
        return require("../../../assets/images/Machines/combine harvester.png");

      default:
        return require("../../../assets/images/add.png");
    }
  };

  // Firebase image OR default image
  const getMachineImage = (item) => {
    const firebaseImage =
      item?.imageUrl ||
      item?.image ||
      item?.photo ||
      item?.machineImage;

    if (
      firebaseImage &&
      typeof firebaseImage === "string" &&
      firebaseImage.trim() !== ""
    ) {
      return {
        uri: firebaseImage,
      };
    }

    return getDefaultMachineImage(item.machineType);
  };

  const getDistrictLabel = (districtKey) => {
    if (!districtKey) return "";

    return isBn
      ? bdLocations[districtKey]?.bn || districtKey
      : districtKey;
  };

  const getUpazillaLabel = (districtKey, upazilaEn) => {
    if (!districtKey || !upazilaEn) return "";

    const districtData = bdLocations[districtKey];

    const upazilaObj = districtData?.upazilas?.find(
      (u) => normalize(u?.en) === normalize(upazilaEn)
    );

    return isBn
      ? upazilaObj?.bn || upazilaEn
      : upazilaObj?.en || upazilaEn;
  };

  const formatTaka = (amount) => {
    if (!amount) {
      return isBn ? "০ টাকা" : "0 Taka";
    }

    return isBn
      ? `${amount} টাকা`
      : `${amount} Taka`;
  };

  // Small pill-shaped divider used to separate blocks of info inside the glass card
  const ShapeDivider = () => (
    <View style={styles.dividerRow}>
      <View style={styles.dividerShape} />
    </View>
  );

  // Thin vertical divider used between the price chips
  const VerticalDivider = () => <View style={styles.verticalDivider} />;

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() =>
        navigation.navigate("BookingDetails", {
          machine: item,
        })
      }
    >
      {/* ---- Image on top ---- */}
      <Image
        source={getMachineImage(item)}
        style={styles.image}
        resizeMode="cover"
      />

      {/* ---- Liquid glass info panel, floating over the image ---- */}
      <View style={styles.glassWrapper}>
        <BlurView
          intensity={55}
          tint="light"
          experimentalBlurMethod="dimezisBlurView"
          style={styles.glassPanel}
        >
          {/* subtle glossy highlight across the top of the glass */}
          <LinearGradient
            colors={[
              "rgba(255,255,255,0.55)",
              "rgba(255,255,255,0.12)",
              "rgba(255,255,255,0)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />

          <Text style={styles.title} numberOfLines={1}>
            {t(item.machineType)}
          </Text>

          <ShapeDivider />

          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={14} color="#3a2a5d" />
              <Text style={styles.text} numberOfLines={1}>
                <Text style={styles.label}>{t("provider")}: </Text>
                {item.providerName || "Unknown"}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="construct-outline" size={14} color="#3a2a5d" />
              <Text style={styles.text} numberOfLines={1}>
                <Text style={styles.label}>{t("machine_model")}: </Text>
                {item.machineModel || "N/A"}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={14} color="#3a2a5d" />
              <Text style={styles.text} numberOfLines={1}>
                <Text style={styles.label}>{t("phone")}: </Text>
                {item.phone || "N/A"}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={14} color="#3a2a5d" />
              <Text style={styles.text} numberOfLines={1}>
                <Text style={styles.label}>{t("district")}: </Text>
                {getDistrictLabel(item.district)}
                {getUpazillaLabel(item.district, item.upazila)
                  ? `, ${getUpazillaLabel(item.district, item.upazila)}`
                  : ""}
                {item.village ? `, ${item.village}` : ""}
              </Text>
            </View>
          </View>

          <ShapeDivider />

          <View style={styles.priceRow}>
            <View style={styles.priceChip}>
              <Text style={styles.priceLabel}>{t("charge_per_decimal")}</Text>
              <Text style={styles.priceValue}>
                {formatTaka(item.chargePerDecimal)}
              </Text>
            </View>

            <VerticalDivider />

            <View style={styles.priceChip}>
              <Text style={styles.priceLabel}>{t("charge_per_bigha")}</Text>
              <Text style={styles.priceValue}>
                {formatTaka(item.chargePerBigha)}
              </Text>
            </View>

            <VerticalDivider />

            <View style={styles.priceChip}>
              <Text style={styles.priceLabel}>{t("charge_per_hour")}</Text>
              <Text style={styles.priceValue}>
                {formatTaka(item.chargePerHour)}
              </Text>
            </View>
          </View>
        </BlurView>
      </View>
    </TouchableOpacity>
  );

  const renderSectionHeader = (title) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>
        {title}
      </Text>
    </View>
  );

  /*
   * Combine both sections into one FlatList.
   */
  const listData = [
    {
      type: "header",
      id: "nearby-header",
      title: isBn
        ? `${getUpazillaLabel(userDistrict, userUpazila)} এলাকায় মেশিন`
        : `Machines in your Upazila`,
    },

    ...nearbyMachines.map((machine) => ({
      type: "machine",
      id: machine.id,
      machine,
    })),

    {
      type: "header",
      id: "district-header",
      title: isBn
        ? `${getDistrictLabel(userDistrict)} জেলার অন্যান্য মেশিন`
        : `Machine Outside your Upazila but in ${getDistrictLabel(
            userDistrict
          )}`,
    },

    ...districtMachines.map((machine) => ({
      type: "machine",
      id: machine.id,
      machine,
    })),
  ];

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>{t("loading")}</Text>
      </View>
    );
  }

  if (
    nearbyMachines.length === 0 &&
    districtMachines.length === 0
  ) {
    return (
      <View style={styles.center}>
        <Text>{t("no_data")}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={listData}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => {
        if (item.type === "header") {
          return renderSectionHeader(item.title);
        }

        return renderItem({
          item: item.machine,
        });
      }}
      contentContainerStyle={{
        padding: 15,
        paddingBottom: 200,
      }}
    />
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    marginTop: 10,
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "#542e88",
    borderRadius: 10,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
  },

  card: {
    borderRadius: 24,
    marginBottom: 26,
    backgroundColor: "transparent",
    shadowColor: "#3a2a5d",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 6,
  },

  image: {
    width: "100%",
    height: 170,
    borderRadius: 24,
  },

  // Wrapper pulls the glass panel up so it overlaps the bottom of the image
  glassWrapper: {
    marginTop: -34,
    paddingHorizontal: 10,
  },

  glassPanel: {
    borderRadius: 20,
    padding: 14,
    overflow: "hidden",
    backgroundColor:
      Platform.OS === "android" ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.28)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2b1b47",
  },

  // Small shape divider between info blocks
  dividerRow: {
    alignItems: "flex-start",
    marginVertical: 8,
  },

  dividerShape: {
    width: 34,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#542e88",
    opacity: 0.5,
  },

  infoGrid: {
    gap: 4,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },

  text: {
    fontSize: 13,
    marginLeft: 6,
    color: "#3a2a5d",
    flexShrink: 1,
  },

  label: {
    fontWeight: "700",
    color: "#2b1b47",
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  priceChip: {
    flex: 1,
    alignItems: "center",
  },

  priceLabel: {
    fontSize: 10,
    color: "#5b4b7a",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },

  priceValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2b1b47",
    marginTop: 2,
  },

  verticalDivider: {
    width: 1,
    height: 26,
    backgroundColor: "rgba(84,46,136,0.25)",
    marginHorizontal: 6,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});