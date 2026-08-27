import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  Modal,
  Animated,
  Easing
} from "react-native";

import { useTranslation } from "react-i18next";

import {
  collection,
  addDoc,
  doc,
  getDoc
} from "firebase/firestore";

import { db, auth } from "../../firebase/firebaseConfig";


// ============================================================
// BookingSummary
// ============================================================

export default function BookingSummary({ route, navigation }) {

  const { t, i18n } = useTranslation();

  const isBn = i18n.language === "bn";

  const {
    machine,
    selectedDate,
    selectedSlots = [],
    slots = [],
    tillageAmount,
    landSize,
    landAddress,
    chargeType
  } = route.params || {};


  const [userInfo, setUserInfo] = useState(null);

  const [totalCharge, setTotalCharge] = useState(0);

  const [chargePerDecimal, setChargePerDecimal] = useState(0);

  const [chargePerBigha, setChargePerBigha] = useState(0);

  const [totalHours, setTotalHours] = useState(0);

  const [slotLabels, setSlotLabels] = useState([]);


  // ==========================================================
  // MACHINE IMAGE
  // ==========================================================

  const [machineImage, setMachineImage] = useState(null);

  const [loadingImage, setLoadingImage] = useState(true);


  // ==========================================================
  // SUCCESS MODAL
  // ==========================================================

  const [successModalVisible, setSuccessModalVisible] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);


  const successScale =
    useState(new Animated.Value(0.7))[0];

  const successOpacity =
    useState(new Animated.Value(0))[0];

  const textTranslateY =
    useState(new Animated.Value(20))[0];


  const user = auth.currentUser;


  // ==========================================================
  // DEFAULT MACHINE IMAGE
  // ==========================================================

  const getDefaultMachineImage = (type) => {

    if (!type) {
      return require("../../../assets/images/add.png");
    }

    const key = type
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s/g, "_");


    const IMAGE_MAP = {

      tractor:
        require("../../../assets/images/Machines/tractor.png"),

      powertiller:
        require("../../../assets/images/Machines/powertiller.png"),

      reaper:
        require("../../../assets/images/Machines/reaper.png"),

      bed_planter:
        require("../../../assets/images/Machines/bed planter.png"),

      combine_harvester:
        require("../../../assets/images/Machines/combine harvester.png"),

      thresher:
        require("../../../assets/images/Machines/thresher.png"),

      sprayer:
        require("../../../assets/images/Machines/sprayer.jpg")
    };


    return (
      IMAGE_MAP[key] ||
      require("../../../assets/images/add.png")
    );
  };


  // ==========================================================
  // BANGLA NUMBER
  // ==========================================================

  const toBanglaNumber = (num) => {

    const bn = [
      "০",
      "১",
      "২",
      "৩",
      "৪",
      "৫",
      "৬",
      "৭",
      "৮",
      "৯"
    ];


    return num
      .toString()
      .split("")
      .map((d) => bn[d] || d)
      .join("");
  };


  // ==========================================================
  // FETCH MACHINE IMAGE FROM FIREBASE
  //
  // Priority:
  // 1. photo
  // 2. imageUrl
  // 3. image
  // 4. machineImage
  // 5. photoUrl.secure_url
  // 6. photoUrl
  //
  // If none exists → default image
  // ==========================================================

  useEffect(() => {

    const fetchMachineImage = async () => {

      if (!machine?.id) {

        setMachineImage(
          getDefaultMachineImage(
            machine?.machineType
          )
        );

        setLoadingImage(false);

        return;
      }


      try {

        setLoadingImage(true);


        const machineRef = doc(
          db,
          "machines",
          machine.id
        );


        const machineSnap = await getDoc(
          machineRef
        );


        if (machineSnap.exists()) {

          const data = machineSnap.data();


          console.log(
            "BOOKING SUMMARY MACHINE DATA:",
            data
          );


          // ==================================================
          // FIREBASE IMAGE
          // ==================================================

          const firebaseImage =
            data?.photo ||
            data?.imageUrl ||
            data?.image ||
            data?.machineImage ||
            data?.photoUrl?.secure_url ||
            data?.photoUrl ||
            null;


          console.log(
            "BOOKING SUMMARY FIREBASE IMAGE:",
            firebaseImage
          );


          // ==================================================
          // FIREBASE IMAGE EXISTS
          // ==================================================

          if (
            firebaseImage &&
            typeof firebaseImage === "string" &&
            firebaseImage.trim() !== ""
          ) {

            console.log(
              "USING FIREBASE MACHINE IMAGE"
            );


            setMachineImage({
              uri: firebaseImage.trim()
            });

          }


          // ==================================================
          // NO FIREBASE IMAGE
          // → DEFAULT IMAGE
          // ==================================================

          else {

            console.log(
              "NO FIREBASE IMAGE → USING DEFAULT IMAGE"
            );


            setMachineImage(
              getDefaultMachineImage(
                data?.machineType ||
                machine?.machineType
              )
            );
          }

        }


        // ====================================================
        // MACHINE DOCUMENT DOES NOT EXIST
        // ====================================================

        else {

          console.log(
            "MACHINE DOCUMENT NOT FOUND → DEFAULT IMAGE"
          );


          setMachineImage(
            getDefaultMachineImage(
              machine?.machineType
            )
          );
        }

      }


      // ======================================================
      // FIREBASE ERROR
      // ======================================================

      catch (error) {

        console.log(
          "MACHINE IMAGE FETCH ERROR:",
          error
        );


        // Still show default image

        setMachineImage(
          getDefaultMachineImage(
            machine?.machineType
          )
        );

      }


      finally {

        setLoadingImage(false);

      }

    };


    fetchMachineImage();

  }, [machine?.id]);


  // ==========================================================
  // FETCH USER
  // ==========================================================

  useEffect(() => {

    const fetchUser = async () => {

      if (!user?.uid) return;


      try {

        const snap = await getDoc(
          doc(db, "users", user.uid)
        );


        if (snap.exists()) {

          setUserInfo({
            uid: user.uid,
            ...snap.data()
          });

        }

      }

      catch (err) {

        console.log(
          "USER FETCH ERROR:",
          err
        );

      }

    };


    fetchUser();

  }, [user]);


  // ==========================================================
  // SLOT LABEL
  // ==========================================================

  const getSlotLabel = (slot) => {

    if (!slot) return "";


    const labelsBn = {

      morning: "সকাল",

      noon: "দুপুর",

      afternoon: "বিকাল",

      evening: "সন্ধ্যা"

    };


    const labelText = isBn
      ? labelsBn[slot.label] || slot.label
      : slot.label;


    const formatHour = (h) => {

      let hour = h % 12;


      if (hour === 0) {
        hour = 12;
      }


      return isBn
        ? toBanglaNumber(hour)
        : hour;

    };


    return `${labelText} ${formatHour(
      slot.start
    )}.00 - ${formatHour(
      slot.end
    )}.00 ${isBn ? "টা" : ""}`;

  };


  // ==========================================================
  // LOAD CHARGES + CALCULATE TOTAL
  // ==========================================================

  useEffect(() => {

    const loadCharges = async () => {

      if (!machine?.id) return;


      try {

        const snap = await getDoc(
          doc(db, "machines", machine.id)
        );


        if (snap.exists()) {

          const data = snap.data();


          const perDecimal =
            Number(data?.chargePerDecimal) || 0;


          const perBigha =
            Number(data?.chargePerBigha) || 0;


          setChargePerDecimal(
            perDecimal
          );


          setChargePerBigha(
            perBigha
          );


          const slotCount =
            selectedSlots.length;


          let baseCharge = 0;


          if (
            chargeType === "per_decimal"
          ) {

            baseCharge =
              perDecimal *
              Number(landSize || 0) *
              Number(tillageAmount || 0);

          }

          else if (
            chargeType === "per_bigha"
          ) {

            baseCharge =
              perBigha *
              Number(landSize || 0) *
              Number(tillageAmount || 0);

          }

          else {

            // Keep existing behavior for other types
            baseCharge = 0;

          }


          const total =
            baseCharge * slotCount;


          setTotalCharge(total);


          // ==================================================
          // SLOT LABELS
          // ==================================================

          const labels =
            selectedSlots.map((id) => {

              const slot =
                slots.find(
                  (s) => s.id === id
                );


              return slot
                ? getSlotLabel(slot)
                : id;

            });


          setSlotLabels(labels);


          // ==================================================
          // TOTAL HOURS
          // ==================================================

          const hours =
            selectedSlots.reduce(
              (sum, id) => {

                const slot =
                  slots.find(
                    (s) => s.id === id
                  );


                return slot
                  ? sum +
                    (slot.end - slot.start)
                  : sum;

              },
              0
            );


          setTotalHours(hours);

        }

      }

      catch (err) {

        console.log(
          "CHARGE LOAD ERROR:",
          err
        );

      }

    };


    loadCharges();

  }, [
    machine,
    selectedSlots,
    slots,
    chargeType,
    landSize,
    tillageAmount
  ]);


  // ==========================================================
  // SHOW SUCCESS MODAL
  // ==========================================================

  const showSuccessModal = () => {

    setSuccessModalVisible(true);


    successScale.setValue(0.7);

    successOpacity.setValue(0);

    textTranslateY.setValue(20);


    Animated.parallel([

      Animated.spring(
        successScale,
        {
          toValue: 1,

          friction: 6,

          tension: 70,

          useNativeDriver: true
        }
      ),


      Animated.timing(
        successOpacity,
        {
          toValue: 1,

          duration: 450,

          easing:
            Easing.out(Easing.ease),

          useNativeDriver: true
        }
      ),


      Animated.spring(
        textTranslateY,
        {
          toValue: 0,

          friction: 5,

          tension: 60,

          useNativeDriver: true
        }
      )

    ]).start();

  };


  // ==========================================================
  // CONFIRM BOOKING
  // ==========================================================

  const handleConfirmBooking = async () => {

    try {

      if (!userInfo) {

        return Alert.alert(
          t("error"),
          "User info loading..."
        );

      }


      if (isSubmitting) return;


      setIsSubmitting(true);


      await addDoc(
        collection(db, "bookings"),
        {

          machineId:
            machine.id,

          providerId:
            machine.providerId,

          machineType:
            machine.machineType,


          userId:
            userInfo.uid,

          userName:
            userInfo.name || "",

          userPhone:
            userInfo.phone || "",

          userEmail:
            user?.email || "",


          tillageAmount,

          landSize,

          landAddress,

          chargeType,


          chargePerDecimal,

          chargePerBigha,


          totalCharge,


          isRead: false,


          dates: [
            selectedDate
          ],


          slots:
            selectedSlots,


          status:
            "pending",


          createdAt:
            new Date(),


          address:
            userInfo.address || ""

        }
      );


      setIsSubmitting(false);


      // Show custom success popup

      showSuccessModal();

    }


    catch (err) {

      console.error(err);


      setIsSubmitting(false);


      Alert.alert(
        t("error"),
        t("booking_failed")
      );

    }

  };


  // ==========================================================
  // INFORMATION ROW
  // ==========================================================

  const InfoRow = ({
    label,
    value,
    multiline = false
  }) => (

    <View
      style={[
        styles.infoRow,

        multiline &&
          styles.multilineRow
      ]}
    >

      <Text
        style={styles.infoLabel}
      >
        {label}
      </Text>


      <Text
        style={[
          styles.infoValue,

          multiline &&
            styles.multilineValue
        ]}
      >
        {value || "-"}

      </Text>

    </View>

  );


  // ==========================================================
  // UI
  // ==========================================================

  return (

    <View style={styles.screen}>

      <ScrollView

        style={styles.container}

        contentContainerStyle={{
          paddingBottom: 120
        }}

        showsVerticalScrollIndicator={
          false
        }
      >


        {/* ==================================================
            SINGLE CLASSIC CARD
            ================================================== */}

        <View style={styles.card}>


          {/* ================================================
              MACHINE IMAGE
              ================================================ */}

          <View
            style={styles.imageContainer}
          >

            {loadingImage ? (

              <ActivityIndicator
                size="small"
                color="#666"
              />

            ) : machineImage ? (

              <Image
                source={machineImage}
                style={
                  styles.machineImage
                }
                resizeMode="contain"
              />

            ) : (

              <Image
                source={
                  getDefaultMachineImage(
                    machine?.machineType
                  )
                }

                style={
                  styles.machineImage
                }

                resizeMode="contain"
              />

            )}

          </View>


          {/* ================================================
              MACHINE NAME
              ================================================ */}

          <Text
            style={styles.machineName}
          >
            {t(
              machine?.machineType
            )}
          </Text>


          <View
            style={styles.divider}
          />


          {/* ================================================
              MACHINE INFORMATION
              ================================================ */}

          <Text
            style={styles.sectionTitle}
          >
            {isBn
              ? "মেশিনের তথ্য"
              : "Machine Information"}
          </Text>


          <InfoRow
            label={t("provider")}
            value={
              machine?.providerName
            }
          />


          <InfoRow
            label={t("phone")}
            value={
              machine?.phone
            }
          />


          <InfoRow
            label={t("district")}
            value={
              machine?.district
            }
          />


          <InfoRow
            label={t("upazilla")}
            value={
              machine?.upazila
            }
          />


          <InfoRow
            label={t("village")}
            value={
              machine?.village
            }
          />


          {/* ================================================
              CHARGES
              ================================================ */}

          <InfoRow
            label={
              t("charge_per_decimal")
            }

            value={
              isBn
                ? `${toBanglaNumber(
                    chargePerDecimal
                  )} টাকা`
                : `${chargePerDecimal} Taka`
            }
          />


          <InfoRow
            label={
              t("charge_per_bigha")
            }

            value={
              isBn
                ? `${toBanglaNumber(
                    chargePerBigha
                  )} টাকা`
                : `${chargePerBigha} Taka`
            }
          />


          <View
            style={styles.divider}
          />


          {/* ================================================
              BOOKING INFORMATION
              ================================================ */}

          <Text
            style={styles.sectionTitle}
          >
            {t("booking_details")}
          </Text>


          <InfoRow
            label={
              t("selected_date")
            }

            value={
              isBn
                ? toBanglaNumber(
                    selectedDate
                  )
                : selectedDate
            }
          />


          {/* ================================================
              SELECTED SLOTS
              ================================================ */}

          <View
            style={styles.slotRow}
          >

            <Text
              style={styles.infoLabel}
            >
              {t("selected_slots")}
            </Text>


            <View
              style={styles.slotList}
            >

              {slotLabels.length >
              0 ? (

                slotLabels.map(
                  (
                    label,
                    index
                  ) => (

                    <Text
                      key={index}
                      style={
                        styles.slotText
                      }
                    >
                      {label}
                    </Text>

                  )
                )

              ) : (

                <Text
                  style={
                    styles.infoValue
                  }
                >
                  -
                </Text>

              )}

            </View>

          </View>


          <InfoRow
            label={
              t("total_slots")
            }

            value={
              isBn
                ? toBanglaNumber(
                    selectedSlots.length
                  )
                : selectedSlots.length
            }
          />


          <InfoRow
            label={
              t("total_time")
            }

            value={
              isBn
                ? `${toBanglaNumber(
                    totalHours
                  )} ঘণ্টা`
                : `${totalHours} hours`
            }
          />


          <InfoRow
            label={
              t("land_size")
            }

            value={
              isBn
                ? toBanglaNumber(
                    landSize
                  )
                : landSize
            }
          />


          <InfoRow
            label={
              t("tillage_number")
            }

            value={
              isBn
                ? toBanglaNumber(
                    tillageAmount
                  )
                : tillageAmount
            }
          />


          <InfoRow
            label={
              t("charge_type")
            }

            value={

              chargeType ===
              "per_decimal"

                ? t("per_decimal")

                : chargeType ===
                  "per_bigha"

                ? t("per_bigha")

                : chargeType

            }
          />


          <InfoRow
            label={
              t("land_address")
            }

            value={
              landAddress
            }

            multiline
          />


          {/* ================================================
              TOTAL
              ================================================ */}

          <View
            style={styles.totalBox}
          >

            <Text
              style={styles.totalLabel}
            >
              {t("total_charge")}
            </Text>


            <Text
              style={styles.totalValue}
            >

              {isBn
                ? `${toBanglaNumber(
                    totalCharge
                  )} টাকা`

                : `${totalCharge} Taka`}

            </Text>

          </View>


        </View>


        {/* ==================================================
            CONFIRM BUTTON
            ================================================== */}

        <TouchableOpacity

          style={[
            styles.confirmButton,

            isSubmitting &&
              styles.confirmButtonDisabled
          ]}

          activeOpacity={0.8}

          disabled={
            isSubmitting
          }

          onPress={
            handleConfirmBooking
          }
        >

          {isSubmitting ? (

            <ActivityIndicator
              size="small"
              color="#ffffff"
            />

          ) : (

            <Text
              style={
                styles.confirmButtonText
              }
            >
              {t("confirm_booking")}
            </Text>

          )}

        </TouchableOpacity>


      </ScrollView>


      {/* ======================================================
          LIQUID GLASS SUCCESS POPUP
          ====================================================== */}

      <Modal

        visible={
          successModalVisible
        }

        transparent

        animationType="fade"

        statusBarTranslucent

        onRequestClose={() => {}}
      >

        <View
          style={
            styles.modalOverlay
          }
        >


          {/* ================================================
              GLASS CARD
              ================================================ */}

          <Animated.View

            style={[
              styles.successGlassCard,

              {
                opacity:
                  successOpacity,

                transform: [
                  {
                    scale:
                      successScale
                  }
                ]
              }
            ]}
          >


            {/* ==============================================
                GLASS DECORATIVE CIRCLES
                ============================================== */}

            <View
              style={
                styles.glassCircleLarge
              }
            />

            <View
              style={
                styles.glassCircleSmall
              }
            />


            {/* ==============================================
                SUCCESS ICON
                ============================================== */}

            <Animated.View

              style={[
                styles.successIcon,

                {
                  opacity:
                    successOpacity,

                  transform: [
                    {
                      scale:
                        successScale
                    }
                  ]
                }
              ]}
            >

              <Text
                style={
                  styles.successIconText
                }
              >
                ✓
              </Text>

            </Animated.View>


            {/* ==============================================
                ANIMATED TEXT
                ============================================== */}

            <Animated.View

              style={{
                opacity:
                  successOpacity,

                transform: [
                  {
                    translateY:
                      textTranslateY
                  }
                ]
              }}
            >

              <Text
                style={
                  styles.successTitle
                }
              >
                {t("success")}
              </Text>


              <Text
                style={
                  styles.successMessage
                }
              >
                {t("booking_sent")}
              </Text>

            </Animated.View>


            {/* ==============================================
                CONTINUE BUTTON
                ============================================== */}

            <TouchableOpacity

              style={
                styles.successButton
              }

              activeOpacity={0.85}

              onPress={() => {

                setSuccessModalVisible(
                  false
                );

                navigation.popToTop();

              }}
            >

              <Text
                style={
                  styles.successButtonText
                }
              >
                {isBn
                  ? "ঠিক আছে"
                  : "Continue"}
              </Text>

            </TouchableOpacity>


          </Animated.View>

        </View>

      </Modal>


    </View>

  );

}


// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({


  // ==========================================================
  // SCREEN
  // ==========================================================

  screen: {
    flex: 1,

    backgroundColor: "#f7f7f7"
  },


  // ==========================================================
  // CONTAINER
  // ==========================================================

  container: {

    flex: 1,

    backgroundColor:
      "#f7f7f7",

    paddingHorizontal: 12,

    paddingTop: 12

  },


  // ==========================================================
  // MAIN CARD
  // ==========================================================

  card: {

    backgroundColor:
      "#ffffff",

    borderRadius: 10,

    padding: 14,

    borderWidth: 1,

    borderColor:
      "#e5e5e5",

    elevation: 2,

    shadowColor:
      "#000",

    shadowOffset: {
      width: 0,
      height: 1
    },

    shadowOpacity:
      0.06,

    shadowRadius: 3

  },


  // ==========================================================
  // IMAGE
  // ==========================================================

  imageContainer: {

    width: "100%",

    height: 150,

    backgroundColor:
      "#f8f8f8",

    borderRadius: 8,

    justifyContent:
      "center",

    alignItems:
      "center",

    overflow:
      "hidden",

    marginBottom: 10

  },


  machineImage: {

    width: "85%",

    height: "90%"

  },


  // ==========================================================
  // MACHINE NAME
  // ==========================================================

  machineName: {

    fontSize: 19,

    fontWeight: "700",

    color: "#222",

    marginBottom: 4

  },


  // ==========================================================
  // SECTION TITLE
  // ==========================================================

  sectionTitle: {

    fontSize: 14,

    fontWeight: "700",

    color: "#333",

    marginBottom: 3,

    marginTop: 2

  },


  // ==========================================================
  // DIVIDER
  // ==========================================================

  divider: {

    height: 1,

    backgroundColor:
      "#e8e8e8",

    marginVertical: 12

  },


  // ==========================================================
  // INFORMATION ROW
  // ==========================================================

  infoRow: {

    flexDirection:
      "row",

    justifyContent:
      "space-between",

    alignItems:
      "center",

    minHeight: 34,

    borderBottomWidth: 1,

    borderBottomColor:
      "#f0f0f0"

  },


  infoLabel: {

    flex: 0.45,

    fontSize: 12.5,

    color: "#777",

    fontWeight: "500"

  },


  infoValue: {

    flex: 0.55,

    fontSize: 13,

    color: "#222",

    fontWeight: "500",

    textAlign: "right"

  },


  // ==========================================================
  // LAND ADDRESS
  // ==========================================================

  multilineRow: {

    alignItems:
      "flex-start",

    paddingVertical: 7

  },


  multilineValue: {

    lineHeight: 18

  },


  // ==========================================================
  // SLOTS
  // ==========================================================

  slotRow: {

    flexDirection:
      "row",

    justifyContent:
      "space-between",

    alignItems:
      "flex-start",

    paddingVertical: 7,

    borderBottomWidth: 1,

    borderBottomColor:
      "#f0f0f0"

  },


  slotList: {

    flex: 0.55,

    alignItems:
      "flex-end"

  },


  slotText: {

    fontSize: 12.5,

    color: "#222",

    fontWeight: "500",

    textAlign: "right",

    marginBottom: 2

  },


  // ==========================================================
  // TOTAL
  // ==========================================================

  totalBox: {

    marginTop: 14,

    paddingTop: 12,

    borderTopWidth: 1,

    borderTopColor:
      "#dddddd",

    flexDirection:
      "row",

    justifyContent:
      "space-between",

    alignItems:
      "center"

  },


  totalLabel: {

    fontSize: 15,

    fontWeight: "700",

    color: "#333"

  },


  totalValue: {

    fontSize: 19,

    fontWeight: "700",

    color: "#2e7d32"

  },


  // ==========================================================
  // CONFIRM BUTTON
  // ==========================================================

  confirmButton: {

    height: 48,

    marginTop: 12,

    marginBottom: 10,

    borderRadius: 8,

    backgroundColor:
      "#2e7d32",

    justifyContent:
      "center",

    alignItems:
      "center",

    elevation: 2

  },


  confirmButtonDisabled: {

    opacity: 0.7

  },


  confirmButtonText: {

    color: "#ffffff",

    fontSize: 15,

    fontWeight: "700"

  },


  // ==========================================================
  // LIQUID GLASS MODAL
  // ==========================================================

  modalOverlay: {

    flex: 1,

    justifyContent:
      "center",

    alignItems:
      "center",

    backgroundColor:
      "rgba(0, 0, 0, 0.45)"

  },


  successGlassCard: {

    width: "84%",

    minHeight: 310,

    borderRadius: 28,

    paddingHorizontal: 25,

    paddingVertical: 30,

    justifyContent:
      "center",

    alignItems:
      "center",

    backgroundColor:
      "rgba(255, 255, 255, 0.90)",

    borderWidth: 1,

    borderColor:
      "rgba(255, 255, 255, 0.95)",

    shadowColor:
      "#000",

    shadowOffset: {

      width: 0,

      height: 12

    },

    shadowOpacity:
      0.25,

    shadowRadius:
      25,

    elevation: 15,

    overflow:
      "hidden"

  },


  // ==========================================================
  // GLASS DECORATION
  // ==========================================================

  glassCircleLarge: {

    position:
      "absolute",

    width: 180,

    height: 180,

    borderRadius: 90,

    backgroundColor:
      "rgba(46, 125, 50, 0.08)",

    top: -80,

    right: -70

  },


  glassCircleSmall: {

    position:
      "absolute",

    width: 120,

    height: 120,

    borderRadius: 60,

    backgroundColor:
      "rgba(255, 255, 255, 0.55)",

    bottom: -50,

    left: -40

  },


  // ==========================================================
  // SUCCESS ICON
  // ==========================================================

  successIcon: {

    width: 72,

    height: 72,

    borderRadius: 36,

    backgroundColor:
      "rgba(46, 125, 50, 0.12)",

    borderWidth: 1,

    borderColor:
      "rgba(46, 125, 50, 0.25)",

    justifyContent:
      "center",

    alignItems:
      "center",

    marginBottom: 18

  },


  successIconText: {

    fontSize: 42,

    fontWeight: "700",

    color: "#2e7d32",

    marginTop: -3

  },


  // ==========================================================
  // SUCCESS TEXT
  // ==========================================================

  successTitle: {

    fontSize: 23,

    fontWeight: "800",

    color: "#222",

    textAlign:
      "center",

    marginBottom: 8

  },


  successMessage: {

    fontSize: 15,

    color: "#666",

    textAlign:
      "center",

    lineHeight: 22,

    paddingHorizontal: 10,

    marginBottom: 25

  },


  // ==========================================================
  // SUCCESS BUTTON
  // ==========================================================

  successButton: {

    minWidth: 145,

    height: 46,

    paddingHorizontal: 25,

    borderRadius: 23,

    backgroundColor:
      "#2e7d32",

    justifyContent:
      "center",

    alignItems:
      "center",

    shadowColor:
      "#2e7d32",

    shadowOffset: {

      width: 0,

      height: 4

    },

    shadowOpacity:
      0.25,

    shadowRadius: 6,

    elevation: 4

  },


  successButtonText: {

    color: "#ffffff",

    fontSize: 15,

    fontWeight: "700"

  }

});