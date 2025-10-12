// src/lib/location.ts

// 브라우저 좌표는 외부 API 없이 가능
export async function getBrowserCoords(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject(new Error("Geolocation not supported"));
      navigator.geolocation.getCurrentPosition(
        (pos: GeolocationPosition) =>
          resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err: GeolocationPositionError) => reject(err),
        { enableHighAccuracy: true, maximumAge: 10_000, timeout: 10_000 }
      );
    });
  }
  
  /** Provider 선택: Kakao/Naver/VWorld/Google 중 하나를 후에 붙일 수 있게 설계 */
  type Provider = "none" | "kakao" | "naver" | "vworld" | "google";
  
  function readProviderFromEnv(): Provider {
    const v = process.env.NEXT_PUBLIC_GEOCODER;
    if (v === "kakao" || v === "naver" || v === "vworld" || v === "google") return v;
    return "none";
  }
  
  const PROVIDER: Provider = readProviderFromEnv();
  
  // ---------- Kakao 타입 정의 & 타입가드 ----------
  type KakaoRegionDoc = {
    region_type?: string; // "H" | "B" 등
    region_3depth_name?: string;
  };
  type KakaoRegionResp = {
    documents?: KakaoRegionDoc[];
  };
  
  function isKakaoRegionResp(x: unknown): x is KakaoRegionResp {
    if (!x || typeof x !== "object") return false;
    const d = (x as { documents?: unknown }).documents;
    return Array.isArray(d);
  }
  
  type KakaoKeywordDoc = {
    place_name?: string;
    road_address_name?: string;
    address_name?: string;
  };
  type KakaoKeywordResp = {
    documents?: KakaoKeywordDoc[];
  };
  
  function isKakaoKeywordResp(x: unknown): x is KakaoKeywordResp {
    if (!x || typeof x !== "object") return false;
    const d = (x as { documents?: unknown }).documents;
    return Array.isArray(d);
  }
  
  // 공통 인터페이스
  async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
    if (PROVIDER === "none") return null; // 키 없으면 이름 못 얻음
    const key = (process.env.NEXT_PUBLIC_GEOCODER_KEY ?? "").trim();
    try {
      if (PROVIDER === "kakao") {
        const res = await fetch(
          `https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?y=${lat}&x=${lng}`,
          { headers: { Authorization: `KakaoAK ${key}` } }
        );
        if (!res.ok) return null;
        const json: unknown = await res.json();
        if (!isKakaoRegionResp(json)) return null;
  
        const docs = json.documents ?? [];
        const h = docs.find((d) => d?.region_type === "H");
        const b = docs.find((d) => d?.region_type === "B");
        const name = h?.region_3depth_name || b?.region_3depth_name || null;
        return name ?? null;
      }
      // 필요 시 다른 Provider 분기 추가(Naver/VWorld/Google)
      return null;
    } catch {
      return null;
    }
  }
  
  export async function getCurrentDong(): Promise<string | null> {
    try {
      const { lat, lng } = await getBrowserCoords();
      return await reverseGeocode(lat, lng); // 키 없으면 null 반환
    } catch {
      return null;
    }
  }
  
  export async function getNearbyDongs(): Promise<string[]> {
    try {
      const { lat, lng } = await getBrowserCoords();
      const d = 0.009; // ~1km
      const pts: Array<[number, number]> = [
        [lat, lng],
        [lat + d, lng],
        [lat - d, lng],
        [lat, lng + d],
        [lat, lng - d],
        [lat + d, lng + d],
        [lat + d, lng - d],
        [lat - d, lng + d],
        [lat - d, lng - d],
      ];
      const names = await Promise.all(pts.map(([y, x]) => reverseGeocode(y, x)));
      return Array.from(new Set(names.filter((s): s is string => Boolean(s))));
    } catch {
      return [];
    }
  }
  
  export async function searchDongByKeyword(q: string): Promise<string[]> {
    if (PROVIDER === "none") return []; // 키 없으면 서버 검색 불가
    const key = (process.env.NEXT_PUBLIC_GEOCODER_KEY ?? "").trim();
  
    if (PROVIDER === "kakao") {
      const res = await fetch(
        `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(q)}`,
        { headers: { Authorization: `KakaoAK ${key}` } }
      );
      if (!res.ok) return [];
      const json: unknown = await res.json();
      if (!isKakaoKeywordResp(json)) return [];
  
      const docs = json.documents ?? [];
      const pick = (d: KakaoKeywordDoc) =>
        d.place_name || d.road_address_name || d.address_name || "";
  
      const candidates: string[] = docs.map(pick).filter(Boolean);
      const extracted = candidates
        .flatMap((s) => s.match(/[가-힣]{1,6}동/g) ?? [])
        .map((s) => s.trim());
  
      return Array.from(new Set(extracted)).slice(0, 15);
    }
    return [];
  }
  