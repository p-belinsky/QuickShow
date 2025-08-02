export const dateFormat = (date) => {
      const localDate = new Date(date.replace(/Z$/, ""));
  return localDate.toLocaleString("en-US", {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

};