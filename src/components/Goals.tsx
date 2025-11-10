import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { Target, Plus, Trash2, CheckCircle, Circle } from 'lucide-react';

type Goal = Database['public']['Tables']['goals']['Row'];
type GoalInsert = Database['public']['Tables']['goals']['Insert'];

export function Goals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newGoal, setNewGoal] = useState<Partial<GoalInsert>>({
    title: '',
    description: '',
    category: 'fitness',
    target_value: 0,
    current_value: 0,
  });

  const categories = [
    { value: 'fitness', label: 'Fitness', color: 'bg-green-100 text-green-800' },
    { value: 'nutrition', label: 'Nutrition', color: 'bg-orange-100 text-orange-800' },
    { value: 'sleep', label: 'Sleep', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'mindfulness', label: 'Mindfulness', color: 'bg-purple-100 text-purple-800' },
    { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800' },
  ];

  useEffect(() => {
    if (user) {
      loadGoals();
    }
  }, [user]);

  const loadGoals = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setGoals(data);
    }
    setLoading(false);
  };

  const handleCreateGoal = async () => {
    if (!user || !newGoal.title || !newGoal.category) return;

    const { error } = await supabase.from('goals').insert({
      user_id: user.id,
      title: newGoal.title,
      description: newGoal.description || '',
      category: newGoal.category,
      target_value: newGoal.target_value || null,
      current_value: newGoal.current_value || 0,
    });

    if (!error) {
      setNewGoal({
        title: '',
        description: '',
        category: 'fitness',
        target_value: 0,
        current_value: 0,
      });
      setShowForm(false);
      loadGoals();
    }
  };

  const handleToggleComplete = async (goal: Goal) => {
    await supabase
      .from('goals')
      .update({ is_completed: !goal.is_completed })
      .eq('id', goal.id);
    loadGoals();
  };

  const handleDeleteGoal = async (goalId: string) => {
    await supabase.from('goals').delete().eq('id', goalId);
    loadGoals();
  };

  const handleUpdateProgress = async (goalId: string, newValue: number) => {
    await supabase
      .from('goals')
      .update({ current_value: newValue })
      .eq('id', goalId);
    loadGoals();
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Goals</h2>
          <p className="text-gray-600 mt-1">Track your wellness objectives</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-teal-700 transition"
        >
          <Plus className="w-5 h-5" />
          New Goal
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Goal</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                placeholder="Run 5km daily"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={newGoal.description}
                onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition resize-none"
                placeholder="Optional description..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={newGoal.category}
                onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleCreateGoal}
                className="flex-1 bg-teal-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-teal-700 transition"
              >
                Create Goal
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {goals.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No goals yet</h3>
          <p className="text-gray-600">Create your first goal to start tracking your progress!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => {
            const category = categories.find((c) => c.value === goal.category);
            const progress = goal.target_value
              ? (goal.current_value / goal.target_value) * 100
              : 0;

            return (
              <div
                key={goal.id}
                className={`bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition ${
                  goal.is_completed ? 'opacity-75' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <button
                      onClick={() => handleToggleComplete(goal)}
                      className="mt-1 text-gray-400 hover:text-teal-600 transition"
                    >
                      {goal.is_completed ? (
                        <CheckCircle className="w-6 h-6 text-teal-600" />
                      ) : (
                        <Circle className="w-6 h-6" />
                      )}
                    </button>
                    <div className="flex-1">
                      <h3
                        className={`text-lg font-semibold ${
                          goal.is_completed ? 'line-through text-gray-500' : 'text-gray-900'
                        }`}
                      >
                        {goal.title}
                      </h3>
                      {goal.description && (
                        <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                      )}
                      <span
                        className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${category?.color}`}
                      >
                        {category?.label}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="text-gray-400 hover:text-red-600 transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {goal.target_value && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium text-gray-900">
                        {goal.current_value} / {goal.target_value}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-teal-600 h-2.5 rounded-full transition-all"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
