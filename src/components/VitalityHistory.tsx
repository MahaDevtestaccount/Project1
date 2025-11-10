import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { Zap, Smile, Moon, Droplets, Activity, Calendar } from 'lucide-react';

type VitalityEntry = Database['public']['Tables']['vitality_entries']['Row'];

export function VitalityHistory() {
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
      .order('date', { ascending: false })
      .limit(30);

    if (!error && data) {
      setEntries(data);
    }
    setLoading(false);
  };

  const MetricBadge = ({
    icon: Icon,
    value,
    label,
    color,
  }: {
    icon: React.ElementType;
    value: number | null;
    label: string;
    color: string;
  }) => (
    <div className="flex items-center gap-1.5">
      <Icon className={`w-4 h-4 ${color}`} />
      <span className="text-sm text-gray-600">
        {label}: <span className="font-medium text-gray-900">{value ?? '-'}</span>
      </span>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent"></div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No entries yet</h3>
          <p className="text-gray-600">Start tracking your vitality by creating your first entry!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Your History</h2>
        <p className="text-gray-600 mt-1">Last 30 days of entries</p>
      </div>

      <div className="space-y-4">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {new Date(entry.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <MetricBadge
                icon={Zap}
                value={entry.energy_level}
                label="Energy"
                color="text-yellow-600"
              />
              <MetricBadge
                icon={Smile}
                value={entry.mood}
                label="Mood"
                color="text-pink-600"
              />
              <MetricBadge
                icon={Moon}
                value={entry.sleep_hours}
                label="Sleep"
                color="text-indigo-600"
              />
              <MetricBadge
                icon={Droplets}
                value={entry.water_intake}
                label="Water"
                color="text-blue-600"
              />
              <MetricBadge
                icon={Activity}
                value={entry.exercise_minutes}
                label="Exercise"
                color="text-green-600"
              />
            </div>

            {entry.notes && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-700 leading-relaxed">{entry.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
