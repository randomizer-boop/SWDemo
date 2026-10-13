import json
import swisseph as swe
from geopy.geocoders import Nominatim
from timezonefinder import TimezoneFinder
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo
from itertools import combinations

# 1. ПОИСК ГОРОДА -> КООРДИНАТЫ И ЧАСОВОЙ ПОЯС

geolocator = Nominatim(user_agent="natal_chart_app")
tf = TimezoneFinder()


def find_city_coordinates(city_name):
    location = geolocator.geocode(city_name)
    if location is None:
        raise ValueError(
            f"Город '{city_name}' не найден. Попробуй указать точнее, "
        )
    return location.latitude, location.longitude, location.address


def find_timezone_offset(lat, lon, date_for_offset):
    tz_name = tf.timezone_at(lat=lat, lng=lon)
    if tz_name is None:
        raise ValueError("Не удалось определить часовой пояс по этим координатам")
    tz = ZoneInfo(tz_name)
    offset = date_for_offset.replace(tzinfo=tz).utcoffset()
    offset_hours = offset.total_seconds() / 3600
    return offset_hours, tz_name

# 2. РАСЧЁТ ПЛАНЕТ, ДОМОВ, АСПЕКТОВ

# Эфемериды (ephe/seas_18.se1 рядом с этим файлом) — нужны для Хирона
EPHE_PATH = Path(__file__).resolve().parent / "ephe"

if not EPHE_PATH.exists():
    raise FileNotFoundError(
        f"Папка эфемерид не найдена: {EPHE_PATH}. "
        "Создай папку ephe рядом с main_engine.py и положи туда seas_18.se1."
    )

swe.set_ephe_path(str(EPHE_PATH))

PLANETS = {
    "Солнце": swe.SUN,
    "Луна": swe.MOON,
    "Меркурий": swe.MERCURY,
    "Венера": swe.VENUS,
    "Марс": swe.MARS,
    "Юпитер": swe.JUPITER,
    "Сатурн": swe.SATURN,
    "Уран": swe.URANUS,
    "Нептун": swe.NEPTUNE,
    "Плутон": swe.PLUTO,
    "Раху": swe.TRUE_NODE,
    "Лилит": swe.MEAN_APOG,
    "Хирон": swe.CHIRON,
}

ZODIAC_SIGNS = [
    "Овен", "Телец", "Близнецы", "Рак", "Лев", "Дева",
    "Весы", "Скорпион", "Стрелец", "Козерог", "Водолей", "Рыбы",
]

# Мажорные аспекты (для обычных пар) + Квиконс (нужен для "Перста судьбы")
ASPECTS = {
    "Соединение": (0, 8),
    "Секстиль": (60, 6),
    "Квадрат": (90, 7),
    "Трин": (120, 7),
    "Квиконс": (150, 3),
    "Оппозиция": (180, 8),
}


