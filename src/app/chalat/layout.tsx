import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'בדיקת זכאות לדמי אבטלה - חל"ת | ביטוח לאומי',
  description: 'בדיקת זכאות לדמי אבטלה בתקופת מבצע שאגת הארי - הוראת שעה 28.2.26-14.4.26',
};

export default function ChalatLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
