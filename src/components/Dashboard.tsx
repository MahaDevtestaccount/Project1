import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { VitalityEntry } from './VitalityEntry';
import { VitalityHistory } from './VitalityHistory';
import { Goals } from './Goals';
import { Stats } from './Stats';
import { LogOut, Target, TrendingUp, Calendar } from 'lucide-react';

type Tab = 'today' | 'history' | 'goals' | 'stats';

export function Dashboard() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('today');
  const [profile, setProfile] = useState<{ full_name: string | null } | null>(null);

  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle()
        .then(({ data }) => setProfile(data));
    }
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const tabs = [
    { id: 'today' as Tab, label: 'Today', icon: Calendar },
    { id: 'history' as Tab, label: 'History', icon: TrendingUp },
    { id: 'goals' as Tab, label: 'Goals', icon: Target },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Vitality Vault</h1>
              {profile?.full_name && (
                <p className="text-sm text-gray-600">Welcome, {profile.full_name}</p>
              )}
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex gap-2 border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 font-medium transition border-b-2 ${
                    activeTab === tab.id
                      ? 'border-teal-600 text-teal-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          {activeTab === 'today' && <VitalityEntry />}
          {activeTab === 'history' && <VitalityHistory />}
          {activeTab === 'goals' && <Goals />}
        </div>
      </div>
    </div>
  );
}
