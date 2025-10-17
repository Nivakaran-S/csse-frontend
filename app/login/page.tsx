import LoginForm from "../components/LoginForm";


const LoginScreen = () => {
    return (
        <div className="min-h-[89vh] w-full flex flex-row items-center justify-center py-[1rem]">
            
            <LoginForm/>
            <div className="text-black flex flex-col space-y-[20px]">
                <div className="bg-gray-400 px-[10px] py-[10px] rounded-[10px]">
                    <p>Patient</p>
                    <p>Email: test2test</p>
                    <p>Password: test2123</p>
                </div>
                <div className="bg-gray-400 px-[10px] py-[10px] rounded-[10px]">
                    <p>Doctor</p>
                    <p>Email: dr.john.smith@hospital1.com</p>
                    <p>Password: SecurePassword123</p>
                </div>
                <div className="bg-gray-400 px-[10px] py-[10px] rounded-[10px]">
                    <p>Admin</p>
                    <p>Email: admin@medicare.com</p>
                    <p>Password: admin123</p>
                </div>
            </div>
        </div>
    )
}

export default LoginScreen;