import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const WHATSAPP_URL =
  "https://wa.me/34647763304?text=" +
  encodeURIComponent("¡Hola! Vengo de la web y quiero saber más sobre las rebajas.");

const SESSION_KEY = "rebajas-island-shown";
const DELAY_MS = 6000;
const AUTO_HIDE_MS = 30000;
const CLIENT_PATH = "/clientas";

/** Rutas internas donde el aviso no debe aparecer */
const HIDDEN_PREFIXES = ["/admin", "/subirprenda"];

const RebajasIsland = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const isClientPromotion = pathname === CLIENT_PATH;

  useEffect(() => {
    if (isClientPromotion) {
      setVisible(true);
      return;
    }
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
  }, [isClientPromotion, pathname]);

  useEffect(() => {
    if (!visible || isClientPromotion) return;
    const hideTimer = window.setTimeout(() => setVisible(false), AUTO_HIDE_MS);
    return () => window.clearTimeout(hideTimer);
  }, [isClientPromotion, visible]);

  useEffect(() => {
    if (!visible) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [visible]);

  useEffect(() => {
    if (!isClientPromotion) return;
    const robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const previousContent = robots?.content;
    robots?.setAttribute("content", "noindex, nofollow");
    return () => {
      if (robots && previousContent) robots.setAttribute("content", previousContent);
    };
  }, [isClientPromotion]);

  if (!visible) return null;

  const dismiss = () => setVisible(false);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 px-5 py-8 backdrop-blur-md animate-in fade-in duration-500"
      role="dialog"
      aria-modal="true"
      aria-label="Aviso de rebajas"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) dismiss();
      }}
    >
      <div className="relative w-full max-w-md overflow-hidden border border-border bg-background shadow-2xl animate-in zoom-in-95 duration-500">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={dismiss}
          aria-label="Cerrar aviso"
          className="absolute right-3 top-3 z-10 text-sale-foreground hover:bg-sale-foreground/15 hover:text-sale-foreground"
        >
          <X className="h-5 w-5" />
        </Button>

        <div className="bg-sale px-6 pb-8 pt-9 text-center text-sale-foreground sm:px-10">
          <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.3em]">
            {isClientPromotion ? "Una invitación de La Loggia" : "Selección especial"}
          </p>
          <h2 className="font-serif text-5xl leading-none sm:text-6xl">
            {isClientPromotion ? "Solo por ser clienta" : "Rebajas"}
          </h2>
        </div>

        <div className="px-7 py-8 text-center sm:px-10 sm:py-9">
          {isClientPromotion ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sale">
                Tu promoción se ha activado
              </p>
              <div className="my-6 grid grid-cols-2 divide-x divide-border border-y border-border py-5">
                <div className="px-2">
                  <strong className="block font-serif text-4xl font-medium">15%</strong>
                  <span className="mt-1 block text-[10px] uppercase tracking-[0.16em] text-muted-foreground">En efectivo</span>
                </div>
                <div className="px-2">
                  <strong className="block font-serif text-4xl font-medium">10%</strong>
                  <span className="mt-1 block text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Con tarjeta</span>
                </div>
              </div>
              <p className="mx-auto mb-7 max-w-xs text-sm leading-relaxed text-muted-foreground">
                Enséñanos esta invitación en tienda y disfruta de tu descuento exclusivo.
              </p>
            </>
          ) : (
            <>
              <p className="font-serif text-2xl">La selección que estabas esperando</p>
              <p className="mx-auto mb-7 mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
                Descubre las prendas seleccionadas antes de que desaparezcan.
              </p>
            </>
          )}

          <Button
            type="button"
            onClick={() => {
              dismiss();
              navigate("/rebajas");
            }}
            className="h-12 w-full rounded-none bg-accent text-xs uppercase tracking-[0.18em] text-accent-foreground hover:bg-accent/90"
          >
            Ver la sección de rebajas
            <ArrowRight className="h-4 w-4" />
          </Button>

          <Button asChild variant="ghost" className="mt-3 h-11 w-full rounded-none text-xs uppercase tracking-[0.12em]">
            <a
              href={
                isClientPromotion
                  ? "https://wa.me/34647763304?text=" + encodeURIComponent("¡Hola! He recibido la promoción exclusiva para clientas y quiero saber más.")
                  : WHATSAPP_URL
              }
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="h-4 w-4" />
              Preguntar por WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RebajasIsland;
