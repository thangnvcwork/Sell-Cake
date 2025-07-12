import { Slot } from "expo-router";
import { ClerkProvider } from "@clerk/clerk-expo";
import { StripeProvider } from "@stripe/stripe-react-native"
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import SafeScreen from "@/components/SafeScreen";

export default function RootLayout() {
  return (
    <ClerkProvider tokenCache={tokenCache}>
      <StripeProvider
        publishableKey={process.env.STRIPE_PUBLISHABLE_KEY!}
        merchantIdentifier="merchant.com.example" // optional, nếu dùng Apple Pay
      >
        <SafeScreen>
          <Slot />
        </SafeScreen>
      </StripeProvider>
    </ClerkProvider>
  );
}
