import Image from "next/image";
type ClickCardProps = { name: string; icon: string; onClick?: () => void };

export default function ClickCard({ name, icon, onClick }: ClickCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-[#16161A] hover:bg-[#24242C] rounded-2xl shadow-md h-[140px] w-[195px] p-5 flex flex-col justify-between"
    >
      <div className="flex justify-between">
        <Image src={`/${icon}`} alt={`${name} 아이콘`} width={50} height={50} />
        <Image src="/button.svg" alt="바로가기 버튼" width={37} height={37} />
      </div>
      <div className="text-left">{`${name} 보기`}</div>
    </button>
  );
}
