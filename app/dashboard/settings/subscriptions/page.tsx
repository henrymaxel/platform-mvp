'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Check, CreditCard } from 'lucide-react';
import Link from 'next/link';
import LoadingDashboard from '../../loading';

// This would come from your backend in a real app
const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    features: [
      'Up to 3 projects',
      '50,000 AI tokens per month',
      '10 assets per project',
      'Basic writing tools',
    ],
    current: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19.99,
    features: [
      'Up to 10 projects',
      '500,000 AI tokens per month',
      '50 assets per project',
      'Advanced writing tools',
      'Priority support',
    ],
    current: false,
  },
];

export default function SubscriptionsPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState('free');
  const [userPlans, setUserPlans] = useState(plans);

  useEffect(() => {
    // Mock API call to get user's current plan
    setTimeout(() => {
      // In a real app, you'd get this from your API
      const currentPlanId = 'free';
      setCurrentPlan(currentPlanId);
      
      // Update the plans to mark the current one
      setUserPlans(plans.map(plan => ({
        ...plan,
        current: plan.id === currentPlanId
      })));
      
      setLoading(false);
    }, 1000);
  }, []);

  const handleUpgrade = (planId: string) => {
    // This would be an API call in a real app
    alert(`Upgrade to ${planId} plan`);
  };

  if (status === 'loading' || loading) {
    return <LoadingDashboard />;
  }

  if (!session) {
    return <div>Please sign in to view your subscription</div>;
  }

  return (
    <div className="p-4 md:p-6 h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/dashboard/settings" className="mr-4 p-2 hover:bg-gray-700 rounded-full">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold">Subscription</h1>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Plan</h2>
          
          {userPlans.find(plan => plan.current) && (
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">
                  {userPlans.find(plan => plan.current)?.name} Plan
                </h3>
                <p className="text-gray-400">
                  {userPlans.find(plan => plan.current)?.price === 0 
                    ? 'Free' 
                    : `$${userPlans.find(plan => plan.current)?.price}/month`}
                </p>
              </div>
              
              {currentPlan === 'free' && (
                <button 
                  onClick={() => handleUpgrade('pro')}
                  className="px-4 py-2 bg-myred-600 hover:bg-myred-700 rounded"
                >
                  Upgrade
                </button>
              )}
              
              {currentPlan !== 'free' && (
                <button className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded">
                  Manage
                </button>
              )}
            </div>
          )}
        </div>
        
        <h2 className="text-xl font-semibold mb-4">Available Plans</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {userPlans.map((plan) => (
            <div 
              key={plan.id}
              className={`bg-gray-800 rounded-lg p-6 shadow-lg border-2 ${
                plan.current 
                  ? 'border-myred-500' 
                  : 'border-gray-700'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{plan.name}</h3>
                  <p className="text-2xl font-bold mt-2">
                    {plan.price === 0 ? 'Free' : `$${plan.price}/month`}
                  </p>
                </div>
                {plan.current && (
                  <span className="px-3 py-1 bg-myred-500 text-white text-sm rounded-full">
                    Current
                  </span>
                )}
              </div>
              
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check size={18} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              {plan.current ? (
                <button 
                  className="w-full py-2 px-4 bg-gray-700 text-gray-300 rounded disabled:opacity-50"
                  disabled
                >
                  Current Plan
                </button>
              ) : (
                <button 
                  onClick={() => handleUpgrade(plan.id)}
                  className="w-full py-2 px-4 bg-myred-600 hover:bg-myred-700 rounded flex items-center justify-center"
                >
                  <CreditCard size={18} className="mr-2" />
                  {plan.id === 'free' ? 'Downgrade' : 'Upgrade'}
                </button>
              )}
            </div>
          ))}
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Billing History</h2>
          
          {currentPlan === 'free' ? (
            <p className="text-gray-400">No billing history available with the Free plan.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4">Invoice</th>
                    <th className="text-left py-3 px-4">Amount</th>
                    <th className="text-left py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-700">
                    <td className="py-3 px-4">May 1, 2025</td>
                    <td className="py-3 px-4">INV-001</td>
                    <td className="py-3 px-4">$19.99</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-green-500 bg-opacity-20 text-green-400 rounded-full text-xs">
                        Paid
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Apr 1, 2025</td>
                    <td className="py-3 px-4">INV-002</td>
                    <td className="py-3 px-4">$19.99</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-green-500 bg-opacity-20 text-green-400 rounded-full text-xs">
                        Paid
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}