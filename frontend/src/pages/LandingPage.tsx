import React, { useState } from 'react';
import { Button } from '@/components/ui/button.tsx';
import { Card, CardContent } from '@/components/ui/card.tsx';
import { MessageSquare, Zap, Code, Sparkles, ArrowRight, Check, Star, Users, BarChart3, Shield, Rocket } from 'lucide-react';
import {  useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
export default function LandingPage() {
  const [email, setEmail] = useState('');
  const navigate=useNavigate()
  const handleSubmit = () => {
    if (email) {
      alert(`Thanks for signing up! We'll reach out to ${email} soon.`);
      setEmail('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
     <Navbar></Navbar>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              <span>Now with AI-powered responses</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Build Powerful Chatbots
              <span className="text-blue-600"> Without Code</span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              Create intelligent chatbots in minutes. Automate customer support, boost engagement, 
              and scale your business with our intuitive drag-and-drop builder.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <div className="flex gap-2 w-full sm:w-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 w-full sm:w-64"
                />
                <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap">
                  Start Free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-slate-500">No credit card required • 14-day free trial</p>
          </div>

          {/* Hero Image/Demo */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl opacity-10 blur-3xl"></div>
            <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 p-8">
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 min-h-[300px] flex items-center justify-center">
                <div className="text-center space-y-4">
                  <MessageSquare className="h-16 w-16 text-blue-600 mx-auto" />
                  <p className="text-slate-600 font-medium">Your chatbot builder interface here</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-slate-600 mb-8">Trusted by innovative companies worldwide</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-60">
            {['TechCorp', 'InnovateLab', 'GrowthStack', 'DataFlow', 'CloudScale'].map((company) => (
              <div key={company} className="text-2xl font-bold text-slate-400">{company}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Everything you need to build amazing chatbots
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Powerful features that help you create, deploy, and scale chatbots effortlessly
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Code,
                title: 'No Code Required',
                description: 'Build sophisticated chatbots with our intuitive drag-and-drop interface. No programming knowledge needed.'
              },
              {
                icon: Zap,
                title: 'Lightning Fast',
                description: 'Deploy your chatbot in minutes, not weeks. Get up and running with pre-built templates.'
              },
              {
                icon: Sparkles,
                title: 'AI-Powered',
                description: 'Leverage advanced AI to understand user intent and provide intelligent, context-aware responses.'
              },
              {
                icon: Users,
                title: 'Multi-Channel',
                description: 'Deploy your chatbot across web, mobile, WhatsApp, Messenger, and more from a single platform.'
              },
              {
                icon: BarChart3,
                title: 'Analytics & Insights',
                description: 'Track conversations, measure performance, and optimize your chatbot with detailed analytics.'
              },
              {
                icon: Shield,
                title: 'Enterprise Security',
                description: 'Bank-level security with SOC 2 compliance, data encryption, and role-based access control.'
              }
            ].map((feature, idx) => (
              <Card key={idx} className="border-slate-200 hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <feature.icon className="h-12 w-12 text-blue-600 mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Launch your chatbot in 3 simple steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Design', description: 'Choose a template or start from scratch. Customize your chatbot\'s personality and responses with our visual builder.' },
              { step: '02', title: 'Train', description: 'Add your knowledge base, FAQs, and train the AI to understand your business and customers perfectly.' },
              { step: '03', title: 'Deploy', description: 'Launch your chatbot across all your channels with a single click. Monitor and improve as you go.' }
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="text-6xl font-bold text-blue-100 mb-4">{item.step}</div>
                <h3 className="text-2xl font-semibold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Loved by teams everywhere
            </h2>
            <p className="text-xl text-slate-600">See what our customers have to say</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Chen',
                role: 'Head of Customer Success',
                company: 'TechFlow',
                image: '👩‍💼',
                content: 'ChatCraft transformed our customer support. We\'ve reduced response times by 70% and our team can focus on complex issues. The ROI was immediate.',
                rating: 5
              },
              {
                name: 'Marcus Rodriguez',
                role: 'Founder & CEO',
                company: 'GrowthStart',
                image: '👨‍💻',
                content: 'As a non-technical founder, I was able to build and deploy a fully functional chatbot in under an hour. The drag-and-drop builder is incredibly intuitive.',
                rating: 5
              },
              {
                name: 'Emily Thompson',
                role: 'Marketing Director',
                company: 'ShopLocal',
                image: '👩‍🦰',
                content: 'We\'ve seen a 3x increase in lead generation since implementing ChatCraft. The AI responses feel natural and our conversion rate has skyrocketed.',
                rating: 5
              }
            ].map((testimonial, idx) => (
              <Card key={idx} className="border-slate-200">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-slate-700 mb-6 leading-relaxed">"{testimonial.content}"</p>
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{testimonial.image}</div>
                    <div>
                      <div className="font-semibold text-slate-900">{testimonial.name}</div>
                      <div className="text-sm text-slate-600">{testimonial.role} at {testimonial.company}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-slate-600">Choose the plan that fits your needs</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Starter',
                price: '29',
                description: 'Perfect for small businesses',
                features: ['1 chatbot', '1,000 conversations/mo', 'Basic analytics', 'Email support', 'Web integration']
              },
              {
                name: 'Professional',
                price: '99',
                description: 'For growing companies',
                features: ['5 chatbots', '10,000 conversations/mo', 'Advanced analytics', 'Priority support', 'All integrations', 'Custom branding', 'API access'],
                popular: true
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                description: 'For large organizations',
                features: ['Unlimited chatbots', 'Unlimited conversations', 'Dedicated support', 'SLA guarantee', 'Custom integrations', 'White-label', 'Advanced security']
              }
            ].map((plan, idx) => (
              <Card key={idx} className={`border-slate-200 relative ${plan.popular ? 'ring-2 ring-blue-600 shadow-lg' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                  <p className="text-slate-600 mb-4">{plan.description}</p>
                  <div className="mb-6">
                    {plan.price === 'Custom' ? (
                      <div className="text-4xl font-bold text-slate-900">Custom</div>
                    ) : (
                      <>
                        <span className="text-4xl font-bold text-slate-900">${plan.price}</span>
                        <span className="text-slate-600">/month</span>
                      </>
                    )}
                  </div>
                  <Button className={`w-full mb-6 ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-900 hover:bg-slate-800'}`}>
                    {plan.price === 'Custom' ? 'Contact Sales' : 'Start Free Trial'}
                  </Button>
                  <ul className="space-y-3">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start">
                        <Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
            <Rocket className="h-16 w-16 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to transform your customer experience?
            </h2>
            <p className="text-xl mb-8 text-blue-50">
              Join thousands of businesses using ChatCraft to automate support and boost engagement
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <MessageSquare className="h-6 w-6" />
                <span className="text-lg font-bold">ChatCraft</span>
              </div>
              <p className="text-slate-400">Build powerful chatbots without code.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Templates</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400">
            <p>&copy; 2025 ChatCraft. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}