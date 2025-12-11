import "./globals.css";
export const metadata = {
  title: "Financial Document Analyzer",
  description: "Upload your bank statement and get instant credit scoring, spending analysis, and BNPL exposure insights.",
};
export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-black text-white">{children}</body>
    </html>
  );
}
