export const clerkAppearance = {
  variables: {
    colorBackground: "#110e0d",
    colorInputBackground: "#141010",
    colorInputText: "#e6ddd4",
    colorText: "#e6ddd4",
    colorTextSecondary: "#8f847a",
    colorPrimary: "#c24a2a",
    colorDanger: "#b83a34",
    colorNeutral: "#e6ddd4",
    borderRadius: "12px",
    fontFamily: "var(--font-sans), system-ui, sans-serif",
  },
  elements: {
    card: {
      boxShadow: "none",
      border: "1px solid rgba(230,221,212,0.09)",
      background: "#110e0d",
    },
    modalContent: {
      boxShadow: "none",
    },
    headerTitle: {
      fontFamily: "var(--font-display), serif",
    },
    formButtonPrimary: {
      backgroundColor: "#c24a2a",
      color: "#f2e8df",
      fontWeight: "600",
      textTransform: "none",
    },
    footerActionLink: {
      color: "#c24a2a",
    },
  },
} as const;
