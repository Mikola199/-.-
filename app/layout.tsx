import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata = {
  title: 'EQUHUB — Единая цифровая платформа',
  description: 'Масштабируемая цифровая платформа, объединяющая социальную сеть, мессенджер, маркетплейс, вакансии, безопасные сделки и AI-ассистента.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
