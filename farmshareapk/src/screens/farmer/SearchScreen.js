import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { useTranslation } from "react-i18next";
import { bdLocations } from "../../data/bdLocation"; // ✅ FIXED IMPORT

export default function SearchScreen({ navigation }) {
  const { t, i18n } = useTranslation();

  const [machineType, setMachineType] = useState(null);
  const [district, setDistrict] = useState(null);
  const [upazila, setUpazila] = useState(null);
  const [upazilaList, setUpazilaList] = useState([]);

  // MACHINE TYPES
  const machineTypes = [
    { label: t("tractor"), value: "tractor" },
    { label: t("powertiller"), value: "powertiller" },
    { label: t("reaper"), value: "reaper" },
    { label: t("bed_planter"), value: "bed_planter" },
    { label: t("combine_harvester"), value: "combine_harvester" },
    { label: t("thresher"), value: "thresher" },
    { label: t("sprayer"), value: "sprayer" }
  ];

  // DISTRICT LIST (Object থেকে)
  const districtList = Object.keys(bdLocations).map((key) => ({
    label: i18n.language === "bn" ? bdLocations[key].bn : key,
    value: key
  }));

  // DISTRICT CHANGE
  const handleDistrictChange = (item) => {
    setDistrict(item.value);
    setUpazila(null);

    const selected = bdLocations[item.value];

    if (!selected) {
      setUpazilaList([]);
      return;
    }

    const upazilas = selected.upazilas.map((u) => ({
      label: i18n.language === "bn" ? u.bn : u.en,
      value: u.en
    }));

    setUpazilaList(upazilas);
  };

  // LANGUAGE CHANGE হলে update
  useEffect(() => {
    if (district) {
      handleDistrictChange({ value: district });
    }
  }, [i18n.language]);

  // SEARCH BUTTON
  const handleSearch = () => {
    if (!machineType || !district || !upazila) {
      Alert.alert(t("error"), t("select_all_fields"));
      return;
    }

    navigation.navigate("SearchResult", {
      machineType,
      district,
      upazila
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{t("farm_machine")}</Text>

      {/* MACHINE TYPE */}
      <Dropdown
        style={styles.dropdown}
        data={machineTypes}
        labelField="label"
        valueField="value"
        placeholder={t("select_machine_type")}
        value={machineType}
        onChange={(item) => setMachineType(item.value)}
      />

      {/* DISTRICT */}
      <Dropdown
        style={styles.dropdown}
        data={districtList}
        labelField="label"
        valueField="value"
        placeholder={t("select_district")}
        value={district}
        onChange={handleDistrictChange}
      />

      {/* UPAZILA */}
      <Dropdown
        style={styles.dropdown}
        data={upazilaList}
        labelField="label"
        valueField="value"
        placeholder={t("select_upazila")}
        value={upazila}
        onChange={(item) => setUpazila(item.value)}
      />

      {/* SEARCH BUTTON */}
      <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
        <Text style={styles.searchText}>{t("search")}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff"
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center"
  },
  dropdown: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 20
  },
  searchBtn: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 10,
    alignItems: "center"
  },
  searchText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600"
  }
});