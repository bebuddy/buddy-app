import type { FeedItem } from "@/types";

const base: FeedItem[] = [
  { id: "1", category: "언어",   dong: "대현동", title: "일본어 고수님 계신가요?", body: "일본어 배우고 싶은데, 학원 다니기는 귀찮아서 과외 찾아보고 있어요. 대면 희망..", hasImage: false },
  { id: "2", category: "취미",   dong: "대현동", title: "바둑 가르쳐 줄 고수님 모십니다", body: "요즘 바둑이 재미있어요. 두달 정도 배워보고 싶어요.", hasImage: false },
  { id: "3", category: "건강",   dong: "대현동", title: "디스크", body: "수술 후 홈트로 꾸준히 관리 중. 교정 자세 팁 구해요.", hasImage: false },
  { id: "4", category: "식물",   dong: "대현동", title: "장미 가지치기 고수", body: "단독주택 장미 가지치기 예쁘게 하고 싶어요.", hasImage: true },
  { id: "5", category: "글쓰기", dong: "대현동", title: "글 쓰는 방법", body: "블라블라 소재 고갈..", hasImage: false },
];

const interestAdds: FeedItem[] = [
  { id: "i1", category: "사진", dong: "대현동", title: "필름카메라 입문 팁", body: "노출/필름 추천/현상소 안내", hasImage: true },
];

export function getMockFeed(opts: { interestOn: boolean }): FeedItem[] {
  const { interestOn } = opts;
  return interestOn ? [...interestAdds, ...base] : base;
}
