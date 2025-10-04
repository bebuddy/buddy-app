// 고수 카드

"use client";

type ArticleRandomRes = {
  field: string;
  title: string;
  location: string;
  mentorName?: string;
  birthDate?: string;   // "1970-01-01"
  imageUrlL?: string;
};

export default function MasterCard({
  item,
  brand = "#6163FF",
}: {
  item: ArticleRandomRes;
  brand?: string;
}) {
  const overlay =
    "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.15) 35%, rgba(255,255,255,0.85) 75%, rgba(255,255,255,1) 100%)";
  const bg = item.imageUrlL
    ? `${overlay}, url(${item.imageUrlL})`
    : `${overlay}, linear-gradient(180deg,#cfcfcf,#9e9e9e)`;

  const ageLabel = getKDecadeLabel(item.birthDate); // "50대 중반" 같은 라벨

  return (
    <div
      className="rounded-2xl border border-neutral-200 shadow-sm overflow-hidden bg-white"
      onClick={() => alert(`카드 클릭: ${item.title}`)}
      role="button"
    >
      {/* 이미지 영역 */}
      <div
        className="h-40 bg-center bg-cover"
        style={{ backgroundImage: bg }}
        aria-hidden
      >
        {/* 위치 칩 */}
        <div className="p-3 flex justify-end">
          <div className="px-3 py-1 rounded-full text-[16px] bg-white/90 text-neutral-700 shadow">
            ▼ {item.location}
          </div>
        </div>
      </div>

      {/* 본문 */}
      <div className="p-4">
        <div className="text-[18px] text-neutral-800 leading-6">
          {item.title}
        </div>

        <div className="mt-2 text-[20px] font-extrabold">
          {item.mentorName ? `${item.mentorName}` : "[이름 or 닉네임]"}
          {ageLabel ? `, ${ageLabel}` : ""}
        </div>

        {/* 카테고리 칩(보라색 테두리) */}
        <div className="mt-3">
          <span
            className="px-3 py-1 rounded-full text-[16px] bg-white"
            style={{ border: `1.5px solid ${brand}`, color: brand }}
          >
            {item.field}
          </span>
        </div>
      </div>
    </div>
  );
}

// 출생연도 → "50대 초반/중반/후반" 라벨
function getKDecadeLabel(birth?: string) {
  if (!birth) return "";
  const y = Number(birth.slice(0, 4));
  if (!y) return "";
  const now = new Date();
  const age = now.getFullYear() - y;
  // 월/일은 무시(대략치). 필요하면 month/day 비교로 -1 보정 가능.
  const decade = Math.floor(age / 10) * 10; // 50, 60 ...
  const mod = age % 10;
  const part = mod <= 3 ? "초반" : mod <= 6 ? "중반" : "후반";
  return `${decade}대 ${part}`;
}
