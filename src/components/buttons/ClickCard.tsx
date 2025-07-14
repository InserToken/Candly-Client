import Image from "next/image";
type ClickCardProps = { name: string; icon: string };

export default function ClickCard({ name, icon }: ClickCardProps) {
  return (
    <div className="bg-[#16161A] rounded-2xl shadow-md h-[140px] w-[195px] p-5 flex flex-col justify-between">
      <div className="flex justify-between">
        <Image src={`/${icon}`} alt={`${name} 아이콘`} width={50} height={50} />
        <Image src="/button.svg" alt="바로가기 버튼" width={37} height={37} />
      </div>
      <div>{`${name} 보기`}</div>
    </div>
  );
}
