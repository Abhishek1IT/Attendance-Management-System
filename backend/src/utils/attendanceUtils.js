export const getToday = () => new Date().toLocaleDateString("en-CA");

export const getWorkingMinutes = (attendance) => {
  if (!attendance?.checkIn || !attendance?.checkout) {
    return 0;
  }

  const diff =
    (new Date(attendance.checkout) - new Date(attendance.checkIn)) /
    (1000 * 60);
  return diff > 0 ? diff : 0;
};

export const toWorkingHours = (workingMinutes) =>
  Number((workingMinutes / 60).toFixed(2));

export const getStatusByWorkingMinutes = (workingMinutes) => {
  if (workingMinutes <= 240) {
    return "absent";
  }

  if (workingMinutes < 360) {
    return "half-day";
  }

  return "present";
};

export const getEffectiveStatus = (attendance) => {
  if (attendance?.isManualStatus) {
    return String(attendance?.status || "absent").toLowerCase();
  }

  if (!attendance?.checkIn) {
    return String(attendance?.status || "absent").toLowerCase();
  }

  if (!attendance?.checkout) {
    return "checkout-pending";
  }

  return getStatusByWorkingMinutes(getWorkingMinutes(attendance));
};

export const withWorkingHours = (attendance) => {
  const workingMinutes = getWorkingMinutes(attendance);
  return {
    ...attendance,
    status: getEffectiveStatus(attendance),
    isCheckoutPending: Boolean(attendance?.checkIn && !attendance?.checkout),
    workingHours: toWorkingHours(workingMinutes),
  };
};
