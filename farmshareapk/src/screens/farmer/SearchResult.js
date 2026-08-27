import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from "react-native";

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

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() =>
        navigation.navigate("BookingDetails", {
          machine: item,
        })
      }
    >
      <Image
        source={getMachineImage(item)}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.info}>
        <Text style={styles.title}>
          {t(item.machineType)}
        </Text>

        <Text style={styles.text}>
          {t("provider")}: {item.providerName || "Unknown"}
        </Text>

        <Text style={styles.text}>
          {t("phone")}: {item.phone || "N/A"}
        </Text>

        <Text style={styles.text}>
          {t("district")}: {getDistrictLabel(item.district)}
        </Text>

        <Text style={styles.text}>
          {t("upazilla")}:{" "}
          {getUpazillaLabel(
            item.district,
            item.upazila
          )}
        </Text>

        <Text style={styles.text}>
          {t("village")}: {item.village || ""}
        </Text>

        <Text style={styles.text}>
          {t("charge_per_decimal")}:{" "}
          {formatTaka(item.chargePerDecimal)}
        </Text>

        <Text style={styles.text}>
          {t("charge_per_bigha")}:{" "}
          {formatTaka(item.chargePerBigha)}
        </Text>

        <Text style={styles.text}>
          {t("charge_per_hour")}:{" "}
          {formatTaka(item.chargePerHour)}
        </Text>
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
    flexDirection: "row",
    backgroundColor: "#e6f2ff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
  },

  image: {
    width: 90,
    height: 90,
    borderRadius: 10,
    marginRight: 12,
  },

  info: {
    flex: 1,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },

  text: {
    fontSize: 14,
    marginBottom: 2,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});