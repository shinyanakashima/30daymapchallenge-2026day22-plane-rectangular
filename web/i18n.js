// Text for both languages. {name} placeholders are filled from data/facts.json and app state.
window.I18N = {
  en: {
    title: "Japan is made of 19 flat maps. Only on 38 lines do they tell the true distance.",
    lead:
      "Surveys and public drawings in Japan use the <b>Plane Rectangular Coordinate System</b>. " +
      "The country is split into 19 zones (I–XIX); each zone has its own origin and is flattened " +
      "with the Transverse Mercator projection. On the meridian through each origin the scale is set " +
      "to <b>0.9999</b> on purpose, so the scale is exactly 1 only on two lines about <b>{k1km} km</b> " +
      "east and west of the origin. That makes <b>38 lines</b> for the whole country. Everywhere else " +
      "the flat maps stretch or shrink distance a little.",
    modeTrue: "True scale",
    modeExag: "Exaggerated",
    fillDist: "Distance error",
    fillZone: "Zones",
    factorLabel: "Exaggeration",
    exagNote:
      "Each zone's flat map is pinned at its origin. The difference between the flat map and the true " +
      "distance and direction from the origin is multiplied by the factor above. Where zones meet, the 19 maps " +
      "open gaps or overlap.",
    badge: "Distortion exaggerated ×{f}",
    legendTitle: "Flat-map distance vs. true distance (cm per km)",
    shorter: "drawn shorter",
    longer: "drawn longer",
    keyK1: "true distance (scale factor 1): 38 lines",
    keyCM: "origin meridian: about 10 cm short per km (0.9999)",
    keyZB: "zone boundary",
    keyFrame: "framed areas are moved from their true positions",
    viewJapan: "Japan",
    viewHokkaido: "Hokkaido",
    viewTokachi: "Tokachi (XIII)",
    measureTitle: "Measure",
    measureHint: "Click two points on land. The distance measured on the zone's flat map is compared with the true distance on the ellipsoid.",
    measureFirst: "Point A: Zone {z}, scale factor {k} ({cm} cm per km). Click a second point.",
    measureGrid: "Flat map (Zone {z})",
    measureTrue: "True distance (ellipsoid)",
    measureDiff: "Difference",
    measureDiffNote: "{cmkm} cm per km on average",
    measureLonger: "longer on the map",
    measureShorter: "shorter on the map",
    measureCross: "A is in Zone {a} and B is in Zone {b}. They are on separate flat maps, so the distance can't be measured on one plane as it is.",
    measureSea: "Pick a point on land inside one of the 19 zones.",
    measureExag: "Measuring works in the true-scale view.",
    measureAgain: "Click again to start a new measurement.",
    obihiroTitle: "Obihiro sits almost on a line",
    obihiroText:
      "Obihiro is in Zone XIII, <b>{obx} km</b> west of the zone origin (44°N, 144°15′E). " +
      "The true-distance line there runs at {obline} km, so the city lies almost on it, " +
      "about {obgap} km on the origin side. The scale factor at Obihiro City Office is " +
      "<b>{obk}</b>: the flat map draws each kilometre about <b>{obcm} cm</b> short.",
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
      "Transverse Mercator formulas for each zone's origin (checked against pyproj). The distance error is " +
      "(k − 1) × 100,000 cm per km. The lines where k = 1 lie {k1min}–{k1max} km from the origin meridian, " +
      "depending on latitude.</p>" +
      "<p>Measuring: the flat-map distance is the straight-line distance between the two points in the zone's " +
      "plane coordinates (proj4js). The true distance is the geodesic on the GRS80 ellipsoid (GeographicLib).</p>" +
      "<p>Exaggerated view: for every vertex, the zone's plane position is compared with its true distance and " +
      "direction from the zone origin (azimuthal equidistant). The difference is multiplied by the factor shown " +
      "and added to the base map (Lambert conformal conic).</p>" +
      "<h3>Notes</h3><ul>" +
      "<li>Scale factors and distance errors are theoretical values computed with the Transverse Mercator formulas (ellipsoid surface, no height correction).</li>" +
      "<li>Zone boundaries follow the municipalities listed in the notice (MLIT Notice No. 9 of 2002, as amended). Island areas defined by latitude and longitude are split at those limits. Outlines are simplified.</li>" +
      "<li>The exaggerated view exaggerates distortion and is not to scale.</li>" +
      "<li>Okinawa (XV–XVII) and the remote island zones (XIV, XVIII, XIX) are drawn in frames moved from their true positions.</li>" +
      "</ul><h3>Sources</h3><ul>" +
      "<li>Geospatial Information Authority of Japan: Plane Rectangular Coordinate System (MLIT Notice No. 9 of 2002)</li>" +
      "<li>National Land Numerical Information, Administrative Boundaries (N03, 1 Jan 2025), processed by the author</li>" +
      "</ul>",
  },
  ja: {
    title: "日本は19枚の平らな地図でできている。本当の距離を示すのは、38本の線の上だけ。",
    lead:
      "日本の測量や公共の図面は<b>平面直角座標系</b>で作られています。日本を19の区域（第I系〜第XIX系）に分け、" +
      "区域ごとに原点を置いて横メルカトル図法で平面にします。原点を通る南北の線では縮尺をわざと<b>0.9999倍</b>にしているため、" +
      "縮尺がちょうど1倍になるのは、原点から東西に約<b>{k1km} km</b>離れた2本の線の上だけです。19区域で<b>38本</b>。" +
      "それ以外の場所では、平らな地図は距離をわずかに伸ばすか縮めています。",
    modeTrue: "実際の縮尺",
    modeExag: "誇張",
    fillDist: "距離のずれ",
    fillZone: "区域",
    factorLabel: "誇張の倍率",
    exagNote:
      "各系の平らな地図を原点で固定し、原点からの本当の距離・方向との差を上の倍率で拡大しています。" +
      "区域の境目で、19枚の地図の間に隙間や重なりができます。",
    badge: "歪みを{f}倍に誇張",
    legendTitle: "平らな地図の距離と本当の距離のずれ（1kmあたりcm）",
    shorter: "短く描かれる",
    longer: "長く描かれる",
    keyK1: "本当の距離（縮尺係数1）の線：38本",
    keyCM: "原点を通る南北の線：1kmあたり約10cm短い（0.9999）",
    keyZB: "区域の境界",
    keyFrame: "枠の中は位置をずらして表示",
    viewJapan: "日本全体",
    viewHokkaido: "北海道",
    viewTokachi: "十勝（第XIII系）",
    measureTitle: "距離をはかる",
    measureHint: "陸地の2点をクリックしてください。その系の平らな地図で測った距離と、楕円体の上の本当の距離を比べます。",
    measureFirst: "A点：第{z}系、縮尺係数 {k}（1kmあたり{cm} cm）。2点目をクリックしてください。",
    measureGrid: "平らな地図（第{z}系）",
    measureTrue: "本当の距離（楕円体の上）",
    measureDiff: "差",
    measureDiffNote: "平均すると1kmあたり{cmkm} cm",
    measureLonger: "地図の方が長い",
    measureShorter: "地図の方が短い",
    measureCross: "A点は第{a}系、B点は第{b}系です。別々の平面にあるため、そのままでは測れません。",
    measureSea: "19の区域のどれかに入る陸地の点を選んでください。",
    measureExag: "距離は「実際の縮尺」の表示で測れます。",
    measureAgain: "もう一度クリックすると新しく測り直します。",
    obihiroTitle: "帯広は38本の線のほぼ真上",
    obihiroText:
      "帯広は第XIII系にあり、原点（北緯44度、東経144度15分）から西へ<b>{obx} km</b>。" +
      "そこでの縮尺1倍の線は原点から{obline} kmなので、帯広はその線のほぼ真上、原点側に約{obgap} kmの位置です。" +
      "帯広市役所の縮尺係数は<b>{obk}</b>で、平らな地図では1kmあたり約<b>{obcm} cm</b>短く描かれます。",
    hoverZone: "第{z}系",
    hoverK: "縮尺係数 {k} ・ 1kmあたり{cm} cm",
    frameOkinawa: "沖縄",
    frameXIV: "小笠原",
    frameXVIII: "沖ノ鳥島",
    frameXIX: "南鳥島",
    aboutTitle: "計算の方法・注記・出典",
    aboutText:
      "<h3>計算の方法</h3>" +
      "<p>各系は JGD2011 の平面直角座標系（EPSG:6669〜6687）です。GRS80楕円体の横メルカトル図法で、原点を通る南北の線の縮尺係数は0.9999。" +
      "点の縮尺係数 k は、系ごとの原点に対して横メルカトル図法の式で計算しました（pyproj で照合）。" +
      "距離のずれは (k − 1) × 100,000 で、1kmあたりのcmです。縮尺1倍の線は、緯度によって原点を通る南北の線から{k1min}〜{k1max} kmの位置にあります。</p>" +
      "<p>距離の計測：平らな地図の距離は、その系の平面直角座標での2点間の直線距離（proj4js）。本当の距離は、GRS80楕円体の上の測地線の長さ（GeographicLib）です。</p>" +
      "<p>誇張モード：各頂点について、系の平面上の位置と、原点からの本当の距離・方向（正距方位図法）での位置との差を求め、表示した倍率で拡大して基図（ランベルト正角円錐図法）に加えています。</p>" +
      "<h3>注記</h3><ul>" +
      "<li>縮尺係数と距離のずれは、横メルカトル図法の式で計算した理論値です（楕円体面上、標高による補正は含みません）。</li>" +
      "<li>区域の境界は、告示（平成14年国土交通省告示第9号、改正を含む）の市町村単位で作りました。緯度・経度で決められた島の区域は、その範囲で分けています。形は簡略化しています。</li>" +
      "<li>誇張モードは歪みを誇張しており、実際の縮尺ではありません。</li>" +
      "<li>沖縄（第XV〜XVII系）と遠い島の系（第XIV・XVIII・XIX系）は、位置をずらした枠で示しています。</li>" +
      "</ul><h3>出典</h3><ul>" +
      "<li>国土地理院：平面直角座標系（平成14年国土交通省告示第9号）</li>" +
      "<li>国土数値情報（行政区域データ、N03、2025年1月1日時点）を加工して作成</li>" +
      "</ul>",
  },
};
