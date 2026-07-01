export const clerkAppearance = {
  variables: {
    colorBackground: "#0c0c12",
    colorInputBackground: "#101017",
    colorInputText: "#f4f2ea",
    colorText: "#f4f2ea",
    colorTextSecondary: "#9d9a90",
    colorPrimary: "#ff6a2c",
    colorDanger: "#ff5a52",
    colorNeutral: "#f4f2ea",
    borderRadius: "12px",
    fontFamily: "var(--font-sans), system-ui, sans-serif",
  },
  elements: {
    card: {
      boxShadow: "none",
      border: "1px solid rgba(244,242,234,0.1)",
      background: "#0c0c12",
    },
    modalContent: {
      boxShadow: "none",
    },
    headerTitle: {
      fontFamily: "var(--font-display), serif",
    },
    formButtonPrimary: {
      backgroundColor: "#f4f2ea",
      color: "#07070a",
      fontWeight: "600",
      textTransform: "none",
    },
    footerActionLink: {
      color: "#ff6a2c",
    },
  },
} as const;
