import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';

type VitalityEntry = Database['public']['Tables']['vitality_entries']['Row'];

export function Stats() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<VitalityEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadEntries();
    }
  }, [user]);

  const loadEntries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('vitality_entries')
      .select('*')
      .eq('user_id', user!.id)
      .order('date', { ascending: false });

    if (!error && data) {
      setEntries(data);
    }
    setLoading(false);
  };

  const calculateAverage = (field: keyof VitalityEntry) => {
    const values = entries
      .map((e) => e[field])
      .filter((v) => v !== null) as number[];
    if (values.length === 0) return 0;
    return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Avg Energy</h3>
          <p className="text-3xl font-bold text-teal-600">{calculateAverage('energy_level')}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Avg Mood</h3>
          <p className="text-3xl font-bold text-teal-600">{calculateAverage('mood')}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Avg Sleep</h3>
          <p className="text-3xl font-bold text-teal-600">{calculateAverage('sleep_hours')}h</p>
        </div>
      </div>
    </div>
  );
}
