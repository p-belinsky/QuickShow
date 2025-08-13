const isoTimeFormat = (dateTime) => {
  // Remove the trailing "Z" so it's treated as local time, not UTC
  const localString = dateTime.replace(/Z$/, "");
  const date = new Date(localString);
  
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export default isoTimeFormat;