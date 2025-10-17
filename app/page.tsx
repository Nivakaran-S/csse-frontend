import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-white text-black space-y-[50px] h-[100vh] w-[100vw] flex flex-col items-center justify-center">
      
      <div>
        <p className="text-[30px]">Doctor Booking Portal</p>
      </div>
      <div className="flex items-center justify-center text-white space-x-[20px]">
        <Link href={'/login'} className="bg-black  rounded-full px-[20px] py-[10px]">
          <p>Login</p>
        </Link>
        <Link href={'/register'} className="bg-black rounded-full px-[20px] py-[10px]">
          <p>Register</p>
        </Link>
      </div>
    </div>
  );
}
