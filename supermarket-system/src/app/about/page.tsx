'use client'

import Link from 'next/link'
import { 
  ShoppingCart, 
  ArrowLeft, 
  Target, 
  Eye, 
  Award, 
  Users, 
  TrendingUp,
  Heart,
  Zap,
  Shield,
  CheckCircle
} from 'lucide-react'

export default function AboutPage() {
  const values = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Customer First',
      description: 'Every decision we make starts with our customers in mind. Your satisfaction drives our success.',
      color: 'bg-red-500'
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Quality Excellence',
      description: 'We partner with trusted brands and maintain the highest standards in product selection and storage.',
      color: 'bg-yellow-500'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Innovation',
      description: 'Embracing technology to provide seamless shopping experiences both in-store and online.',
      color: 'bg-purple-500'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Integrity',
      description: 'Transparent pricing, honest service, and ethical business practices in everything we do.',
      color: 'bg-blue-500'
    }
  ]

  const milestones = [
    { year: '2018', event: 'FreshDrinks founded in Nairobi', icon: '🎉' },
    { year: '2019', event: 'Expanded to Kisumu and Mombasa', icon: '🚀' },
    { year: '2021', event: 'Launched online ordering platform', icon: '💻' },
    { year: '2023', event: 'Opened branches in Nakuru and Eldoret', icon: '🏪' },
    { year: '2024', event: 'Integrated M-Pesa payment system', icon: '📱' },
    { year: '2026', event: 'Serving 10,000+ happy customers', icon: '🎊' }
  ]

  const achievements = [
    { number: '5', label: 'Branches Nationwide' },
    { number: '10K+', label: 'Happy Customers' },
    { number: '50K+', label: 'Products Sold' },
    { number: '98%', label: 'Customer Satisfaction' }
  ]

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-linear-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <ShoppingCart className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-linear-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  FreshDrinks
                </h1>
                <p className="text-xs text-gray-600 font-medium">Supermarket Chain</p>
              </div>
            </Link>
            
            <Link 
              href="/"
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            About <span className="bg-linear-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent">FreshDrinks</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Kenya's trusted supermarket chain dedicated to delivering quality beverages 
            with exceptional service across the nation.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
            <h2 className="text-4xl font-bold mb-6 text-center">
              Our <span className="bg-linear-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent">Story</span>
            </h2>
            <div className="max-w-4xl mx-auto space-y-6 text-gray-700 leading-relaxed text-lg">
              <p>
                Founded in 2018, FreshDrinks began with a simple mission: to make quality beverages 
                accessible to every Kenyan household. What started as a single store in Nairobi's 
                Westlands has grown into a trusted network of five branches spanning Kenya's major cities.
              </p>
              <p>
                We believe that great service shouldn't be a luxury. That's why we've invested heavily 
                in our people, our infrastructure, and our technology. From our friendly in-store staff 
                to our seamless online ordering platform integrated with M-Pesa, we're committed to 
                making your shopping experience as convenient and enjoyable as possible.
              </p>
              <p>
                Today, we're proud to serve over 10,000 customers and have delivered more than 50,000 
                products. But our journey is far from over. We're constantly expanding, innovating, 
                and finding new ways to serve you better.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Mission */}
            <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-2xl p-8 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-linear-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-4 text-gray-900">Our Mission</h3>
              <p className="text-gray-700 text-lg leading-relaxed">
                To provide Kenyans with convenient access to quality beverages through exceptional 
                service, competitive pricing, and innovative technology, while building lasting 
                relationships with our customers and communities.
              </p>
            </div>

            {/* Vision */}
            <div className="bg-linear-to-br from-purple-50 to-purple-100 rounded-2xl p-8 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-linear-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mb-6">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-4 text-gray-900">Our Vision</h3>
              <p className="text-gray-700 text-lg leading-relaxed">
                To become East Africa's most trusted and innovative beverage retail chain, 
                setting the standard for customer service excellence and community engagement 
                while expanding access to quality products nationwide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">
            Our <span className="bg-linear-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent">Values</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className={`w-16 h-16 ${value.color} rounded-xl flex items-center justify-center mb-6 text-white shadow-lg`}>
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">
            Our <span className="bg-linear-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent">Journey</span>
          </h2>
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div
                key={index}
                className="flex items-center gap-6 bg-linear-to-br from-blue-50 to-purple-50 rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="shrink-0">
                  <div className="w-20 h-20 bg-linear-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {milestone.icon}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-bold">
                      {milestone.year}
                    </span>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-gray-700 text-lg font-medium">{milestone.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">
            Our <span className="bg-linear-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent">Impact</span>
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 text-center"
              >
                <div className="text-5xl font-bold bg-linear-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {achievement.number}
                </div>
                <p className="text-gray-600 font-medium">{achievement.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <Users className="w-16 h-16 mx-auto mb-6 text-blue-600" />
            <h2 className="text-4xl font-bold mb-6">
              Our <span className="bg-linear-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent">Team</span>
            </h2>
            <p className="text-xl text-gray-700 leading-relaxed mb-8">
              Behind FreshDrinks is a dedicated team of passionate professionals committed to 
              delivering excellence. From our store managers to our customer service representatives, 
              every team member plays a vital role in creating the exceptional experience our 
              customers have come to expect.
            </p>
            <p className="text-lg text-gray-600">
              We invest in our people through continuous training, competitive benefits, and a 
              supportive work culture. When our team thrives, our customers benefit.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-linear-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 md:p-16 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Join Our Growing Family
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Experience the FreshDrinks difference. Quality products, exceptional service, 
                and unbeatable convenience.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/auth/register"
                  className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  Start Shopping Today
                </Link>
                <Link
                  href="/branches"
                  className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300"
                >
                  Find a Branch
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">FreshDrinks</span>
              </div>
              <p className="text-gray-400">
                Your trusted partner for quality beverages across Kenya
              </p>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link href="/about" className="block text-gray-400 hover:text-white transition-colors">About Us</Link>
                <Link href="/auth/register" className="block text-gray-400 hover:text-white transition-colors">Products</Link>
                <Link href="/branches" className="block text-gray-400 hover:text-white transition-colors">Branches</Link>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Support</h3>
              <div className="space-y-2">
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Contact Us</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">FAQ</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Terms of Service</a>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Contact</h3>
              <div className="space-y-2 text-gray-400">
                <p>📞 +254 700 123 456</p>
                <p>✉️ info@freshdrinks.co.ke</p>
                <p>📍 Westlands, Nairobi</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2026 FreshDrinks Supermarket Chain. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}