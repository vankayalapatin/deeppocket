// app/page.tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  ArrowRight, 
  BarChart2, 
  PieChart,
  Wallet, 
  Shield, 
  Smartphone, 
  TrendingUp 
} from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <BarChart2 className="h-6 w-6" />
            <span className="text-xl">Financial Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 pt-16 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
                Take control of your financial future
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                Track expenses, manage investments, and reach your financial goals with our all-in-one personal finance dashboard.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup">
                  <Button size="lg" className="w-full sm:w-auto">
                    Get started for free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/demo">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    View demo
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden lg:block relative h-96">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-xl transform -rotate-2">
                <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-xl shadow-lg transform rotate-1 flex items-center justify-center">
                  <div className="relative w-full h-full p-6">
                    <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-4 absolute top-6 left-6 w-64">
                      <h3 className="text-sm font-medium mb-2">Monthly Overview</h3>
                      <div className="h-40 flex items-center justify-center">
                        <PieChart className="h-32 w-32 text-blue-500 dark:text-blue-400" />
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-4 absolute bottom-6 right-6 w-64">
                      <h3 className="text-sm font-medium mb-2">Investment Growth</h3>
                      <div className="h-40 flex items-center justify-center">
                        <TrendingUp className="h-32 w-32 text-green-500 dark:text-green-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Everything you need to manage your finances
            </h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our platform brings all your financial data together in one place, giving you a clear picture of your money.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl">
              <div className="bg-blue-100 dark:bg-blue-900 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Wallet className="h-6 w-6 text-blue-600 dark:text-blue-300" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Expense Tracking</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Automatically categorize and track your spending across all accounts to identify opportunities to save.
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl">
              <div className="bg-green-100 dark:bg-green-900 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-300" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Investment Portfolio</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Monitor your investments in real-time and gain insights into your portfolio&#39;s performance and allocation.
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl">
              <div className="bg-indigo-100 dark:bg-indigo-900 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <PieChart className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Budget Planning</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Create custom budgets and set financial goals to stay on track with automated alerts and reminders.
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl">
              <div className="bg-purple-100 dark:bg-purple-900 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Shield className="h-6 w-6 text-purple-600 dark:text-purple-300" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Secure Banking</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Connect your accounts with bank-level security using 256-bit encryption and multi-factor authentication.
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl">
              <div className="bg-orange-100 dark:bg-orange-900 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <BarChart2 className="h-6 w-6 text-orange-600 dark:text-orange-300" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Financial Reports</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Generate customized reports with detailed analytics to understand your financial health over time.
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl">
              <div className="bg-red-100 dark:bg-red-900 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Smartphone className="h-6 w-6 text-red-600 dark:text-red-300" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Mobile Access</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Monitor your finances on the go with our responsive interface that works on any device.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Trusted by thousands of users
            </h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              See what our customers have to say about how our platform has transformed their financial lives.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow">
              <div className="flex items-center mb-6">
                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-300 text-xl font-bold">
                  JD
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">John Doe</h4>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Small Business Owner</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                &quot;This dashboard has completely changed how I manage both my personal and business finances. I&#39;ve saved thousands by identifying unnecessary expenses.&quot;
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow">
              <div className="flex items-center mb-6">
                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center text-green-600 dark:text-green-300 text-xl font-bold">
                  AS
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Amanda Smith</h4>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Software Engineer</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                &quot;The investment tracking features have been invaluable. I&#39;ve been able to optimize my portfolio and increase my returns significantly.&quot;
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow">
              <div className="flex items-center mb-6">
                <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-300 text-xl font-bold">
                  RJ
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Robert Johnson</h4>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Freelance Designer</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                &quot;As a freelancer with irregular income, the budgeting tools have helped me plan better and ensure I always have enough for taxes and savings.&quot;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-16 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-6">
                Ready to transform your financial future?
              </h2>
              <p className="text-xl opacity-90 mb-8">
                Join thousands of users who have already taken control of their finances with our powerful dashboard.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                    Start for free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent text-white border-white hover:bg-white hover:text-blue-600">
                    Contact sales
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute -top-16 -left-16 w-32 h-32 bg-white/10 rounded-full"></div>
                <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-white/10 rounded-full"></div>
                <div className="bg-white/20 backdrop-blur-lg p-8 rounded-xl">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white/20 p-4 rounded-lg text-center">
                      <p className="text-4xl font-bold">30+</p>
                      <p className="text-sm opacity-90">Financial tools</p>
                    </div>
                    <div className="bg-white/20 p-4 rounded-lg text-center">
                      <p className="text-4xl font-bold">50k</p>
                      <p className="text-sm opacity-90">Active users</p>
                    </div>
                  </div>
                  <div className="bg-white/20 p-4 rounded-lg text-center">
                    <p className="text-4xl font-bold">$2.5M</p>
                    <p className="text-sm opacity-90">Monthly savings by our users</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 font-semibold mb-6">
                <BarChart2 className="h-6 w-6" />
                <span className="text-xl">Financial Dashboard</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                The all-in-one solution for personal finance management.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                  <span className="sr-only">GitHub</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm-3.5 7.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0zm.75 3h-3v6h3v-6zm1.5 0h2.88v1.33a3 3 0 012.12-.83c1.95 0 3.5 1.67 3.5 3.5v2h-3v-1.43c0-.74-.51-1.57-1.5-1.57-.83 0-1.5.62-1.5 1.5v1.5h-3v-6z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Features</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Pricing</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Demo</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Security</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Blog</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Documentation</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Guides</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">About</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Careers</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Press</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              © 2025 Financial Dashboard. All rights reserved.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 text-sm">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 text-sm">
                Terms of Service
              </a>
              <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 text-sm">
                Cookies Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}