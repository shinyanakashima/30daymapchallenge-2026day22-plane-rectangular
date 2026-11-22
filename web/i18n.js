// Text for both languages. {name} placeholders are filled from data/facts.json and app state.
window.I18N = {
  en: {
    title: "Visualizing Japan's Plane Rectangular Coordinate System",
    lead: "Surveys and public survey drawings in Japan use the <b>Plane Rectangular Coordinate System</b>. The country is divided into 19 zones (I–XIX). Each zone has its own origin and is projected with the Transverse Mercator projection. The scale factor on the meridian through the origin is <b>0.9999</b>, so the scale factor is 1 on two lines about <b>{k1km} km</b> east and west of it: <b>38 lines</b> in total. Elsewhere, grid distances are slightly shorter or longer than distances on the ellipsoid.",
    introTitle: "About the Plane Rectangular Coordinate System",
    exagHow: "How the exaggeration works",
    moreKeys: "Other symbols",
    hidePanel: "Hide panel",
    showPanel: "Show panel",
    modeTrue: "True scale",
    modeExag: "Exaggerated",
    fillDist: "Distance difference",
    fillZone: "Zones",
    factorLabel: "Exaggeration",
    exagNote: "Each zone is fixed at its origin. For each point, the difference between its grid position and its position by ellipsoidal distance and azimuth from the origin is multiplied by the factor above. Gaps and overlaps appear at zone boundaries.",
    badge: "Distortion exaggerated ×{f}",
    legendTitle: "Grid distance minus ellipsoidal distance (cm per km)",
    shorter: "grid shorter",
    longer: "grid longer",
    keyK1: "scale factor 1 (38 lines)",
    keyCM: "origin meridian: scale factor 0.9999 (−10 cm per km)",
    keyZB: "zone boundary",
    keyFrame: "framed areas: positions shifted",
    keyGap: "spacing of adjacent scale-factor-1 lines, along a parallel",
    keyPar: "parallel used for the spacing (e.g. 43°N)",
    gapsTitle: "Spacing of adjacent lines",
    gapsNote: "Measured along whole-degree parallels (dotted on the map). On each parallel the scale-factor-1 lines are sorted west to east, and the ellipsoidal distance between adjacent lines is listed. Each pair appears once. Lines of adjacent zones cross, so the order does not follow zone numbers. Click a row to zoom to it.",
    gapLat: "{lat}°N",
    gapLatRow: "{lat}°N",
    gapLine: "{z} {s}",
    gapEast: "east",
    gapWest: "west",
    viewJapan: "Japan",
    viewHokkaido: "Hokkaido",
    viewTokachi: "Tokachi (XIII)",
    measureTitle: "Measure",
    measureHint: "Click two points on land to compare the grid distance in the zone's plane coordinates with the ellipsoidal distance.",
    measureFirst: "Point A: Zone {z}, scale factor {k} ({cm} cm per km). Click a second point.",
    measureGrid: "Grid distance (Zone {z})",
    measureTrue: "Ellipsoidal distance (GRS80)",
    measureDiff: "Difference",
    measureDiffNote: "{cmkm} cm per km on average",
    measureLonger: "grid is longer",
    measureShorter: "grid is shorter",
    measureCross: "A is in Zone {a} and B is in Zone {b}. The points are in different coordinate systems, so a grid distance can't be computed directly.",
    measureSea: "Pick a point on land inside one of the 19 zones.",
    measureExag: "Measuring works in the true-scale view.",
    measureAgain: "Click again to start a new measurement.",
    obihiroTitle: "Obihiro",
    obihiroText: "Obihiro City Office is in Zone XIII, <b>{obx} km</b> west of the origin (44°N, 144°15′E). At this latitude the scale-factor-1 line is {obline} km west of the origin, about {obgap} km from the office. Scale factor: <b>{obk}</b> (about <b>{obcm} cm</b> short per km).",
    hoverZone: "Zone {z}",
    hoverK: "scale factor {k} · {cm} cm per km",
    frameOkinawa: "Okinawa",
    frameXIV: "Ogasawara",
    frameXVIII: "Okinotorishima",
    frameXIX: "Minamitorishima",
    aboutTitle: "How it works · notes · sources",
    aboutText:
      "<h3>How it's calculated</h3>" +
      "<p>Each zone uses JGD2011 / Japan Plane Rectangular CS (EPSG:6669–6687): Transverse Mercator on the GRS80 " +
      "ellipsoid, scale factor 0.9999 on the origin meridian. The point scale factor k is computed from the " +
      "Transverse Mercator formulas for each zone's origin (checked against pyproj). The distance difference is " +
      "(k − 1) × 100,000 cm per km. The lines where k = 1 lie {k1min}–{k1max} km from the origin meridian, " +
      "depending on latitude.</p>" +
      "<p>Measuring: the grid distance is the straight-line distance between the two points in the zone's " +
      "plane coordinates (proj4js). The ellipsoidal distance is the geodesic on the GRS80 ellipsoid (GeographicLib).</p>" +
      "<p>Exaggerated view: for every vertex, the zone's plane position is compared with its position by " +
      "ellipsoidal distance and azimuth from the zone origin (azimuthal equidistant). The difference is multiplied by the factor shown " +
      "and added to the base map (Lambert conformal conic).</p>" +
      "<h3>Notes</h3><ul>" +
      "<li>Scale factors and distance differences are theoretical values computed with the Transverse Mercator formulas (ellipsoid surface, no height correction).</li>" +
      "<li>Zone boundaries follow the municipalities listed in the notice (MLIT Notice No. 9 of 2002, as amended). Island areas defined by latitude and longitude are split at those limits. Outlines are simplified.</li>" +
      "<li>The exaggerated view exaggerates distortion and is not to scale.</li>" +
      "<li>Okinawa (XV–XVII) and the remote island zones (XIV, XVIII, XIX) are drawn in frames moved from their true positions.</li>" +
      "</ul><h3>Sources</h3><ul>" +
      "<li>Geospatial Information Authority of Japan: Plane Rectangular Coordinate System (MLIT Notice No. 9 of 2002)</li>" +
      "<li>National Land Numerical Information, Administrative Boundaries (N03, 1 Jan 2025), processed by the author</li>" +
      "<li>Background land outside Japan: Natural Earth (1:10m countries, via world-atlas)</li>" +
      "</ul>",
  },
  ja: {
    title: "平面直角座標系の可視化",
    lead: "日本の測量や公共測量の図面には<b>平面直角座標系</b>が使われています。全国を19の系（第I系〜第XIX系）に分け、系ごとに原点を置いて横メルカトル図法で投影します。原点を通る子午線上の縮尺係数を<b>0.9999</b>としているため、縮尺係数が1になるのは原点から東西に約<b>{k1km} km</b>の2本の線上で、全国で<b>38本</b>です。それ以外の場所では、座標上の距離は楕円体上の距離よりわずかに短いか長くなります。",
    introTitle: "平面直角座標系について",
    exagHow: "誇張のしかた",
    moreKeys: "そのほかの記号",
    hidePanel: "パネルを隠す",
    showPanel: "パネルを表示",
    modeTrue: "実際の縮尺",
    modeExag: "誇張",
    fillDist: "距離の差",
    fillZone: "系",
    factorLabel: "誇張の倍率",
    exagNote: "各系を原点で固定し、各点の座標上の位置と、原点からの楕円体上の距離・方位による位置との差を上の倍率で拡大しています。系の境界に隙間や重なりが生じます。",
    badge: "歪みを{f}倍に誇張",
    legendTitle: "座標上の距離と楕円体上の距離の差（1kmあたりcm）",
    shorter: "座標上が短い",
    longer: "座標上が長い",
    keyK1: "縮尺係数1の線（38本）",
    keyCM: "原点を通る子午線：縮尺係数0.9999（1kmあたり−10cm）",
    keyZB: "系の境界",
    keyFrame: "枠内は位置をずらして表示",
    keyGap: "隣り合う縮尺係数1の線の間隔（緯線に沿って計測）",
    keyPar: "計測に使った緯線（例：北緯43度）",
    gapsTitle: "隣り合う線の間隔",
    gapsNote: "1度ごとの緯線（地図上の点線）に沿って計測しています。各緯線上で縮尺係数1の線を西から東へ並べ、隣り合う線の間の楕円体上の距離を示します。同じ組み合わせは1回だけ載せています。隣の系の線と交差するため、系の番号順には並びません。行をクリックするとその区間へ拡大します。",
    gapLat: "北緯{lat}度",
    gapLatRow: "北緯{lat}度",
    gapLine: "第{z}系 {s}",
    gapEast: "東",
    gapWest: "西",
    viewJapan: "日本全体",
    viewHokkaido: "北海道",
    viewTokachi: "十勝（第XIII系）",
    measureTitle: "距離をはかる",
    measureHint: "陸地の2点をクリックすると、その系の平面直角座標で求めた距離と、楕円体上の距離を比較します。",
    measureFirst: "A点：第{z}系、縮尺係数 {k}（1kmあたり{cm} cm）。2点目をクリックしてください。",
    measureGrid: "座標上の距離（第{z}系）",
    measureTrue: "楕円体上の距離（GRS80）",
    measureDiff: "差",
    measureDiffNote: "平均すると1kmあたり{cmkm} cm",
    measureLonger: "座標上の方が長い",
    measureShorter: "座標上の方が短い",
    measureCross: "A点は第{a}系、B点は第{b}系です。座標系が異なるため、座標上の距離は直接求められません。",
    measureSea: "いずれかの系に含まれる陸地の点を選んでください。",
    measureExag: "距離は「実際の縮尺」の表示で測れます。",
    measureAgain: "もう一度クリックすると測り直します。",
    obihiroTitle: "帯広",
    obihiroText: "帯広市役所は第XIII系で、原点（北緯44度、東経144度15分）から西へ<b>{obx} km</b>の位置にあります。この緯度での縮尺係数1の線は原点から西へ{obline} kmで、市役所から約{obgap} kmです。縮尺係数は<b>{obk}</b>（1kmあたり約<b>{obcm} cm</b>短い）です。",
    hoverZone: "第{z}系",
    hoverK: "縮尺係数 {k} ・ 1kmあたり{cm} cm",
    frameOkinawa: "沖縄",
    frameXIV: "小笠原",
    frameXVIII: "沖ノ鳥島",
    frameXIX: "南鳥島",
    aboutTitle: "計算の方法・注記・出典",
    aboutText:
      "<h3>計算の方法</h3>" +
      "<p>各系は JGD2011 の平面直角座標系（EPSG:6669〜6687）です。GRS80楕円体の横メルカトル図法で、原点を通る子午線上の縮尺係数は0.9999。" +
      "点の縮尺係数 k は、系ごとの原点に対して横メルカトル図法の式で計算しました（pyproj で照合）。" +
      "距離の差は (k − 1) × 100,000（1kmあたりcm）です。縮尺係数1の線は、緯度によって原点を通る子午線から{k1min}〜{k1max} kmの位置にあります。</p>" +
      "<p>距離の計測：座標上の距離は、その系の平面直角座標での2点間の直線距離（proj4js）。楕円体上の距離は、GRS80楕円体上の測地線の長さ（GeographicLib）です。</p>" +
      "<p>誇張モード：各頂点について、系の平面上の位置と、原点からの楕円体上の距離・方位（正距方位図法）による位置との差を求め、表示した倍率で拡大して基図（ランベルト正角円錐図法）に加えています。</p>" +
      "<h3>注記</h3><ul>" +
      "<li>縮尺係数と距離の差は、横メルカトル図法の式で計算した理論値です（楕円体面上、標高による補正は含みません）。</li>" +
      "<li>区域の境界は、告示（平成14年国土交通省告示第9号、改正を含む）の市町村単位で作りました。緯度・経度で決められた島の区域は、その範囲で分けています。形は簡略化しています。</li>" +
      "<li>誇張モードは歪みを誇張しており、実際の縮尺ではありません。</li>" +
      "<li>沖縄（第XV〜XVII系）と遠い島の系（第XIV・XVIII・XIX系）は、位置をずらした枠で示しています。</li>" +
      "</ul><h3>出典</h3><ul>" +
      "<li>国土地理院：平面直角座標系（平成14年国土交通省告示第9号）</li>" +
      "<li>国土数値情報（行政区域データ、N03、2025年1月1日時点）を加工して作成</li>" +
      "<li>日本以外の背景の陸地：Natural Earth（1:10m 国境、world-atlas 経由）</li>" +
      "</ul>",
  },
};
