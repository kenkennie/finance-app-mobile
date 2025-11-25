export interface AvatarData {
  initials: string;
  color: string;
}

export function generateAvatarData(name: string, userId: string): AvatarData {
  return {
    initials: getInitials(name),
    color: getBackgroundColor(userId),
  };
}

function getInitials(fullName: string): string {
  if (!fullName?.trim()) return "?";

  const names = fullName.trim().split(/\s+/);
  if (names.length >= 2) {
    return `${names[0][0]}${names[1][0]}`.toUpperCase();
  }
  // Handle single names - show first letter
  return names[0][0].toUpperCase();
}

function getBackgroundColor(userId: string): string {
  // Use userId for consistent colors across devices/sessions
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Professional color palette
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA0DD",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E9",
    "#F8B195",
    "#6C5CE7",
    "#A29BFE",
    "#FD79A8",
    "#E17055",
  ];

  return colors[Math.abs(hash) % colors.length];
}
