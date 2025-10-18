import { useMemo } from "react";

type Props = {
  name: string;
  onClick?: () => void;
  isLoading?: boolean;
};

export default function FillButton({ name, onClick, isLoading = false }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`
        relative flex justify-center items-center
        bg-secondary-500 text-white rounded-[6px] w-full py-3 text-medium-18
        transition-opacity duration-150
        hover:opacity-90 active:opacity-90 cursor-pointer
        disabled:opacity-70
      `}
    >
      {isLoading ? (
        <div
          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
        />
      ) : (
        name
      )}
    </button>
  );
}
