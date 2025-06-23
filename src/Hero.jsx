// Hero.jsx
'use client';
import { useState } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/20/solid'; // Import CheckIcon for the features list

const navigation = [
  { name: 'Features', href: '', show: true },
  { name: 'About us', href: '',show: true  },
  { name: 'Tips', href: '',show: true  },


];

const tiers = [
    {
      name: 'Practice Mode',
      id: 'tier-practice',
      href: '#interview',
      priceMonthly: 'Free ',
      priceDescription: 'Free for the first 5 practise interviews',
      description: 'Perfect for beginners looking to build confidence and develop strong interviewing skills through guided practice.',
      features: ['Feedback after each question','Post-interview tips on how to improve', 'Probing questions according to your answers forcing you to elaborate'],
      featured: false,
    },
    {
      name: 'Serious Mode',
      id: 'tier-serious',
      href: '#',
      priceMonthly: 'Free',
      priceDescription: 'Free for the first 2 serious interviews',
      description: 'For experienced candidates seeking realistic interview scenarios with comprehensive feedback to refine their professional presence.',
      features: [
        'Detailed post-interview feedback ',
        'Personalized improvement tips',
        'Proving questions according to your answers forcing errors from the interviewie',
      ],
      featured: true,
    },
  ];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Hero() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="bg-white">
      <header className="absolute inset-x-0 top-0 z-50">
        <nav aria-label="Global" className="flex items-center justify-between p-6 lg:px-8">
          <div className="flex items-center lg:flex-1">
            <a href="#" className="flex items-center ">
              <img
                src="/public/logo.png"
                alt="Interview AI Logo"
                className="h-12 w-12 " // Makes the logo round
                />
              <span className="text-2xl font-sans">Interview AI</span>
            </a>
          </div>
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon aria-hidden="true" className="size-6" />
            </button>
          </div>
          <div className="hidden lg:flex lg:gap-x-12">
            {
            navigation.filter(item => item.show)
            .map((item) => (
              <a key={item.name} href={item.href} className="text-sm/6 font-sans text-gray-900">
                {item.name}
              </a>
            ))}
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            <a href='logIn' className="mt-2 mr-4 text-sm/6 font-sans text-gray-900">
              Log in 
            </a>
      <a href='signupPage' className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-sans text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
        Sign Up 
      </a>
      </div>
    </nav>
    <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
      <div className="fixed inset-0 z-50" />
      <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
      <div className="flex items-center justify-between">
        <a href="#" className="-m-1.5 p-1.5">
        <span className="sr-only">Your Company</span>
        <img
          alt=""
          src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
          className="h-8 w-auto"
        />
        </a>
        <button
        type="button"
        onClick={() => setMobileMenuOpen(false)}
        className="-m-2.5 rounded-md p-2.5 text-gray-700"
        >
        <span className="sr-only">Close menu</span>
        <XMarkIcon aria-hidden="true" className="size-6" />
        </button>
      </div>
      <div className="mt-6 flow-root">
        <div className="-my-6 divide-y divide-gray-500/10">
        <div className="space-y-2 py-6">
          {navigation.map((item) => (
          <a
            key={item.name}
            href={item.href}
            className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-sans text-gray-900 hover:bg-gray-50"
          >
            {item.name}
          </a>
          ))}
        </div>
        <div className="py-6">
          <a
          href="#login"
          className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-sans text-gray-900 hover:bg-gray-50"
          >
          Loggg in
          </a>
        </div>
        </div>
      </div>
      </DialogPanel>
    </Dialog>
    </header>

    <div className="relative isolate px-6 pt-14 lg:px-8">
    <div
      aria-hidden="true"
      className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
    >
      <div
      style={{
        clipPath:
        'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
      }}
      className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
      />
    </div>
     
     
     {//header
       }
        <div className="mx-auto max-w-4xl px-4 py-32 sm:py-48 lg:py-56">
          <div className="hidden sm:mb-8 sm:flex sm:justify-center">
            <div className="relative rounded-full px-3 py-1 text-sm/6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
              Updates daily.{' '}
              <a href="#Updates" className="font-sans text-indigo-600">
                <span aria-hidden="true" className="absolute inset-0" />
                Find out how were improving Interview AI <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </div>
          <div className="text-center">
            
            <h1 style={{ whiteSpace: 'normal' }} className="text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl">
              Your own personalized interview coach
            </h1>
            <p className="mt-8 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">
            Master your interview skills through personalized AI-driven feedback and real-time coaching to excel in your next interview.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              
              <a
                href="/setupInterviewPage"
                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-sans text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Get started
              </a>
              
              <a href="#" className="text-sm/6 font-sans text-gray-900">
                Learn how it works <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
        >
          <div
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
            className="relative left-[calc(50%+3rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
          />
        </div>
      </div>
       {/* Pricing Section */}
       <div className="relative isolate bg-white px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base/7 font-semibold text-indigo-600">Features</h2>
          <p className="mt-2 text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-6xl">
            Choose from two different modes
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg font-medium text-pretty text-gray-600 sm:text-xl/8">
          Select the mode that best fits your interview preparation needs.
        </p>
        <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 items-center gap-y-6 sm:mt-20 sm:gap-y-0 lg:max-w-4xl lg:grid-cols-2">
          {tiers.map((tier, tierIdx) => (
            <div
              key={tier.id}
              className={classNames(
                tier.featured ? 'relative bg-gray-900 shadow-2xl' : 'bg-white/60 sm:mx-8 lg:mx-0',
                tier.featured
                  ? ''
                  : tierIdx === 0
                  ? 'rounded-t-3xl sm:rounded-b-none lg:rounded-tr-none lg:rounded-bl-3xl'
                  : 'sm:rounded-t-none lg:rounded-tr-3xl lg:rounded-bl-none',
                'rounded-3xl p-8 ring-1 ring-gray-900/10 sm:p-10',
              )}
            >
              <h3
                id={tier.id}
                className={classNames(tier.featured ? 'text-indigo-400' : 'text-indigo-600', 'text-base/7 font-semibold')}
              >
                {tier.name}
              </h3>
              <p className="mt-4 flex items-baseline gap-x-2">
                <span
                  className={classNames(
                    tier.featured ? 'text-white' : 'text-gray-900',
                    'text-5xl font-semibold tracking-tight',
                  )}
                >
                  {tier.priceMonthly}
                </span>
                <span className={classNames(tier.featured ? 'text-gray-400' : 'text-gray-500', 'text-base')}>
                  {tier.priceMonthly === 'Free'}
                </span>
              </p>
              <p className={classNames(tier.featured ? 'text-gray-300' : 'text-gray-600', 'mt-6 text-base/7')}>
                {tier.description}
              </p>
              <ul
                role="list"
                className={classNames(
                  tier.featured ? 'text-gray-300' : 'text-gray-600',
                  'mt-8 space-y-3 text-sm/6 sm:mt-10',
                )}
              >
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <CheckIcon
                      aria-hidden="true"
                      className={classNames(tier.featured ? 'text-indigo-400' : 'text-indigo-600', 'h-6 w-5 flex-none')}
                    />
                    {feature}
                  </li>
                ))}
              </ul>
              <a
                href={tier.href}
                aria-describedby={tier.id}
                className={classNames(
                  tier.featured
                    ? 'bg-indigo-500 text-white shadow-xs hover:bg-indigo-400 focus-visible:outline-indigo-500'
                    : 'text-indigo-600 ring-1 ring-indigo-200 ring-inset hover:ring-indigo-300 focus-visible:outline-indigo-600',
                  'mt-8 block rounded-md px-3.5 py-2.5 text-center text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 sm:mt-10',
                )}
              >
                Get Interviewing
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
