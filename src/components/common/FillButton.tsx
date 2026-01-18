import AppButton from "@/components/a11y/AppButton";

type Props = {
  name: string;
  onClick?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
};

export default function FillButton({ name, onClick, isLoading = false, disabled }: Props) {
  return (
    <AppButton
      onClick={onClick}
      disabled={isLoading || disabled}
      aria-busy={isLoading || undefined}
      className={`
        relative flex justify-center items-center
        bg-secondary-500 text-white rounded-[6px] w-full py-3 text-medium-18
        transition-opacity duration-150
        hover:opacity-90 active:opacity-90 cursor-pointer
        disabled:opacity-70 max-w-[728px] mx-auto
      `}
    >
      {isLoading ? (
        <div
          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
        />
      ) : (
        name
      )}
    </AppButton>
  );
}
