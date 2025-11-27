import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
    rules: {
      "@typescript-eslint/no-unused-vars": "off", 
      "react/jsx-key": "off",
      "@next/next/no-img-element": "off", // <img> 경고 끔
      "no-unused-expressions": "off", // 단독 표현식 허용
      "react/no-unescaped-entities": "off", // JSX 내 따옴표 관련 오류 무시
      "@typescript-eslint/no-explicit-any": "off", // any 사용 허용
    },
  },
];

export default eslintConfig;
