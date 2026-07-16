import "server-only";
import { shopifyFetch } from "@/lib/shopify/client";
import {
  customerAccessTokenCreateMutation,
  customerAccessTokenDeleteMutation,
  customerCreateMutation,
  customerRecoverMutation,
  getCustomerQuery,
} from "@/lib/shopify/customer-queries";

/** Typed customer model returned to the account UI. */
export type Customer = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string;
  email: string;
  phone: string | null;
  defaultAddress: {
    address1: string | null;
    address2: string | null;
    city: string | null;
    zip: string | null;
    country: string | null;
    phone: string | null;
  } | null;
  orders: CustomerOrder[];
};

export type CustomerOrder = {
  id: string;
  orderNumber: number;
  processedAt: string;
  financialStatus: string | null;
  fulfillmentStatus: string | null;
  statusUrl: string;
  total: { amount: string; currencyCode: string };
  items: { title: string; quantity: number; image: string | null }[];
};

type UserError = { code?: string; field?: string[]; message: string };

/** Exchange email + password for a Shopify customer access token. */
export async function login(
  email: string,
  password: string,
): Promise<{ token: string; expiresAt: string } | { error: string }> {
  const data = await shopifyFetch<{
    customerAccessTokenCreate: {
      customerAccessToken: { accessToken: string; expiresAt: string } | null;
      customerUserErrors: UserError[];
    };
  }>({
    query: customerAccessTokenCreateMutation,
    variables: { input: { email, password } },
    revalidate: 0,
  });

  const res = data.customerAccessTokenCreate;
  if (res.customerAccessToken) {
    return {
      token: res.customerAccessToken.accessToken,
      expiresAt: res.customerAccessToken.expiresAt,
    };
  }
  return {
    error:
      res.customerUserErrors[0]?.message ??
      "E-mail ou mot de passe incorrect.",
  };
}

/** Register a new customer, then immediately log them in. */
export async function register(input: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}): Promise<{ token: string; expiresAt: string } | { error: string }> {
  const data = await shopifyFetch<{
    customerCreate: {
      customer: { id: string } | null;
      customerUserErrors: UserError[];
    };
  }>({
    query: customerCreateMutation,
    variables: { input },
    revalidate: 0,
  });

  const errors = data.customerCreate.customerUserErrors;
  if (errors.length > 0) {
    return { error: errors[0]!.message };
  }
  return login(input.email, input.password);
}

/** Trigger a password-reset email. */
export async function recover(email: string): Promise<{ ok: true } | { error: string }> {
  const data = await shopifyFetch<{
    customerRecover: { customerUserErrors: UserError[] };
  }>({
    query: customerRecoverMutation,
    variables: { email },
    revalidate: 0,
  });
  const errors = data.customerRecover.customerUserErrors;
  return errors.length > 0 ? { error: errors[0]!.message } : { ok: true };
}

/** Invalidate a customer access token (logout). */
export async function logout(token: string): Promise<void> {
  await shopifyFetch({
    query: customerAccessTokenDeleteMutation,
    variables: { customerAccessToken: token },
    revalidate: 0,
  }).catch(() => {});
}

/** Fetch the authenticated customer + recent orders. */
export async function getCustomer(token: string): Promise<Customer | null> {
  type RawOrder = {
    id: string;
    orderNumber: number;
    processedAt: string;
    financialStatus: string | null;
    fulfillmentStatus: string | null;
    statusUrl: string;
    currentTotalPrice: { amount: string; currencyCode: string };
    lineItems: {
      edges: {
        node: {
          title: string;
          quantity: number;
          variant: { image: { url: string } | null } | null;
        };
      }[];
    };
  };

  const data = await shopifyFetch<{
    customer: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      displayName: string;
      email: string;
      phone: string | null;
      defaultAddress: Customer["defaultAddress"];
      orders: { edges: { node: RawOrder }[] };
    } | null;
  }>({
    query: getCustomerQuery,
    variables: { customerAccessToken: token },
    revalidate: 0,
  }).catch(() => ({ customer: null }));

  const c = data.customer;
  if (!c) return null;

  return {
    id: c.id,
    firstName: c.firstName,
    lastName: c.lastName,
    displayName: c.displayName,
    email: c.email,
    phone: c.phone,
    defaultAddress: c.defaultAddress,
    orders: c.orders.edges.map(({ node }) => ({
      id: node.id,
      orderNumber: node.orderNumber,
      processedAt: node.processedAt,
      financialStatus: node.financialStatus,
      fulfillmentStatus: node.fulfillmentStatus,
      statusUrl: node.statusUrl,
      total: node.currentTotalPrice,
      items: node.lineItems.edges.map(({ node: li }) => ({
        title: li.title,
        quantity: li.quantity,
        image: li.variant?.image?.url ?? null,
      })),
    })),
  };
}
