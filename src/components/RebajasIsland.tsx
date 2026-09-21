import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { X, MessageCircle } from "lucide-react";

const WHATSAPP_URL =
  "https://wa.me/34647763304?text=" +
  encodeURIComponent("¡Hola! Vengo de la web y quiero saber más sobre las rebajas.");

const SESSION_KEY = "rebajas-island-shown";
const DELAY_MS = 6000;
const AUTO_HIDE_MS = 30000;

/** Rutas internas donde el aviso no debe aparecer */
const HIDDEN_PREFIXES = ["/admin", "/subirprenda"];

const RebajasIsland = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (pathname === "/rebajas") {
      setVisible(false);
      return;
    }
    if (HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) {
      setVisible(false);
      return;
    }
    if (sessionStorage.getItem(SESSION_KEY)) return;

    const showTimer = window.setTimeout(() => {
      sessionStorage.setItem(SESSION_KEY, "1");
      setVisible(true);
    }, DELAY_MS);

    return () => window.clearTimeout(showTimer);
  }, [pathname]);

  useEffect(() => {
    if (!visible) return;
    const hideTimer = window.setTimeout(() => setVisible(false), AUTO_HIDE_MS);
    return () => window.clearTimeout(hideTimer);
  }, [visible]);

  if (!visible) return null;

  const dismiss = () => setVisible(false);

  return (
    <div
      className="fixed bottom-4 inset-x-3 z-50 flex justify-center pointer-events-none animate-in slide-in-from-bottom-6 fade-in duration-700"
      role="dialog"
      aria-label="Aviso de rebajas"
    >
      <div className="pointer-events-auto w-full max-w-sm bg-background border border-border/60 shadow-xl rounded-2xl px-4 py-3.5 flex items-center gap-3">
        <span className="shrink-0 bg-sale text-sale-foreground text-[9px] font-semibold tracking-[0.2em] uppercase px-2 py-1 rounded-full">
          Rebajas
        </span>
        <p className="flex-1 text-[13px] leading-snug text-foreground">
          Ya están aquí.{" "}
          <button
            onClick={() => {
              dismiss();
              navigate("/rebajas");
            }}
            className="font-semibold underline underline-offset-2 hover:opacity-70 transition-opacity"
          >
            Ver la sección de rebajas
          </button>
        </p>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Preguntar por WhatsApp"
          className="shrink-0 inline-flex items-center gap-1.5 bg-sale text-sale-foreground text-[11px] font-semibold px-3 py-2 rounded-full hover:opacity-90 transition-opacity"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          WhatsApp
        </a>
        <button
          onClick={dismiss}
          aria-label="Cerrar aviso"
          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default RebajasIsland;
