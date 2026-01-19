export default function mergeConfig(...configs) {
  return configs.reduce((acc, conf) => {
    Object.entries(conf).forEach(([key, value]) => {
      if (value !== undefined) acc[key] = value;
    });
    return acc;
  }, {});
}

// export default function mergeConfig(...configs) {
//   return configs.reduce((acc, conf) => {
//     Object.entries(conf).forEach(([key, value]) => {
//       if (Array.isArray(value) && Array.isArray(acc[key])) {
//         acc[key] = [...acc[key], ...value];
//       } else if (value !== undefined) {
//         acc[key] = value;
//       }
//     });
//     return acc;
//   }, {});
// }