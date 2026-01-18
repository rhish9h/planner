import { useState } from 'react'
import './App.css'

interface LifeDomain {
  id: string
  name: string
  color: string
  icon: string
  goals: Goal[]
}

interface Goal {
  id: string
  title: string
  progress: number
  target: number
  unit: string
  deadline?: string
  type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'deadline'
}

const lifeDomains: LifeDomain[] = [
  { 
    id: 'cycling', 
    name: 'Cycling', 
    color: '#10b981', 
    icon: '🚴', 
    goals: [
      { id: 'c1', title: 'Ride 100km this week', progress: 45, target: 100, unit: 'km', type: 'weekly' },
      { id: 'c2', title: 'Cycle 3 times this week', progress: 1, target: 3, unit: 'rides', type: 'weekly' }
    ] 
  },
  { 
    id: 'gym', 
    name: 'Gym', 
    color: '#ef4444', 
    icon: '💪', 
    goals: [
      { id: 'g1', title: 'Gym 3x per week', progress: 2, target: 3, unit: 'sessions', type: 'weekly' },
      { id: 'g2', title: 'Bench press 100kg', progress: 85, target: 100, unit: 'kg', type: 'deadline' }
    ] 
  },
  { 
    id: 'leetcode', 
    name: 'LeetCode', 
    color: '#3b82f6', 
    icon: '💻', 
    goals: [
      { id: 'l1', title: 'Solve 5 problems this week', progress: 2, target: 5, unit: 'problems', type: 'weekly' },
      { id: 'l2', title: 'Complete 200 problems total', progress: 156, target: 200, unit: 'problems', type: 'yearly' }
    ] 
  },
  { id: 'system-design', name: 'System Design', color: '#8b5cf6', icon: '🏗️', goals: [] },
  { id: 'side-project', name: 'Side Project', color: '#f59e0b', icon: '🚀', goals: [] },
  { id: 'socializing', name: 'Socializing', color: '#ec4899', icon: '👥', goals: [] },
  { id: 'travel', name: 'Travel', color: '#06b6d4', icon: '✈️', goals: [] }
]

function App() {
  const [domains, setDomains] = useState<LifeDomain[]>(lifeDomains)
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null)
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [newGoal, setNewGoal] = useState({
    title: '',
    target: '',
    unit: '',
    type: 'weekly' as Goal['type']
  })

  const addGoal = () => {
    if (!selectedDomain || !newGoal.title || !newGoal.target || !newGoal.unit) return

    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      progress: 0,
      target: parseInt(newGoal.target),
      unit: newGoal.unit,
      type: newGoal.type
    }

    setDomains(prev => prev.map(domain => 
      domain.id === selectedDomain 
        ? { ...domain, goals: [...domain.goals, goal] }
        : domain
    ))

    setNewGoal({ title: '', target: '', unit: '', type: 'weekly' })
    setShowGoalForm(false)
  }

  const updateGoalProgress = (domainId: string, goalId: string, increment: number) => {
    setDomains(prev => prev.map(domain => 
      domain.id === domainId 
        ? {
            ...domain,
            goals: domain.goals.map(goal =>
              goal.id === goalId
                ? { ...goal, progress: Math.min(goal.progress + increment, goal.target) }
                : goal
            )
          }
        : domain
    ))
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Life Planner</h1>
        <p>Track your progress across all life domains</p>
      </header>

      <main className="main">
        <div className="domains-grid">
          {domains.map((domain) => (
            <div
              key={domain.id}
              className="domain-card"
              style={{ borderColor: domain.color }}
              onClick={() => setSelectedDomain(domain.id)}
            >
              <div className="domain-header">
                <span className="domain-icon">{domain.icon}</span>
                <h3>{domain.name}</h3>
              </div>
              <div className="domain-stats">
                <span>{domain.goals.length} goals</span>
              </div>
            </div>
          ))}
        </div>

        {selectedDomain && (
          <div className="domain-detail">
            <div className="domain-detail-header">
              <button onClick={() => setSelectedDomain(null)}>← Back</button>
              <h2>{domains.find(d => d.id === selectedDomain)?.name}</h2>
              <button onClick={() => setShowGoalForm(true)}>+ Add Goal</button>
            </div>
            
            <div className="goals-list">
              {domains.find(d => d.id === selectedDomain)?.goals.map(goal => (
                <div key={goal.id} className="goal-card">
                  <h4>{goal.title}</h4>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${(goal.progress / goal.target) * 100}%`,
                        backgroundColor: domains.find(d => d.id === selectedDomain)?.color
                      }}
                    />
                  </div>
                  <div className="goal-info">
                    <p>{goal.progress} / {goal.target} {goal.unit}</p>
                    <div className="goal-actions">
                      <button 
                        onClick={() => updateGoalProgress(selectedDomain, goal.id, 1)}
                        className="progress-btn"
                      >
                        +1
                      </button>
                      {goal.progress > 0 && (
                        <button 
                          onClick={() => updateGoalProgress(selectedDomain, goal.id, -1)}
                          className="progress-btn negative"
                        >
                          -1
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {showGoalForm && (
              <div className="goal-form-overlay">
                <div className="goal-form">
                  <h3>Add New Goal</h3>
                  <input
                    type="text"
                    placeholder="Goal title"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                  />
                  <div className="form-row">
                    <input
                      type="number"
                      placeholder="Target"
                      value={newGoal.target}
                      onChange={(e) => setNewGoal({...newGoal, target: e.target.value})}
                    />
                    <input
                      type="text"
                      placeholder="Unit (e.g., km, problems)"
                      value={newGoal.unit}
                      onChange={(e) => setNewGoal({...newGoal, unit: e.target.value})}
                    />
                  </div>
                  <select
                    value={newGoal.type}
                    onChange={(e) => setNewGoal({...newGoal, type: e.target.value as Goal['type']})}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="deadline">Deadline</option>
                  </select>
                  <div className="form-actions">
                    <button onClick={() => setShowGoalForm(false)}>Cancel</button>
                    <button onClick={addGoal} className="primary">Add Goal</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
