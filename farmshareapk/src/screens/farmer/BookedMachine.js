import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
} from "react-native";
import { useTranslation } from "react-i18next";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db, auth } from "../../firebase/authService";

export default function BookedMachine({ route }) {
  const { t } = useTranslation();

  const machineTypeParam = route?.params?.machineType ?? "unknown";

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const safe = (v) => (!v ? t("no_data") : String(v));

  const isPastBooking = (dateValue) => {
    if (!dateValue) return false;

    const bookingDate = new Date(dateValue);
    const today = new Date();

    today.setHours(0, 0, 0, 0);
    bookingDate.setHours(0, 0, 0, 0);

    return bookingDate < today;
  };

  useEffect(() => {
    fetchBookings();
  }, [machineTypeParam]);

  const fetchBookings = async () => {
    try {
      const q = query(
        collection(db, "bookings"),
        where("machineType", "==", machineTypeParam),
        where("status", "==", "accepted")
      );

      const snapshot = await getDocs(q);

      const list = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();

          let providerName = "Unknown";
          let providerPhone = "N/A";
          let providerAddress = "N/A";

          if (data.providerId) {
            const userSnap = await getDoc(doc(db, "users", data.providerId));
            if (userSnap.exists()) {
              const u = userSnap.data();
              providerName = u.name || "Unknown";
              providerPhone = u.phone || "N/A";
              providerAddress = u.address || "N/A";
            }
          }

          return {
            id: docSnap.id,
            providerName,
            providerPhone,
            providerAddress,
            machineType: data.machineType,
            landSize: data.landSize,
            tillageAmount: data.tillageAmount,
            chargeType: data.chargeType,
            date: data.dates?.[0] || "",
            timeSlots: data.slots?.join(", ") || "",
            totalTaka: data.totalCharge || 0,
          };
        })
      );

      // ✅ SORT: upcoming/today first, expired last
      const sortedList = list.sort((a, b) => {
        const aExpired = isPastBooking(a.date);
        const bExpired = isPastBooking(b.date);

        if (aExpired === bExpired) return 0;
        if (aExpired && !bExpired) return 1;
        return -1;
      });

      setBookings(sortedList);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const handleCall = (phone) => {
    if (!phone || phone === "N/A") return;
    Linking.openURL(`tel:${phone}`);
  };

  const handleAddContact = async (item) => {
    try {
      const uid = auth.currentUser.uid;

      await setDoc(doc(db, "contacts", `${uid}_${item.id}`), {
        userId: uid,
        name: item.providerName,
        phone: item.providerPhone,
        address: item.providerAddress,
        machineType: item.machineType,
        createdAt: new Date().toISOString(),
      });

      alert(t("contact_saved") || "Contact saved!");
    } catch (err) {
      console.log(err);
      alert("Error saving contact");
    }
  };

  const getImage = (type) => {
    const t = type?.toLowerCase();

    switch (t) {
      case "tractor":
        return require("../../../assets/images/Machines/tractor.png");
      case "powertiller":
      case "power tiller":
        return require("../../../assets/images/Machines/powertiller.png");
      case "reaper":
        return require("../../../assets/images/Machines/reaper.png");
      case "bed planter":
        return require("../../../assets/images/Machines/bed planter.png");
      case "combine harvester":
        return require("../../../assets/images/Machines/combine harvester.png");
      case "thresher":
        return require("../../../assets/images/Machines/thresher.png");
      case "sprayer":
        return require("../../../assets/images/Machines/sprayer.jpg");
      default:
        return require("../../../assets/images/add.png");
    }
  };

  const renderItem = ({ item }) => {
    const expired = isPastBooking(item.date);

    return (
      <View
        style={[
          styles.card,
          expired ? styles.redCard : styles.greenCard,
        ]}
      >
        <Image source={getImage(item.machineType)} style={styles.image} />

        <View style={styles.content}>
          <Text style={styles.title}>{t("service_provider")} : {safe(item.providerName)}</Text>

          <Text style={styles.phone}>
            📞 {t("phone")} : {safe(item.providerPhone)}
          </Text>

          <Text style={styles.text}>
            {t("machine_type")}: {t(item.machineType)}
          </Text>

          <Text style={styles.text}>
            {t("land_size")}: {safe(item.landSize)}
          </Text>

          <Text style={styles.text}>
            {t("tillage_number")}: {safe(item.tillageAmount)}
          </Text>

          <Text style={styles.text}>
            {t("type")}: {t(item.chargeType)}
          </Text>

          <Text style={styles.text}>
            {t("address")}: {safe(item.providerAddress)}
          </Text>

          <Text style={styles.text}>
            {t("time_slots")}: {safe(item.timeSlots)}
          </Text>

          <Text style={styles.total}>
            {t("total_charge")}: ৳ {item.totalTaka}
          </Text>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => handleCall(item.providerPhone)}
          >
            <Text style={styles.icon}>📞</Text>
            <Text style={styles.btnText}>{t("call")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btn}
            onPress={() => handleAddContact(item)}
          >
            <Text style={styles.icon}>➕</Text>
            <Text style={styles.btnText}>{t("add_contact")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="green" />
      </View>
    );
  }

  return (
    <FlatList
      data={bookings}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 15 }}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    borderRadius: 20,
    padding: 15,
    marginBottom: 20,
    alignItems: "center",
    elevation: 5,
  },

  greenCard: {
    backgroundColor: "rgba(0,150,0,0.10)",
  },

  redCard: {
    backgroundColor: "rgba(255,0,0,0.10)",
  },

  image: {
    width: 110,
    height: 110,
    resizeMode: "contain",
    marginBottom: 10,
  },

  content: {
    alignItems: "center",
  },

  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },

  phone: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },

  text: {
    fontSize: 13,
    textAlign: "center",
    marginVertical: 2,
  },

  total: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 8,
    color: "green",
  },

  buttonRow: {
    flexDirection: "row",
    marginTop: 15,
    gap: 30,
  },

  btn: {
    alignItems: "center",
  },

  icon: {
    fontSize: 22,
  },

  btnText: {
    fontSize: 12,
    marginTop: 3,
    fontWeight: "600",
  },
});