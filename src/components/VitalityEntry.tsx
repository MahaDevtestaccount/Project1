import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { Smile, Zap, Moon, Droplets, Activity, Save, CheckCircle } from 'lucide-react';

type VitalityEntry = Database['public']['Tables']['vitality_entries']['Row'];
type VitalityInsert = Database['public']['Tables']['vitality_entries']['Insert'];

export function VitalityEntry() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [entry, setEntry] = useState<Partial<VitalityInsert>>({
    energy_level: 5,
    mood: 5,
    sleep_hours: 8,
    water_intake: 0,
    exercise_minutes: 0,
    notes: '',
  });

  useEffect(() => {
    if (user) {
      loadTodayEntry();
    }
  }, [user]);

  const loadTodayEntry = async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('vitality_entries')
      .select('*')
      .eq('user_id', user!.id)
      .eq('date', today)
      .maybeSingle();

    if (data) {
      setEntry(data);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    setSaved(false);

    try {
      const today = new Date().toISOString().split('T')[0];
      const { error } = await supabase
        .from('vitality_entries')
        .upsert({
          user_id: user.id,
          date: today,
          ...entry,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving entry:', error);
    } finally {
      setLoading(false);
    }
  };

  const SliderInput = ({
    label,
    icon: Icon,
    value,
    onChange,
    min = 1,
    max = 10,
  }: {
    label: string;
    icon: React.ElementType;
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-teal-600" />
          <label className="text-sm font-medium text-gray-700">{label}</label>
        </div>
        <span className="text-lg font-semibold text-teal-600">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Today's Entry</h2>
          <p className="text-gray-600 mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div className="space-y-6">
          <SliderInput
            label="Energy Level"
            icon={Zap}
            value={entry.energy_level || 5}
            onChange={(value) => setEntry({ ...entry, energy_level: value })}
          />

          <SliderInput
            label="Mood"
            icon={Smile}
            value={entry.mood || 5}
            onChange={(value) => setEntry({ ...entry, mood: value })}
          />

          <SliderInput
            label="Sleep Hours"
            icon={Moon}
            value={entry.sleep_hours || 8}
            onChange={(value) => setEntry({ ...entry, sleep_hours: value })}
            min={0}
            max={12}
          />

          <SliderInput
            label="Water Intake (glasses)"
            icon={Droplets}
            value={entry.water_intake || 0}
            onChange={(value) => setEntry({ ...entry, water_intake: value })}
            min={0}
            max={15}
          />

          <SliderInput
            label="Exercise (minutes)"
            icon={Activity}
            value={entry.exercise_minutes || 0}
            onChange={(value) => setEntry({ ...entry, exercise_minutes: value })}
            min={0}
            max={180}
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={entry.notes || ''}
              onChange={(e) => setEntry({ ...entry, notes: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition resize-none"
              placeholder="How are you feeling today? Any achievements or challenges?"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saved ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {loading ? 'Saving...' : 'Save Entry'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
