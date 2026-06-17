import type { ReactNode } from "react";
import s from "./dashboard.module.css";

export type DashboardNavItem = {
  id: string;
  label: string;
  icon: ReactNode;
};

type Props = {
  title: string;
  subtitle?: string;
  nav: DashboardNavItem[];
  activeId: string;
  onNavigate: (id: string) => void;
  sidebarExtra?: ReactNode;
  children: ReactNode;
};

export function DashboardLayout({
  title,
  subtitle,
  nav,
  activeId,
  onNavigate,
  sidebarExtra,
  children,
}: Props) {
  return (
    <div className={s.layout}>
      <aside className={s.sidebar}>
        <div className={s.sidebarHead}>
          <h1 className={s.sidebarTitle}>{title}</h1>
          {subtitle ? <p className={s.sidebarSub}>{subtitle}</p> : null}
        </div>

        {sidebarExtra ? <div className={s.sidebarExtra}>{sidebarExtra}</div> : null}

        <nav className={s.nav} aria-label="Разделы панели">
          {nav.map((item) => (
            <button
              key={item.id}
              type="button"
              className={activeId === item.id ? `${s.navBtn} ${s.navBtnActive}` : s.navBtn}
              onClick={() => onNavigate(item.id)}
              aria-current={activeId === item.id ? "page" : undefined}
            >
              <span className={s.navIcon}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <div className={s.content}>
        <div className={s.contentInner}>{children}</div>
      </div>
    </div>
  );
}
