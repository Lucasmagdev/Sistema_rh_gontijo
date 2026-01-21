import csv
import os
from collections import Counter, defaultdict


def _read_routes(routes_path: str) -> dict:
    """
    route_id -> {route_short_name, route_long_name}
    """
    routes = {}
    with open(routes_path, "r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            rid = row.get("route_id")
            if not rid:
                continue
            routes[rid] = {
                "route_short_name": (row.get("route_short_name") or "").strip(),
                "route_long_name": (row.get("route_long_name") or "").strip(),
            }
    return routes


def _read_stops(stops_path: str) -> dict:
    """
    stop_id -> {stop_name, stop_lat, stop_lon}
    """
    stops = {}
    with open(stops_path, "r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            sid = row.get("stop_id")
            if not sid:
                continue
            stops[sid] = {
                "stop_name": (row.get("stop_name") or "").strip(),
                "stop_lat": (row.get("stop_lat") or "").strip(),
                "stop_lon": (row.get("stop_lon") or "").strip(),
            }
    return stops


def _read_trips(trips_path: str) -> dict:
    """
    trip_id -> (route_id, direction_id, trip_headsign)
    """
    trips = {}
    with open(trips_path, "r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            tid = row.get("trip_id")
            if not tid:
                continue
            trips[tid] = (
                (row.get("route_id") or "").strip(),
                (row.get("direction_id") or "").strip(),
                (row.get("trip_headsign") or "").strip(),
            )
    return trips


def _scan_stop_times_first_last(stop_times_path: str) -> dict:
    """
    trip_id -> (first_stop_id, last_stop_id)

    Assumimos que stop_times está ordenado por trip_id e stop_sequence (como no exemplo do arquivo).
    """
    out = {}
    current_trip = None
    first_stop = None
    last_stop = None

    with open(stop_times_path, "r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            tid = row.get("trip_id")
            sid = row.get("stop_id")
            if not tid or not sid:
                continue

            if current_trip is None:
                current_trip = tid
                first_stop = sid
                last_stop = sid
                continue

            if tid != current_trip:
                # fecha o trip anterior
                out[current_trip] = (first_stop, last_stop)
                # inicia novo trip
                current_trip = tid
                first_stop = sid
                last_stop = sid
            else:
                # mesmo trip: como está ordenado, o último stop vai sendo atualizado
                last_stop = sid

    if current_trip is not None and first_stop is not None and last_stop is not None:
        out[current_trip] = (first_stop, last_stop)

    return out


def main():
    base_dir = os.path.join("GTFS", "GTFSBHTRANS")
    routes_path = os.path.join(base_dir, "routes.txt")
    trips_path = os.path.join(base_dir, "trips.txt")
    stop_times_path = os.path.join(base_dir, "stop_times.txt")
    stops_path = os.path.join(base_dir, "stops.txt")

    if not all(os.path.exists(p) for p in [routes_path, trips_path, stop_times_path, stops_path]):
        missing = [p for p in [routes_path, trips_path, stop_times_path, stops_path] if not os.path.exists(p)]
        raise SystemExit(f"Arquivos ausentes: {missing}")

    print("Lendo routes.txt...")
    routes = _read_routes(routes_path)
    print("Lendo trips.txt...")
    trips = _read_trips(trips_path)
    print("Lendo stops.txt...")
    stops = _read_stops(stops_path)
    print("Varrendo stop_times.txt (isso pode demorar)...")
    trip_first_last = _scan_stop_times_first_last(stop_times_path)

    # (route_id, direction_id) -> Counter((first_stop_id, last_stop_id))
    agg: dict[tuple[str, str], Counter] = defaultdict(Counter)
    # manter um headsign "comum" por (route_id, direction_id) (só para referência)
    headsign_counter: dict[tuple[str, str], Counter] = defaultdict(Counter)

    for trip_id, (first_sid, last_sid) in trip_first_last.items():
        trip_info = trips.get(trip_id)
        if not trip_info:
            continue
        route_id, direction_id, headsign = trip_info
        if not route_id:
            continue
        key = (route_id, direction_id or "")
        agg[key][(first_sid, last_sid)] += 1
        if headsign:
            headsign_counter[key][headsign] += 1

    # escolher o par (origem, destino) mais frequente por rota+sentido
    rows = []
    for (route_id, direction_id), counter in agg.items():
        if not counter:
            continue
        (first_sid, last_sid), count = counter.most_common(1)[0]
        r = routes.get(route_id, {})
        first_stop = stops.get(first_sid, {})
        last_stop = stops.get(last_sid, {})
        common_headsign = ""
        if headsign_counter[(route_id, direction_id)]:
            common_headsign = headsign_counter[(route_id, direction_id)].most_common(1)[0][0]

        rows.append(
            {
                "route_id": route_id,
                "linha": r.get("route_short_name", ""),
                "nome_linha": r.get("route_long_name", ""),
                "direction_id": direction_id,
                "headsign_comum": common_headsign,
                "origem_stop_id": first_sid,
                "origem_stop_name": first_stop.get("stop_name", ""),
                "origem_lat": first_stop.get("stop_lat", ""),
                "origem_lon": first_stop.get("stop_lon", ""),
                "destino_stop_id": last_sid,
                "destino_stop_name": last_stop.get("stop_name", ""),
                "destino_lat": last_stop.get("stop_lat", ""),
                "destino_lon": last_stop.get("stop_lon", ""),
                "viagens_contadas": str(count),
            }
        )

    # ordenar por "linha" (numérico quando possível) e direction_id
    def _linha_sort_key(x: str):
        x = (x or "").strip()
        # tenta inteiro (linhas como "326"), senão deixa string
        try:
            return (0, int(x))
        except Exception:
            return (1, x)

    rows.sort(key=lambda r: (_linha_sort_key(r["linha"]), r.get("direction_id") or "", r.get("route_id") or ""))

    out_txt = os.path.join(base_dir, "linhas_origem_destino.txt")
    out_csv = os.path.join(base_dir, "linhas_origem_destino.csv")

    header = [
        "linha",
        "nome_linha",
        "direction_id",
        "headsign_comum",
        "origem_stop_name",
        "origem_lat",
        "origem_lon",
        "destino_stop_name",
        "destino_lat",
        "destino_lon",
        "viagens_contadas",
        "route_id",
        "origem_stop_id",
        "destino_stop_id",
    ]

    # TXT (TSV) fácil de colar no ChatGPT
    with open(out_txt, "w", encoding="utf-8", newline="") as f:
        f.write("\t".join(header) + "\n")
        for r in rows:
            f.write("\t".join((r.get(h, "") or "").replace("\t", " ").strip() for h in header) + "\n")

    # CSV para Excel
    with open(out_csv, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=header)
        w.writeheader()
        for r in rows:
            w.writerow({h: r.get(h, "") for h in header})

    print(f"OK: gerado {out_txt}")
    print(f"OK: gerado {out_csv}")
    print(f"Total de linhas (rota+sentido): {len(rows)}")


if __name__ == "__main__":
    main()


