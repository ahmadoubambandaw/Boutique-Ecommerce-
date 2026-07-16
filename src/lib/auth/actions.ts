"use server";

import { redirect } from "next/navigation";
import * as customerApi from "./customer";
import {
  clearCustomerSession,
  getCustomerToken,
  setCustomerSession,
} from "./session";
import { resolveTenant } from "@/lib/tenant/registry";
import {
  loginSchema,
  registerSchema,
} from "@/lib/validations";

export type AuthState = { error?: string; ok?: boolean };

async function shopifyReady(): Promise<boolean> {
  const t = await resolveTenant();
  return Boolean(t.shopify.storeDomain && t.shopify.storefrontAccessToken);
}

/** Server action for the login form. */
export async function loginAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Champs invalides." };
  }
  if (!(await shopifyReady())) {
    return {
      error:
        "Mode démo : configurez une boutique Shopify pour activer l'authentification.",
    };
  }

  const result = await customerApi.login(parsed.data.email, parsed.data.password);
  if ("error" in result) return { error: result.error };

  await setCustomerSession(result.token, result.expiresAt);
  redirect("/account");
}

/** Server action for the registration form. */
export async function registerAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = registerSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    acceptTerms: formData.get("acceptTerms") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Champs invalides." };
  }
  if (!(await shopifyReady())) {
    return {
      error:
        "Mode démo : configurez une boutique Shopify pour activer l'inscription.",
    };
  }

  const result = await customerApi.register({
    firstName: parsed.data.firstName,
    lastName: parsed.data.lastName,
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if ("error" in result) return { error: result.error };

  await setCustomerSession(result.token, result.expiresAt);
  redirect("/account");
}

/** Server action to log the customer out. */
export async function logoutAction(): Promise<void> {
  const token = await getCustomerToken();
  if (token) await customerApi.logout(token);
  await clearCustomerSession();
  redirect("/login");
}

/** Read the current customer for server components (null if signed out). */
export async function getCurrentCustomer(): Promise<customerApi.Customer | null> {
  const token = await getCustomerToken();
  if (!token) return null;
  return customerApi.getCustomer(token);
}
