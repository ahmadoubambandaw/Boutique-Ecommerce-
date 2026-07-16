/** Reusable GraphQL fragments for the Storefront API. */

export const imageFragment = /* GraphQL */ `
  fragment image on Image {
    url
    altText
    width
    height
  }
`;

export const moneyFragment = /* GraphQL */ `
  fragment money on MoneyV2 {
    amount
    currencyCode
  }
`;

export const variantFragment = /* GraphQL */ `
  fragment variant on ProductVariant {
    id
    title
    availableForSale
    quantityAvailable
    selectedOptions {
      name
      value
    }
    price {
      ...money
    }
    compareAtPrice {
      ...money
    }
    image {
      ...image
    }
  }
`;

export const productFragment = /* GraphQL */ `
  fragment product on Product {
    id
    handle
    title
    description
    descriptionHtml
    vendor
    productType
    tags
    availableForSale
    totalInventory
    updatedAt
    featuredImage {
      ...image
    }
    images(first: 12) {
      edges {
        node {
          ...image
        }
      }
    }
    options {
      id
      name
      values
    }
    variants(first: 100) {
      edges {
        node {
          ...variant
        }
      }
    }
    priceRange {
      minVariantPrice {
        ...money
      }
      maxVariantPrice {
        ...money
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        ...money
      }
      maxVariantPrice {
        ...money
      }
    }
    seo {
      title
      description
    }
  }
  ${imageFragment}
  ${moneyFragment}
  ${variantFragment}
`;

export const collectionFragment = /* GraphQL */ `
  fragment collection on Collection {
    id
    handle
    title
    description
    updatedAt
    image {
      ...image
    }
    seo {
      title
      description
    }
  }
  ${imageFragment}
`;

export const cartFragment = /* GraphQL */ `
  fragment cart on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount {
        ...money
      }
      totalAmount {
        ...money
      }
      totalTaxAmount {
        ...money
      }
      totalDutyAmount {
        ...money
      }
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          cost {
            totalAmount {
              ...money
            }
          }
          merchandise {
            ... on ProductVariant {
              id
              title
              selectedOptions {
                name
                value
              }
              price {
                ...money
              }
              product {
                handle
                title
                featuredImage {
                  ...image
                }
              }
            }
          }
        }
      }
    }
  }
  ${moneyFragment}
  ${imageFragment}
`;
