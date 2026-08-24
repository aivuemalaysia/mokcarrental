const fs = require("fs");
const path = "C:/Users/MY PC/Documents/trae_projects/4d data/mok-car-rental/src/app/layout.tsx";
let content = fs.readFileSync(path, "utf8");
if (!content.includes("favicon")) {
  const links = [
    "      <link rel=\"icon\" type=\"image/png\" sizes=\"32x32\" href=\"/favicon-32x32.png\" />",
    "      <link rel=\"icon\" type=\"image/png\" sizes=\"16x16\" href=\"/favicon-16x16.png\" />",
    "      <link rel=\"icon\" type=\"image/x-icon\" href=\"/favicon.ico\" />",
    "      <link rel=\"icon\" type=\"image/png\" sizes=\"any\" href=\"/favicon.png\" />",
    "      <link rel=\"apple-touch-icon\" sizes=\"180x180\" href=\"/apple-touch-icon.png\" />",
    "      <link rel=\"android-chrome-192x192\" href=\"/android-chrome-192x192.png\" />",
    "      <link rel=\"android-chrome-512x512\" href=\"/android-chrome-512x512.png\" />",
    "      <link rel=\"manifest\" href=\"/site.webmanifest\" />",
  ].join("\n");
  content = content.replace("</head>", links + "\n    </head>");
  fs.writeFileSync(path, content, "utf8");
  console.log("Done");
} else {
  console.log("already present");
}
