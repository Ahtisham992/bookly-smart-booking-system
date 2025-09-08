// src/pages/About/About.jsx
import { Link } from 'react-router-dom'
import { 
  Calendar, 
  Users, 
  Clock, 
  Star, 
  Target, 
  Heart, 
  Shield, 
  Zap,
  Award,
  Globe,
  TrendingUp
} from 'lucide-react'

const About = () => {
  const stats = [
    { label: 'Active Users', value: '50,000+', icon: Users },
    { label: 'Appointments Booked', value: '1M+', icon: Calendar },
    { label: 'Service Providers', value: '5,000+', icon: Star },
    { label: 'Cities Covered', value: '100+', icon: Globe }
  ]

  const values = [
    {
      icon: Target,
      title: 'Innovation',
      description: 'We leverage cutting-edge AI technology to make appointment booking smarter, faster, and more intuitive than ever before.'
    },
    {
      icon: Heart,
      title: 'Customer-Centric',
      description: 'Every feature we build is designed with our users in mind, ensuring a seamless experience from booking to completion.'
    },
    {
      icon: Shield,
      title: 'Trust & Security',
      description: 'Your data is protected with enterprise-grade security measures, and all service providers are thoroughly verified.'
    },
    {
      icon: Zap,
      title: 'Efficiency',
      description: 'We eliminate the friction in appointment scheduling, saving time for both customers and service providers.'
    }
  ]

  const team = [
    {
      name: 'Sarah Chen',
      role: 'CEO & Co-Founder',
      bio: 'Former product manager at Google with 10+ years in tech. Passionate about using AI to solve everyday problems.',
      image: '/api/placeholder/150/150'
    },
    {
      name: 'Michael Rodriguez',
      role: 'CTO & Co-Founder',
      bio: 'Previously led engineering teams at Uber and Airbnb. Expert in scalable systems and machine learning.',
      image: '/api/placeholder/150/150'
    },
    {
      name: 'Emily Johnson',
      role: 'Head of Product',
      bio: 'Design thinking expert with experience at IDEO and Stripe. Focused on creating delightful user experiences.',
      image: '/api/placeholder/150/150'
    },
    {
      name: 'David Kim',
      role: 'Head of AI',
      bio: 'PhD in Machine Learning from MIT. Previously at OpenAI, specializing in natural language processing.',
      image: '/api/placeholder/150/150'
    }
  ]

  const milestones = [
    {
      year: '2023',
      title: 'Company Founded',
      description: 'Started with a simple idea to make appointment booking effortless using AI technology.'
    },
    {
      year: '2024',
      title: 'Product Launch',
      description: 'Launched our MVP with 50 service providers and 1,000 beta users across 3 cities.'
    },
    {
      year: '2024',
      title: 'Series A Funding',
      description: 'Raised $10M Series A to expand our AI capabilities and geographic reach.'
    },
    {
      year: '2025',
      title: 'Major Expansion',
      description: 'Now serving 100+ cities with 5,000+ providers and 50,000+ active users.'
    }
  ]

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-700 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              About Smart Booking
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto">
              We're revolutionizing how people book appointments by combining artificial intelligence 
              with an intuitive user experience, making scheduling effortless for everyone.
            </p>
            <Link 
              to="/register" 
              className="inline-flex items-center bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Join Us Today
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                    <Icon className="h-8 w-8 text-primary-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                We believe that booking an appointment shouldn't be a hassle. Whether you're scheduling 
                a doctor's visit, a haircut, or a fitness class, the process should be simple, intelligent, 
                and tailored to your needs.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                Our AI-powered platform learns from your preferences and behavior to suggest the best 
                times, providers, and services for you. We're not just a booking system – we're your 
                personal scheduling assistant.
              </p>
              <div className="flex items-center">
                <Award className="h-8 w-8 text-primary-600 mr-3" />
                <div>
                  <div className="font-semibold text-gray-900">Award-Winning Innovation</div>
                  <div className="text-gray-600">Best AI Application 2024 - TechCrunch Disrupt</div>
                </div>
              </div>
            </div>
            <div className="mt-12 lg:mt-0">
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 text-white">
                <TrendingUp className="h-12 w-12 mb-6" />
                <h3 className="text-2xl font-bold mb-4">Growing Fast</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>User Satisfaction</span>
                    <span className="font-bold">98%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Booking Time</span>
                    <span className="font-bold">&lt; 2 min</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Provider Success Rate</span>
                    <span className="font-bold">95%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              These core principles guide everything we do and shape the experience we create for our users.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <div key={index} className="bg-white p-8 rounded-lg shadow-sm border text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-6">
                    <Icon className="h-8 w-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We're a diverse team of technologists, designers, and problem-solvers united by our passion 
              for making appointment booking effortless.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <div className="w-32 h-32 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-4xl font-bold text-gray-600">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-primary-600 font-medium mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-lg text-gray-600">
              From a simple idea to revolutionizing appointment booking worldwide.
            </p>
          </div>
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0 w-24 text-right">
                  <span className="inline-block bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {milestone.year}
                  </span>
                </div>
                <div className="ml-8 bg-white p-6 rounded-lg shadow-sm border flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{milestone.title}</h3>
                  <p className="text-gray-600">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Experience the Future?</h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of satisfied customers who have simplified their lives with Smart Booking.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register" 
              className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Get Started Free
            </Link>
            <Link 
              to="/contact" 
              className="border border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About