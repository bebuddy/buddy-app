// src/assets/mockdata/userProfiles.ts
export interface UserProfile {
    name: string;
    age: number;
    gender: "남성" | "여성" | "비공개";
    location?: string;
}

export const userProfiles: Record<string, UserProfile> = {
    "1": { name: "김다인", age: 31, gender: "여성" },       // rose
    "2": { name: "박도현", age: 35, gender: "남성" },       // paint
    "3": { name: "이하윤", age: 29, gender: "여성" },       // study
    "4": { name: "최민석", age: 38, gender: "남성" },       // valve
    "5": { name: "정서윤", age: 27, gender: "여성" },       // knit
    "6": { name: "오주형", age: 33, gender: "남성" },       // kimchi
    "7": { name: "한지우", age: 30, gender: "비공개" },     // knit2, interview
    "8": { name: "장미야", age: 57 , gender: "여성", location: "서울시 서대문구" },
    "9": { name: "스누피", age: 61 , gender: "남성", location: "서울시 중랑구" },
    "10": { name: "목왕자", age:62 , gender:"남성", location: "서울시 은평구" },
    "11": { name: "대신뽑아드려요", age:57 , gender: "여성", location: "서울시 서대문구"},
    "12": { name: "이한길", age:71 , gender:"남성", location: "서울시 동작구" },
    "13": { name: "이촌댁", age:61 , gender:"여성", location:"서울시 용산구" }
};
