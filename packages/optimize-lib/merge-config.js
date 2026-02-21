export default function mergeConfig(...configs) {
  return configs.reduce((acc, conf) => {
    Object.entries(conf).forEach(([key, value]) => {
      if (value !== undefined) acc[key] = value;
    });
    return acc;
  }, {});
}