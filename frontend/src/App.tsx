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
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'deadline'
}

const lifeDomains: LifeDomain[] = [
  { 
    id: 'cycling', 
    name: 'Cycling', 
    color: '#10b981', 
    icon: '🚴', 
    goals: [
      { id: 'c1', title: 'Ride 100km this week', progress: 45, target: 100, unit: 'km', type: 'weekly' },
      { id: 'c2', title: 'Cycle 3 times this week', progress: 2, target: 3, unit: 'rides', type: 'weekly' },
      { id: 'c3', title: 'Climb 500m elevation', progress: 320, target: 500, unit: 'm', type: 'weekly' }
    ] 
  },
  { 
    id: 'gym', 
    name: 'Gym', 
    color: '#ef4444', 
    icon: '💪', 
    goals: [
      { id: 'g1', title: 'Gym 3x per week', progress: 2, target: 3, unit: 'sessions', type: 'weekly' },
      { id: 'g2', title: 'Bench press 100kg', progress: 85, target: 100, unit: 'kg', type: 'deadline' },
      { id: 'g3', title: 'Squat 120kg', progress: 105, target: 120, unit: 'kg', type: 'deadline' },
      { id: 'g4', title: 'Deadlift 150kg', progress: 140, target: 150, unit: 'kg', type: 'deadline' }
    ] 
  },
  { 
    id: 'leetcode', 
    name: 'LeetCode', 
    color: '#3b82f6', 
    icon: '💻', 
    goals: [
      { id: 'l1', title: 'Solve 5 problems this week', progress: 3, target: 5, unit: 'problems', type: 'weekly' },
      { id: 'l2', title: 'Complete 200 problems total', progress: 156, target: 200, unit: 'problems', type: 'yearly' },
      { id: 'l3', title: 'Master Dynamic Programming', progress: 12, target: 20, unit: 'patterns', type: 'monthly' }
    ] 
  },
  { 
    id: 'system-design', 
    name: 'System Design', 
    color: '#8b5cf6', 
    icon: '🏗️', 
    goals: [
      { id: 's1', title: 'Complete 10 case studies', progress: 4, target: 10, unit: 'studies', type: 'monthly' },
      { id: 's2', title: 'Design 3 systems from scratch', progress: 1, target: 3, unit: 'systems', type: 'quarterly' },
      { id: 's3', title: 'Read 5 design books', progress: 2, target: 5, unit: 'books', type: 'yearly' }
    ] 
  },
  { 
    id: 'side-project', 
    name: 'Side Project', 
    color: '#f59e0b', 
    icon: '🚀', 
    goals: [
      { id: 'p1', title: 'Complete MVP', progress: 75, target: 100, unit: '%', type: 'deadline' },
      { id: 'p2', title: 'Deploy to production', progress: 30, target: 100, unit: '%', type: 'monthly' },
      { id: 'p3', title: 'Get 100 users', progress: 23, target: 100, unit: 'users', type: 'quarterly' }
    ] 
  },
  { 
    id: 'socializing', 
    name: 'Socializing', 
    color: '#ec4899', 
    icon: '👥', 
    goals: [
      { id: 'so1', title: 'Meet 2 new people this week', progress: 1, target: 2, unit: 'people', type: 'weekly' },
      { id: 's2', title: 'Attend 1 social event', progress: 1, target: 1, unit: 'events', type: 'weekly' },
      { id: 's3', title: 'Call friends 3 times', progress: 2, target: 3, unit: 'calls', type: 'weekly' }
    ] 
  },
  { 
    id: 'travel', 
    name: 'Travel', 
    color: '#06b6d4', 
    icon: '✈️', 
    goals: [
      { id: 't1', title: 'Visit 3 new countries', progress: 1, target: 3, unit: 'countries', type: 'yearly' },
      { id: 't2', title: 'Save $5000 for travel', progress: 3200, target: 5000, unit: '$', type: 'yearly' },
      { id: 't3', title: 'Plan next trip', progress: 60, target: 100, unit: '%', type: 'monthly' }
    ] 
  }
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
          {domains.map((domain) => {
            const totalProgress = domain.goals.reduce((acc, goal) => acc + (goal.progress / goal.target) * 100, 0)
            const avgProgress = domain.goals.length > 0 ? totalProgress / domain.goals.length : 0
            const completedGoals = domain.goals.filter(goal => goal.progress >= goal.target).length
            
            return (
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
                  <div className="stat-item">
                    <span className="stat-number">{domain.goals.length}</span>
                    <span className="stat-label">goals</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{completedGoals}</span>
                    <span className="stat-label">done</span>
                  </div>
                </div>
                {domain.goals.length > 0 && (
                  <div className="domain-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ 
                          width: `${avgProgress}%`,
                          backgroundColor: domain.color
                        }}
                      />
                    </div>
                    <span className="progress-text">{Math.round(avgProgress)}%</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {selectedDomain && (
          <div className="domain-detail">
            <div className="domain-detail-header">
              <button onClick={() => setSelectedDomain(null)}>← Back</button>
              <h2>{domains.find(d => d.id === selectedDomain)?.name}</h2>
              <button onClick={() => setShowGoalForm(true)}>+ Add Goal</button>
            </div>
            
            <div className="goals-list">
              {domains.find(d => d.id === selectedDomain)?.goals.map(goal => {
                const isCompleted = goal.progress >= goal.target
                const progressPercentage = (goal.progress / goal.target) * 100
                
                return (
                  <div key={goal.id} className={`goal-card ${isCompleted ? 'completed' : ''}`}>
                    <div className="goal-header">
                      <h4>{goal.title}</h4>
                      <span className={`goal-type ${goal.type}`}>{goal.type}</span>
                    </div>
                    <div className="progress-section">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ 
                            width: `${progressPercentage}%`,
                            backgroundColor: domains.find(d => d.id === selectedDomain)?.color
                          }}
                        />
                      </div>
                      <div className="goal-info">
                        <p className="progress-text">
                          {goal.progress} / {goal.target} {goal.unit}
                        </p>
                        <span className="progress-percentage">{Math.round(progressPercentage)}%</span>
                      </div>
                    </div>
                    <div className="goal-actions">
                      <button 
                        onClick={() => updateGoalProgress(selectedDomain, goal.id, 1)}
                        className="progress-btn"
                        disabled={isCompleted}
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
                      {isCompleted && (
                        <span className="completed-badge">✓ Complete</span>
                      )}
                    </div>
                  </div>
                )
              })}
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
                    <option value="quarterly">Quarterly</option>
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
