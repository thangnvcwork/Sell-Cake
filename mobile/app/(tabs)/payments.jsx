import { CardField, useStripe } from "@stripe/stripe-react-native";
import {
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Alert,
} from "react-native";
import { useState } from "react";
import { API_URL } from "../../constants/api";
import { useUser } from "@clerk/clerk-expo"; // lấy email từ Clerk
import { Ionicons } from "@expo/vector-icons";

export default function PaymentScreen() {
  const { confirmPayment } = useStripe();
  const [cardDetails, setCardDetails] = useState();
  const { user } = useUser(); //  dùng Clerk
  const email = user?.primaryEmailAddress?.emailAddress;

  const handlePay = async () => {
    if (!cardDetails?.complete) {
      Alert.alert("Lỗi", "Vui lòng nhập thông tin thẻ hợp lệ");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/create-payment-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: 500000,
          currency: "usd",
          userId: user?.id,
          recipeId: 52898,
        }),
      });

      if (!res.ok) {
        throw new Error(`Lỗi từ server: ${res.status}`);
      }

      const data = await res.json();

      const { clientSecret } = data;

      const { error, paymentIntent } = await confirmPayment(clientSecret, {
        paymentMethodType: "Card",
        paymentMethodData: {
          billingDetails: { email },
        },
      });

      if (error) {
        console.log("Stripe error:", error);
        Alert.alert("Thanh toán thất bại", error.message);
      } else if (paymentIntent) {
        Alert.alert("Thành công", `ID: ${paymentIntent.id}`);
      }
    } catch (err) {
      console.error("Lỗi gọi API thanh toán:", err);
      Alert.alert("Lỗi", "Không thể kết nối đến server");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }}>
          <View style={{ flex: 1, justifyContent: "center" }}>
            <Text style={styles.title}>Thông tin thẻ</Text>

            <View style={styles.cardContainer}>
              <CardField
                postalCodeEnabled={false}
                onCardChange={setCardDetails}
                style={styles.cardField}
              />
            </View>

            <TouchableOpacity style={styles.payButton} onPress={handlePay}>
              <Ionicons
                name="card-outline"
                size={20}
                color="#fff"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.payButtonText}>Thanh toán</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#333",
  },
  cardContainer: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    backgroundColor: "#f9f9f9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 24,
  },
  cardField: {
    height: 50,
    width: "100%",
  },
  payButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row", //  Thêm dòng này
    justifyContent: "center", //  Thêm dòng này
  },
  payButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
