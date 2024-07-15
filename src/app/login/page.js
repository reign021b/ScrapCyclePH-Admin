import Image from "next/image";

const Login = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="flex flex-col w-96 items-center bg-white px-6 py-8 rounded-xl shadow-lg">
        <Image src={"/logo.png"} width={60} height={60} />
        <p className="text-green-600 font-semibold text-xl my-3">
          ScrapCycle PH Admin
        </p>
        <form className="flex flex-col w-full items-stretch mt-4 text-gray-800">
          <input
            className="rounded-lg border border-gray-400 mb-4 p-3"
            placeholder="Admin Email"
            type="email"
          ></input>
          <input
            className="rounded-lg border border-gray-400 mb-4 p-3"
            placeholder="Password"
            type="password"
          ></input>
          <button
            type="submit"
            className="bg-green-600 text-white rounded-lg p-2 my-3 hover:bg-green-700 transition-all duration-200"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
