import { MessageSquare } from 'lucide-react'
import { Button } from './ui/button'
import { useNavigate } from 'react-router-dom'

function Navbar() {
  const navigate = useNavigate()

  return (
    <>
      {/* Fixed Navbar */}
      <nav className="border-b bg-white/80 backdrop-blur-sm fixed w-full z-50 h-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between items-center h-full">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-slate-900">ChatCraft</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-600 hover:text-slate-900 transition">Features</a>
              <a href="#pricing" className="text-slate-600 hover:text-slate-900 transition">Pricing</a>
              <a href="#testimonials" className="text-slate-600 hover:text-slate-900 transition">Testimonials</a>
              <Button variant="ghost" onClick={() => navigate("/signin")}>Sign In</Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => navigate("signup")}>Get Started</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer Div: automatically pushes content below the fixed navbar */}
      <div className="h-16" />
    </>
  )
}

export default Navbar
