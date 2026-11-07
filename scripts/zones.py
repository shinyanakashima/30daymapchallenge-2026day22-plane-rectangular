"""Zone definitions of the Japan Plane Rectangular Coordinate System
(平成14年国土交通省告示第9号, last amended 平成22年国土交通省告示第289号)
and the rule that assigns each N03 polygon to a zone."""

# zone number -> (origin latitude, origin longitude) in degrees
ORIGINS = {
    1: (33.0, 129 + 30 / 60),
    2: (33.0, 131.0),
    3: (36.0, 132 + 10 / 60),
    4: (33.0, 133 + 30 / 60),
    5: (36.0, 134 + 20 / 60),
    6: (36.0, 136.0),
    7: (36.0, 137 + 10 / 60),
    8: (36.0, 138 + 30 / 60),
    9: (36.0, 139 + 50 / 60),
    10: (40.0, 140 + 50 / 60),
    11: (44.0, 140 + 15 / 60),
    12: (44.0, 142 + 15 / 60),
    13: (44.0, 144 + 15 / 60),
    14: (26.0, 142.0),
    15: (26.0, 127 + 30 / 60),
    16: (26.0, 124.0),
    17: (26.0, 131.0),
    18: (20.0, 136.0),
    19: (26.0, 154.0),
}

K0 = 0.9999


def epsg(zone):
    """JGD2011 / Japan Plane Rectangular CS I..XIX = EPSG:6669..6687"""
    return 6668 + zone


PREF_ZONE = {
    "長崎県": 1,
    "福岡県": 2, "佐賀県": 2, "熊本県": 2, "大分県": 2, "宮崎県": 2,
    "山口県": 3, "島根県": 3, "広島県": 3,
    "香川県": 4, "愛媛県": 4, "徳島県": 4, "高知県": 4,
    "兵庫県": 5, "鳥取県": 5, "岡山県": 5,
    "京都府": 6, "大阪府": 6, "福井県": 6, "滋賀県": 6, "三重県": 6, "奈良県": 6, "和歌山県": 6,
    "石川県": 7, "富山県": 7, "岐阜県": 7, "愛知県": 7,
    "新潟県": 8, "長野県": 8, "山梨県": 8, "静岡県": 8,
    "福島県": 9, "栃木県": 9, "茨城県": 9, "埼玉県": 9, "千葉県": 9, "群馬県": 9, "神奈川県": 9,
    "青森県": 10, "秋田県": 10, "山形県": 10, "岩手県": 10, "宮城県": 10,
}

HK_XI_CITIES = {"小樽市", "函館市", "伊達市", "北斗市"}
HK_XI_SUBPREF = {"後志総合振興局", "渡島総合振興局", "檜山振興局"}
HK_XI_IBURI_TOWNS = {"豊浦町", "壮瞥町", "洞爺湖町"}

HK_XIII_CITIES = {"北見市", "帯広市", "釧路市", "網走市", "根室市"}
HK_XIII_SUBPREF = {"十勝総合振興局", "釧路総合振興局", "根室振興局"}
HK_XIII_OKHOTSK_TOWNS = {"美幌町", "津別町", "斜里町", "清里町", "小清水町",
                         "訓子府町", "置戸町", "佐呂間町", "大空町"}

AMAMI = {"奄美市", "大島郡"}  # 奄美群島 (大島郡 covers all other Amami municipalities)


def zone_for(pref, subpref, gun, city, lon, lat):
    """pref/subpref/gun/city: N03_001..N03_004. lon/lat: a point inside the polygon."""
    if pref in PREF_ZONE:
        return PREF_ZONE[pref]
    if pref == "北海道":
        if city in HK_XI_CITIES or subpref in HK_XI_SUBPREF or \
                (subpref == "胆振総合振興局" and city in HK_XI_IBURI_TOWNS):
            return 11
        if city in HK_XIII_CITIES or subpref in HK_XIII_SUBPREF or \
                (subpref == "オホーツク総合振興局" and city in HK_XIII_OKHOTSK_TOWNS):
            return 13
        return 12
    if pref == "鹿児島県":
        east = 130 + 13 / 60 if (city in AMAMI or gun in AMAMI) else 130.0
        if 27.0 <= lat <= 32.0 and 128.3 <= lon <= east:
            return 1
        return 2
    if pref == "沖縄県":
        if lon < 126.0:
            return 16
        if lon > 130.0:
            return 17
        return 15
    if pref == "東京都":
        if lat < 28.0:
            if lon < 140.5:
                return 18
            if lon > 143.0:
                return 19
            return 14
        return 9
    raise ValueError(pref)


ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X",
         "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX"]
