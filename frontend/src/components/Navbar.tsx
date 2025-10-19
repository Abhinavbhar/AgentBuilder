import { MessageSquare } from 'lucide-react'
import { Button } from './ui/button'
import { useNavigate } from 'react-router-dom'
import { useUserStore, type User } from '@/store/UseUserStore.tsx'
import { useEffect } from 'react'


function Navbar() {
  const navigate = useNavigate()
  const setUser = useUserStore((state) => state.setUser);
    const user = useUserStore((state)=>state.user)
    const logged = !!user

    useEffect(()=>{
      console.log(logged)
      const checkAuth=async()=>{
          const res = await fetch("http://localhost:8080/user/checkauth", {
          method: "GET",
          credentials: "include",
        });
                console.log(res)

        
        if (res.ok) {
          const data: User = await res.json();
          setUser(data);
        }
      }
      if(!logged){

        checkAuth()
      }
        
    },[])
    const getInitial=(name:string|undefined):string=>{
      if(name!=null){
      return name.charAt(0)
    }else{
      return ""
    }
  }


  return (
    <>
      <nav className="border-b bg-white/80 backdrop-blur-sm fixed w-full z-50 h-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between items-center h-full">
            {/* Logo Section */}
            <button className="flex items-center space-x-2 cursor-pointer" onClick={()=>navigate("/")}>
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-slate-900">ChatCraft</span>
            </button>

            {/* Right Section */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="/#features" className="text-slate-600 hover:text-slate-900 transition">
                Features
              </a>
              <a href="/#pricing" className="text-slate-600 hover:text-slate-900 transition">
                Pricing
              </a>
              <a href="/#testimonials" className="text-slate-600 hover:text-slate-900 transition">
                Testimonials
              </a>

              {logged ? (
                <>
                  <Button variant="ghost" className="text-slate-600 hover:text-slate-900 transition cursor-pointer"onClick={() => navigate('/dashboard')}>
                    Dashboard
                  </Button>
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white font-semibold">
                    {getInitial(user?.name)}
                  </div>
                </>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => navigate('/signin')}>
                    Sign In
                  </Button>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => navigate('/signup')}
                  >
                    Get Started
                  </Button>
                        <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                    dashboard
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="h-16" />
    </>
  )
}

export default Navbar
