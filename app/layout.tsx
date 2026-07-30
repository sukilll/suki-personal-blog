import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Suki's Desktop",
  description: "产品、设计、写作，以及还在生长的想法。"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
