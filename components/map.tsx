"use client";
import { useEffect, useRef } from "react";
import type { LiveBus } from "./use-live";

// Lazy MapLibre, open tiles, no Google. Glides bus via 1s CSS-free lerp handled by re-render.
export default function BusMap({ buses, myStop }: { buses: LiveBus[]; myStop?: { lat: number; lng: number; name: string } | null }) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!ref.current || mapRef.current) return;
      const { default: maplibregl } = await import("maplibre-gl");
      const style = process.env.NEXT_PUBLIC_MAP_STYLE || "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";
      const map = new maplibregl.Map({
        container: ref.current!,
        style,
        center: [74.93, 31.62],
        zoom: 10
      });
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
      if (!cancelled) mapRef.current = map;
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    // Clear old markers: simplest — store on map instance.
    const m: any = map;
    m._markers?.forEach((x: any) => x.remove());
    m._markers = [];
    const add = async (lng: number, lat: number, el: HTMLElement) => {
      const { default: maplibregl } = await import("maplibre-gl");
      const mk = new maplibregl.Marker({ element: el }).setLngLat([lng, lat]).addTo(map);
      m._markers.push(mk);
    };
    buses.forEach((b) => {
      const el = document.createElement("div");
      el.title = b.bus_number;
      el.style.cssText = `width:34px;height:34px;border-radius:999px;background:${b.state === "offline" ? "#9aa0ad" : "#F5A100"};border:3px solid #000;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;color:#000;transition:transform 1s linear;`;
      el.textContent = "🚌";
      add(b.lng, b.lat, el);
    });
    if (myStop) {
      const el = document.createElement("div");
      el.style.cssText = "width:18px;height:18px;border-radius:999px;background:#000;border:3px solid #fff;box-shadow:0 0 0 2px #000;";
      el.title = myStop.name;
      add(myStop.lng, myStop.lat, el);
    }
    if (buses.length) {
      try {
        map.fitBounds(
          buses.map((b) => [b.lng, b.lat] as [number, number]).concat(myStop ? [[myStop.lng, myStop.lat]] : []),
          { padding: 60, maxZoom: 13 }
        );
      } catch {}
    }
  }, [buses, myStop]);

  return <div ref={ref} className="map-wrap w-full h-[46vh] min-h-[320px]" role="application" aria-label="Live bus map" />;
}