def deg_to_sign(longitude):
    sign_index = int(longitude // 30)
    degree_in_sign = longitude % 30
    return ZODIAC_SIGNS[sign_index], degree_in_sign


def angle_diff(a, b):
    diff = abs(a - b) % 360
    return min(diff, 360 - diff)


def get_aspect_name(lon1, lon2):
    """Возвращает название аспекта между двумя долготами, либо None."""
    diff = angle_diff(lon1, lon2)
    best_match = None
    best_orb = 999
    for aspect_name, (angle, orb) in ASPECTS.items():
        deviation = abs(diff - angle)
        if deviation <= orb and deviation < best_orb:
            best_match = aspect_name
            best_orb = deviation
    return best_match


def find_aspects(positions):
    found = []
    names = list(positions.keys())
    for i in range(len(names)):
        for j in range(i + 1, len(names)):
            p1, p2 = names[i], names[j]
            aspect_name = get_aspect_name(positions[p1], positions[p2])
            if aspect_name:
                diff = angle_diff(positions[p1], positions[p2])
                angle, _ = ASPECTS[aspect_name]
                found.append({
                    "planet1": p1,
                    "planet2": p2,
                    "aspect": aspect_name,
                    "orb": round(abs(diff - angle), 2),
                })
    return found

# 3. КОНФИГУРАЦИИ (узоры из 3 и более планет)

# Узор из 3 планет = набор аспектов между сторонами треугольника (порядок не важен)
THREE_POINT_PATTERNS = {
    ("Трин", "Трин", "Трин"): "Большой тригон",
    ("Оппозиция", "Квадрат", "Квадрат"): "Тау-квадрат",
    ("Квиконс", "Квиконс", "Секстиль"): "Перст судьбы",
    ("Секстиль", "Секстиль", "Трин"): "Бисекстиль",
}


def find_configurations(positions):
    """
    Ищет конфигурации (узоры) среди планет — на основе уже найденных
    парных аспектов. Возвращает список: [{"type": ..., "planets": [...]}]
    """
    names = list(positions.keys())
    configurations = []

    # --- Узоры из 3 планет (треугольники) ---
    for p1, p2, p3 in combinations(names, 3):
        a12 = get_aspect_name(positions[p1], positions[p2])
        a13 = get_aspect_name(positions[p1], positions[p3])
        a23 = get_aspect_name(positions[p2], positions[p3])

        if not (a12 and a13 and a23):
            continue  # хотя бы одна сторона без аспекта — не узор

        side_pattern = tuple(sorted([a12, a13, a23]))
        for pattern_key, pattern_name in THREE_POINT_PATTERNS.items():
            if tuple(sorted(pattern_key)) == side_pattern:
                configurations.append({
                    "type": pattern_name,
                    "planets": [p1, p2, p3],
                })

    return configurations

# 4. ДОМА + ОБЩАЯ СБОРКА КАРТЫ

def find_house_for_planet(lon_deg, houses_cusps_degrees):
    """
    Определяет, в каком доме находится планета, по её долготе и списку
    из 12 куспидов домов (границ). houses_cusps_degrees — список долгот
    куспидов домов 1-12 (индекс 0 = дом 1, индекс 11 = дом 12).
    """
    for i in range(12):
        start = houses_cusps_degrees[i]
        end = houses_cusps_degrees[(i + 1) % 12]
        if start < end:
            if start <= lon_deg < end:
                return i + 1
        else:
            if lon_deg >= start or lon_deg < end:
                return i + 1
    return None


def calculate_natal_chart(year, month, day, hour, minute, lat, lon, tz_offset=0):
    ut_hour = hour + minute / 60 - tz_offset
    jd_ut = swe.julday(year, month, day, ut_hour)
    houses_cusps, ascmc = swe.houses(jd_ut, lat, lon, b'P')
    houses_result = {}
    for i, cusp_deg in enumerate(houses_cusps, start=1):
        sign, deg_in_sign = deg_to_sign(cusp_deg)
        houses_result[i] = {
            "longitude": round(cusp_deg, 2),
            "sign": sign,
            "degree_in_sign": round(deg_in_sign, 2),
        }

    planets_result = {}
    raw_positions = {}
    for name, code in PLANETS.items():
        try:
            (lon_deg, lat_deg, dist, speed, *_), _flag = swe.calc_ut(jd_ut, code)
        except swe.Error:
            continue
        sign, deg_in_sign = deg_to_sign(lon_deg)
        planets_result[name] = {
            "longitude": round(lon_deg, 2),
            "sign": sign,
            "degree_in_sign": round(deg_in_sign, 2),
            "retrograde": speed < 0,
            "house": find_house_for_planet(lon_deg, houses_cusps),
        }
        raw_positions[name] = lon_deg

    # Кету — точка напротив Раху (+180°)
    ketu_lon = (planets_result["Раху"]["longitude"] + 180) % 360
    ketu_sign, ketu_deg_in_sign = deg_to_sign(ketu_lon)
    planets_result["Кету"] = {
        "longitude": round(ketu_lon, 2),
        "sign": ketu_sign,
        "degree_in_sign": round(ketu_deg_in_sign, 2),
        "retrograde": planets_result["Раху"]["retrograde"],
        "house": find_house_for_planet(ketu_lon, houses_cusps),
    }
    raw_positions["Кету"] = ketu_lon

    # Селена (Белая Луна) — точка напротив Лилит (+180°)
    selena_lon = (planets_result["Лилит"]["longitude"] + 180) % 360
    selena_sign, selena_deg_in_sign = deg_to_sign(selena_lon)
    planets_result["Селена"] = {
        "longitude": round(selena_lon, 2),
        "sign": selena_sign,
        "degree_in_sign": round(selena_deg_in_sign, 2),
        "retrograde": planets_result["Лилит"]["retrograde"],
        "house": find_house_for_planet(selena_lon, houses_cusps),
    }
    raw_positions["Селена"] = selena_lon

    ascendant = ascmc[0]
    mc = ascmc[1]
    vertex = ascmc[3]  # Вертекс — swisseph отдаёт его вместе с асцендентом и MC
    descendant = (ascendant + 180) % 360  # Десцендент = точка напротив асцендента

    # Десцендент не добавляем в планеты, чтобы он не попадал в аспекты;
    # отдаётся отдельно в angles.descendant

    sun_lon = planets_result["Солнце"]["longitude"]
    moon_lon = planets_result["Луна"]["longitude"]
    sun_house = planets_result["Солнце"]["house"]

    # Парс Фортуны: формула зависит от дневного/ночного рождения
    # (Солнце в домах 7-12 = день)
    is_day_birth = sun_house >= 7
    if is_day_birth:
        fortune_lon = (ascendant + moon_lon - sun_lon) % 360
    else:
        fortune_lon = (ascendant + sun_lon - moon_lon) % 360

    vertex_sign, vertex_deg_in_sign = deg_to_sign(vertex)
    planets_result["Вертекс"] = {
        "longitude": round(vertex, 2),
        "sign": vertex_sign,
        "degree_in_sign": round(vertex_deg_in_sign, 2),
        "retrograde": False,  # у расчётных точек ретроградности не бывает
        "house": find_house_for_planet(vertex, houses_cusps),
    }
    raw_positions["Вертекс"] = vertex

    fortune_sign, fortune_deg_in_sign = deg_to_sign(fortune_lon)
    planets_result["Парс Фортуны"] = {
        "longitude": round(fortune_lon, 2),
        "sign": fortune_sign,
        "degree_in_sign": round(fortune_deg_in_sign, 2),
        "retrograde": False,
        "house": find_house_for_planet(fortune_lon, houses_cusps),
    }
    raw_positions["Парс Фортуны"] = fortune_lon

    aspects_result = find_aspects(raw_positions)
    configurations_result = find_configurations(raw_positions)

    asc_sign, asc_deg = deg_to_sign(ascendant)
    mc_sign, mc_deg = deg_to_sign(mc)
    desc_sign, desc_deg = deg_to_sign(descendant)

    return {
        "planets": planets_result,
        "angles": {
            "ascendant": {
                "longitude": round(ascendant, 2),
                "sign": asc_sign,
                "degree_in_sign": round(asc_deg, 2),
            },
            "midheaven": {
                "longitude": round(mc, 2),
                "sign": mc_sign,
                "degree_in_sign": round(mc_deg, 2),
            },
            "descendant": {
                "longitude": round(descendant, 2),
                "sign": desc_sign,
                "degree_in_sign": round(desc_deg, 2),
            },
        },
        "houses": houses_result,
        "aspects": aspects_result,
        "configurations": configurations_result,
    }


def print_chart(chart):
    print("=" * 50)
    print("ПЛАНЕТЫ")
    print("=" * 50)
    for name, data in chart["planets"].items():
        if name == "Десцендент":
            continue  # показываем его отдельно вместе с ASC и MC
        retro = " (R)" if data["retrograde"] else ""
        print(f"{name:12s}: {data['sign']:10s} {data['degree_in_sign']:5.2f}°{retro:5s} дом {data['house']}")

    print()
    print("=" * 50)
    print("АСЦЕНДЕНТ И СЕРЕДИНА НЕБА")
    print("=" * 50)
    asc_data = chart["angles"]["ascendant"]
    mc_data = chart["angles"]["midheaven"]
    desc_data = chart["angles"]["descendant"]
    print(f"Асцендент (ASC): {asc_data['sign']} {asc_data['degree_in_sign']:.2f}°")
    print(f"Середина неба (MC): {mc_data['sign']} {mc_data['degree_in_sign']:.2f}°")
    print(f"Десцендент (DSC): {desc_data['sign']} {desc_data['degree_in_sign']:.2f}°")

    print()
    print("=" * 50)
    print("ДОМА (система Плацидус)")
    print("=" * 50)
    for house_num, data in chart["houses"].items():
        print(f"Дом {house_num:2d}: {data['sign']:10s} {data['degree_in_sign']:5.2f}°")

    print()
    print("=" * 50)
    print("АСПЕКТЫ")
    print("=" * 50)
    for a in chart["aspects"]:
        print(f"{a['planet1']:10s} {a['aspect']:12s} {a['planet2']:10s}  (орбис {a['orb']}°)")

    print()
    print("=" * 50)
    print("КОНФИГУРАЦИИ")
    print("=" * 50)
    if not chart["configurations"]:
        print("Конфигураций не найдено")
    for c in chart["configurations"]:
        planets_str = " - ".join(c["planets"])
        print(f"{c['type']:15s}: {planets_str}")

# 5. ГЛАВНАЯ ФУНКЦИЯ (город + дата -> готовая карта)

def build_natal_chart_by_city(city_name, year, month, day, hour, minute):
    lat, lon, full_name = find_city_coordinates(city_name)
    birth_date = datetime(year, month, day, hour, minute)
    tz_offset, tz_name = find_timezone_offset(lat, lon, birth_date)

    print(f"Город найден: {full_name}")
    print(f"Координаты: {lat:.2f}, {lon:.2f}")
    print(f"Часовой пояс: {tz_name} (UTC{tz_offset:+.0f})")
    print()

    chart = calculate_natal_chart(
        year=year, month=month, day=day,
        hour=hour, minute=minute,
        lat=lat, lon=lon,
        tz_offset=tz_offset,
    )
    return chart

# 6. JSON-ФОРМАТ ДЛЯ ПРОГРАММЫ / API

def chart_to_json(chart):
    return json.dumps(
        chart,
        ensure_ascii=False,
        indent=2,
    )


def save_chart_json(chart, filename="natal_chart.json"):
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(
            chart,
            f,
            ensure_ascii=False,
            indent=2,
        )
    return filename