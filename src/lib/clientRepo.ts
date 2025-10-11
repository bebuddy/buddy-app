// "use client"는 이 파일을 직접 실행하지 않으므로 페이지/컴포넌트 쪽에만 붙이면 됩니다.
export type PostRecord = {
  id: string;
  createdAt: number;
  category: string;
  title: string;
  unit: string;
  priceKRW: number;
  days: string[];
  timeNote: string;
  paragraphs: string[];
  author: { name: string; age: number; gender: string };

  // 추가
  level?: string | null;
  mentorGender?: string | null;
  mentorTypes?: string[];
  meetPref?: string | null;

  imageUrls: string[]; // dataURL 배열
};
  
  const KEY = "demo_posts_v1";
  
  function loadAll(): Record<string, PostRecord> {
    if (typeof window === "undefined") return {};
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as Record<string, PostRecord>) : {};
    } catch {
      return {};
    }
  }
  
  function saveAll(map: Record<string, PostRecord>) {
    if (typeof window === "undefined") return;
    localStorage.setItem(KEY, JSON.stringify(map));
  }
  
  function uid() {
    return Math.random().toString(36).slice(2, 10);
  }
  
  export function savePost(draft: Omit<PostRecord, "id" | "createdAt">): string {
    const id = uid();
    const map = loadAll();
    map[id] = { ...draft, id, createdAt: Date.now() };
    saveAll(map);
    return id;
  }
  
  export function getPost(id: string): PostRecord | null {
    const map = loadAll();
    return map[id] ?? null;
  }
  