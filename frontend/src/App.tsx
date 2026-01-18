import { useState, useEffect } from 'react'
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
  lastCompleted?: string
  streak?: number
  completionHistory?: string[]
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: string
}

interface CelebrationState {
  show: boolean
  goalTitle: string
  domainColor: string
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
      { id: 'g2', title: 'Bench press 100kg', progress: 85, target: 100, unit: 'kg', type: 'deadline', deadline: '2026-02-28' },
      { id: 'g3', title: 'Squat 120kg', progress: 105, target: 120, unit: 'kg', type: 'deadline', deadline: '2026-03-20' },
      { id: 'g4', title: 'Deadlift 150kg', progress: 140, target: 150, unit: 'kg', type: 'deadline', deadline: '2026-04-15' }
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
      { id: 'p1', title: 'Complete MVP', progress: 75, target: 100, unit: '%', type: 'deadline', deadline: '2026-02-10' },
      { id: 'p2', title: 'Deploy to production', progress: 30, target: 100, unit: '%', type: 'monthly', deadline: '2026-03-01' },
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
  const [selectedDomain, setSelectedDomain] = useState<string>('all')
  const [showCompleted, setShowCompleted] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    domains: true,
    allGoals: false,
    timeline: false
  })
  const [celebration, setCelebration] = useState<CelebrationState>({
    show: false,
    goalTitle: '',
    domainColor: ''
  })
  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: 'first-goal', title: 'First Steps', description: 'Complete your first goal', icon: '🎯', unlocked: false },
    { id: 'streak-7', title: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '🔥', unlocked: false },
    { id: 'complete-10', title: 'Perfect Ten', description: 'Complete 10 goals', icon: '⭐', unlocked: false },
    { id: 'all-domains', title: 'Renaissance', description: 'Complete goals in all domains', icon: '🌟', unlocked: false },
    { id: 'streak-30', title: 'Monthly Master', description: 'Maintain a 30-day streak', icon: '💎', unlocked: false }
  ])
  const [newGoal, setNewGoal] = useState({
    domainId: lifeDomains[0]?.id ?? '',
    title: '',
    target: '',
    unit: '',
    type: 'weekly' as Goal['type'],
    deadline: ''
  })

  const addGoal = () => {
    if (!newGoal.domainId || !newGoal.title || !newGoal.target || !newGoal.unit) return

    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      progress: 0,
      target: parseInt(newGoal.target),
      unit: newGoal.unit,
      type: newGoal.type,
      deadline: newGoal.deadline || undefined
    }

    setDomains(prev => prev.map(domain => 
      domain.id === newGoal.domainId
        ? { ...domain, goals: [...domain.goals, goal] }
        : domain
    ))

    setNewGoal({ domainId: newGoal.domainId, title: '', target: '', unit: '', type: 'weekly', deadline: '' })
  }

  const calculateStreak = (goal: Goal, today: string): number => {
    if (!goal.completionHistory || goal.completionHistory.length === 0) return 1
    
    const history = [...goal.completionHistory].sort().reverse()
    let streak = 1
    const todayDate = new Date(today)
    
    for (let i = 0; i < history.length; i++) {
      const currentDate = new Date(history[i])
      const expectedDate = new Date(todayDate)
      
      if (goal.type === 'daily') {
        expectedDate.setDate(todayDate.getDate() - (i + 1))
      } else if (goal.type === 'weekly') {
        expectedDate.setDate(todayDate.getDate() - (i + 1) * 7)
      } else {
        break
      }
      
      const diffDays = Math.abs((currentDate.getTime() - expectedDate.getTime()) / (1000 * 60 * 60 * 24))
      if (diffDays <= 1) {
        streak++
      } else {
        break
      }
    }
    
    return streak
  }

  const updateGoalProgress = (domainId: string, goalId: string, increment: number) => {
    setDomains(prev => prev.map(domain => {
      if (domain.id !== domainId) return domain
      
      return {
        ...domain,
        goals: domain.goals.map(goal => {
          if (goal.id !== goalId) return goal
          
          const newProgress = Math.max(0, Math.min(goal.progress + increment, goal.target))
          const wasCompleted = goal.progress >= goal.target
          const isNowCompleted = newProgress >= goal.target
          
          if (!wasCompleted && isNowCompleted) {
            setCelebration({
              show: true,
              goalTitle: goal.title,
              domainColor: domain.color
            })
            setTimeout(() => setCelebration({ show: false, goalTitle: '', domainColor: '' }), 3000)
            
            const today = new Date().toISOString().split('T')[0]
            const newStreak = calculateStreak(goal, today)
            
            return {
              ...goal,
              progress: newProgress,
              lastCompleted: today,
              streak: newStreak,
              completionHistory: [...(goal.completionHistory || []), today]
            }
          }
          
          return { ...goal, progress: newProgress }
        })
      }
    }))
  }

  const allGoals = domains.flatMap(domain =>
    domain.goals.map(goal => ({ ...goal, domainId: domain.id, domainName: domain.name, domainColor: domain.color, domainIcon: domain.icon }))
  )
  const totalGoals = allGoals.length
  const completedGoals = allGoals.filter(goal => goal.progress >= goal.target).length
  const activeGoals = allGoals.filter(goal => goal.progress < goal.target)
  const overallProgress = totalGoals > 0
    ? allGoals.reduce((acc, goal) => acc + (goal.progress / goal.target) * 100, 0) / totalGoals
    : 0

  useEffect(() => {
    const allGoalsInEffect = domains.flatMap(domain =>
      domain.goals.map(goal => ({ ...goal, domainId: domain.id }))
    )
    
    const completedCount = allGoalsInEffect.filter(g => g.progress >= g.target).length
    const domainsWithCompletions = new Set(allGoalsInEffect.filter(g => g.progress >= g.target).map(g => g.domainId)).size
    const maxStreak = Math.max(...allGoalsInEffect.map(g => g.streak || 0), 0)
    
    setAchievements(prev => prev.map(ach => {
      if (ach.unlocked) return ach
      
      if (ach.id === 'first-goal' && completedCount >= 1) {
        return { ...ach, unlocked: true, unlockedAt: new Date().toISOString() }
      }
      if (ach.id === 'complete-10' && completedCount >= 10) {
        return { ...ach, unlocked: true, unlockedAt: new Date().toISOString() }
      }
      if (ach.id === 'streak-7' && maxStreak >= 7) {
        return { ...ach, unlocked: true, unlockedAt: new Date().toISOString() }
      }
      if (ach.id === 'streak-30' && maxStreak >= 30) {
        return { ...ach, unlocked: true, unlockedAt: new Date().toISOString() }
      }
      if (ach.id === 'all-domains' && domainsWithCompletions >= domains.length) {
        return { ...ach, unlocked: true, unlockedAt: new Date().toISOString() }
      }
      
      return ach
    }))
  }, [domains])
  
  const getPriorityScore = (goal: typeof allGoals[0]): number => {
    let score = 0
    const now = new Date()
    
    if (goal.deadline) {
      const deadline = new Date(goal.deadline)
      const daysUntil = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      if (daysUntil < 0) score += 1000
      else if (daysUntil < 3) score += 500
      else if (daysUntil < 7) score += 300
      else if (daysUntil < 14) score += 100
    }
    
    if (goal.type === 'daily') score += 400
    else if (goal.type === 'weekly') score += 200
    else if (goal.type === 'monthly') score += 50
    
    const progressPercent = (goal.progress / goal.target) * 100
    if (progressPercent > 0 && progressPercent < 100) score += 150
    if (progressPercent > 75) score += 100
    
    return score
  }
  
  const todaysFocus = activeGoals
    .map(goal => ({ ...goal, priorityScore: getPriorityScore(goal) }))
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 5)
  
  const unlockedAchievements = achievements.filter(a => a.unlocked)
  const currentStreak = Math.max(...allGoals.map(g => g.streak || 0), 0)
  const timelineOrder: Goal['type'][] = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'deadline']
  const timelineGoals = [...allGoals].sort((a, b) => {
    const orderDiff = timelineOrder.indexOf(a.type) - timelineOrder.indexOf(b.type)
    if (orderDiff !== 0) return orderDiff
    if (a.deadline && b.deadline) return a.deadline.localeCompare(b.deadline)
    if (a.deadline) return -1
    if (b.deadline) return 1
    return a.title.localeCompare(b.title)
  })
  const groupedTimeline = timelineOrder.map(type => ({
    type,
    goals: timelineGoals.filter(goal => goal.type === type)
  })).filter(group => group.goals.length > 0)
  const formatDeadline = (value?: string) => {
    if (!value) return 'No date set'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'No date set'
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="app">
      {celebration.show && (
        <div className="celebration-overlay">
          <div className="celebration-content">
            <div className="celebration-icon">🎉</div>
            <h2>Goal Completed!</h2>
            <p style={{ color: celebration.domainColor }}>{celebration.goalTitle}</p>
            <div className="confetti"></div>
          </div>
        </div>
      )}
      
      <header className="header">
        <h1>Life Planner</h1>
        <p>Focus on what matters, and see every goal move forward together.</p>
      </header>

      <main className="main">
        <section className="focus-section">
          <div className="focus-header">
            <div>
              <h2>🎯 Today's Focus</h2>
              <p>Your top priorities right now</p>
            </div>
            {currentStreak > 0 && (
              <div className="streak-badge">
                <span className="streak-icon">🔥</span>
                <span className="streak-number">{currentStreak}</span>
                <span className="streak-label">day streak</span>
              </div>
            )}
          </div>
          
          {todaysFocus.length === 0 ? (
            <div className="focus-empty">
              <span className="empty-icon">✨</span>
              <p>All caught up! Add new goals to keep the momentum going.</p>
            </div>
          ) : (
            <div className="focus-grid">
              {todaysFocus.map(goal => {
                const isCompleted = goal.progress >= goal.target
                const progressPercentage = (goal.progress / goal.target) * 100
                const isUrgent = goal.deadline && new Date(goal.deadline).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000
                
                return (
                  <div key={goal.id} className={`focus-card ${isUrgent ? 'urgent' : ''}`}>
                    <div className="focus-card-header">
                      <span className="focus-domain" style={{ color: goal.domainColor }}>
                        {goal.domainIcon} {goal.domainName}
                      </span>
                      <span className={`goal-type ${goal.type}`}>{goal.type}</span>
                    </div>
                    <h3>{goal.title}</h3>
                    {goal.deadline && (
                      <div className="focus-deadline">
                        <span className="deadline-icon">⏰</span>
                        {formatDeadline(goal.deadline)}
                      </div>
                    )}
                    <div className="focus-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ 
                            width: `${progressPercentage}%`,
                            backgroundColor: goal.domainColor
                          }}
                        />
                      </div>
                      <div className="focus-stats">
                        <span>{goal.progress} / {goal.target} {goal.unit}</span>
                        <span className="focus-percentage">{Math.round(progressPercentage)}%</span>
                      </div>
                    </div>
                    <div className="focus-actions">
                      <button 
                        onClick={() => updateGoalProgress(goal.domainId, goal.id, 1)}
                        className="focus-btn primary"
                        disabled={isCompleted}
                      >
                        +1 {goal.unit}
                      </button>
                      {goal.progress > 0 && (
                        <button 
                          onClick={() => updateGoalProgress(goal.domainId, goal.id, -1)}
                          className="focus-btn secondary"
                        >
                          -1
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        <section className="overview">
          <div className="overview-card">
            <p className="eyebrow">Overall Momentum</p>
            <div className="overview-value">{Math.round(overallProgress)}%</div>
            <div className="progress-bar large">
              <div className="progress-fill" style={{ width: `${overallProgress}%` }} />
            </div>
            <p className="overview-subtext">{completedGoals} of {totalGoals} goals completed</p>
          </div>
          <div className="overview-card stats">
            <div className="stat">
              <span className="stat-number">{domains.length}</span>
              <span className="stat-label">Domains</span>
            </div>
            <div className="stat">
              <span className="stat-number">{activeGoals.length}</span>
              <span className="stat-label">Active</span>
            </div>
            <div className="stat">
              <span className="stat-number">{completedGoals}</span>
              <span className="stat-label">Completed</span>
            </div>
          </div>
          <div className="overview-card achievements-card">
            <p className="eyebrow">Achievements</p>
            <div className="achievements-grid">
              {achievements.slice(0, 4).map(ach => (
                <div key={ach.id} className={`achievement-badge ${ach.unlocked ? 'unlocked' : 'locked'}`} title={ach.description}>
                  <span className="achievement-icon">{ach.icon}</span>
                  <span className="achievement-title">{ach.title}</span>
                </div>
              ))}
            </div>
            <p className="achievements-count">{unlockedAchievements.length} / {achievements.length} unlocked</p>
          </div>
          <div className="overview-card form-card">
            <h3>Quick add goal</h3>
            <div className="goal-form">
              <select
                value={newGoal.domainId}
                onChange={(e) => setNewGoal({ ...newGoal, domainId: e.target.value })}
              >
                {domains.map(domain => (
                  <option key={domain.id} value={domain.id}>{domain.name}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Goal title"
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
              />
              <div className="form-row">
                <input
                  type="number"
                  placeholder="Target"
                  value={newGoal.target}
                  onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Unit (e.g., km, sessions)"
                  value={newGoal.unit}
                  onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
                />
              </div>
              <div className="form-row">
                <select
                  value={newGoal.type}
                  onChange={(e) => setNewGoal({ ...newGoal, type: e.target.value as Goal['type'] })}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                  <option value="deadline">Deadline</option>
                </select>
                <button onClick={addGoal} className="primary">Add goal</button>
              </div>
              <div className="form-row">
                <input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                />
                <div className="form-hint">Optional deadline</div>
              </div>
            </div>
          </div>
        </section>

        <section className="collapsible-section">
          <button 
            className="section-toggle"
            onClick={() => setExpandedSections(prev => ({ ...prev, domains: !prev.domains }))}
          >
            <span className="toggle-icon">{expandedSections.domains ? '▼' : '▶'}</span>
            <h2>Life Domains</h2>
            <span className="section-count">{domains.length} domains</span>
          </button>
          
          {expandedSections.domains && (
            <div className="domains-grid">
              {domains.map((domain) => {
                const totalProgress = domain.goals.reduce((acc, goal) => acc + (goal.progress / goal.target) * 100, 0)
                const avgProgress = domain.goals.length > 0 ? totalProgress / domain.goals.length : 0
                const completedDomainGoals = domain.goals.filter(goal => goal.progress >= goal.target).length
                
                return (
                  <div
                    key={domain.id}
                    className="domain-card"
                    style={{ borderColor: domain.color }}
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
                        <span className="stat-number">{completedDomainGoals}</span>
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
          )}
        </section>

        <section className="collapsible-section">
          <button 
            className="section-toggle"
            onClick={() => setExpandedSections(prev => ({ ...prev, allGoals: !prev.allGoals }))}
          >
            <span className="toggle-icon">{expandedSections.allGoals ? '▼' : '▶'}</span>
            <h2>All Goals</h2>
            <span className="section-count">{activeGoals.length} active, {completedGoals} completed</span>
          </button>
          
          {expandedSections.allGoals && (
            <div className="goals-section">
              <div className="goals-header">
                <div>
                  <p>Adjust progress without jumping between screens.</p>
                </div>
                <div className="goals-controls">
                  <button 
                    className={`toggle-completed ${showCompleted ? 'active' : ''}`}
                    onClick={() => setShowCompleted(!showCompleted)}
                  >
                    {showCompleted ? 'Hide' : 'Show'} completed ({completedGoals})
                  </button>
                  <div className="domain-filters">
                    <button
                      className={selectedDomain === 'all' ? 'active' : ''}
                      onClick={() => setSelectedDomain('all')}
                    >
                      All domains
                    </button>
                    {domains.map(domain => (
                      <button
                        key={domain.id}
                        className={selectedDomain === domain.id ? 'active' : ''}
                        onClick={() => setSelectedDomain(domain.id)}
                      >
                        {domain.icon} {domain.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="goals-list">
                {allGoals
                  .filter(goal => selectedDomain === 'all' || goal.domainId === selectedDomain)
                  .filter(goal => showCompleted || goal.progress < goal.target)
                  .map(goal => {
                    const isCompleted = goal.progress >= goal.target
                    const progressPercentage = (goal.progress / goal.target) * 100
                    return (
                      <div key={goal.id} className={`goal-card ${isCompleted ? 'completed' : ''}`}>
                        <div className="goal-header">
                          <div>
                            <span className="goal-domain" style={{ color: goal.domainColor }}>
                              {goal.domainIcon} {goal.domainName}
                            </span>
                            <h4>{goal.title}</h4>
                          </div>
                          <span className={`goal-type ${goal.type}`}>{goal.type}</span>
                        </div>
                        <div className="progress-section">
                          <div className="progress-bar">
                            <div 
                              className="progress-fill" 
                              style={{ 
                                width: `${progressPercentage}%`,
                                backgroundColor: goal.domainColor
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
                            onClick={() => updateGoalProgress(goal.domainId, goal.id, 1)}
                            className="progress-btn"
                            disabled={isCompleted}
                          >
                            +1
                          </button>
                          {goal.progress > 0 && (
                            <button 
                              onClick={() => updateGoalProgress(goal.domainId, goal.id, -1)}
                              className="progress-btn negative"
                            >
                              -1
                            </button>
                          )}
                          {isCompleted && (
                            <span className="completed-badge">✓ Complete</span>
                          )}
                          {goal.streak && goal.streak > 1 && (
                            <span className="streak-mini">🔥 {goal.streak}</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          )}
        </section>

        <section className="collapsible-section">
          <button 
            className="section-toggle"
            onClick={() => setExpandedSections(prev => ({ ...prev, timeline: !prev.timeline }))}
          >
            <span className="toggle-icon">{expandedSections.timeline ? '▼' : '▶'}</span>
            <h2>Timeline View</h2>
            <span className="section-count">By time horizon</span>
          </button>
          
          {expandedSections.timeline && (
            <div className="timeline-section">
              <div className="timeline-header">
                <div>
                  <p>Scan goals by time horizon to keep deadlines in view.</p>
                </div>
                <div className="timeline-legend">
                  <span className="legend-dot" /> Planned cadence
                </div>
              </div>
              <div className="timeline-grid">
                {groupedTimeline.map(group => (
                  <div key={group.type} className="timeline-column">
                    <div className={`timeline-title ${group.type}`}>{group.type}</div>
                    <div className="timeline-items">
                      {group.goals.map(goal => (
                        <div key={goal.id} className="timeline-item">
                          <div className="timeline-marker" style={{ backgroundColor: goal.domainColor }} />
                          <div>
                            <div className="timeline-name">{goal.title}</div>
                            <div className="timeline-meta">
                              <span>{goal.domainIcon} {goal.domainName}</span>
                              <span>{formatDeadline(goal.deadline)}</span>
                            </div>
                          </div>
                          <div className="timeline-progress">
                            <span>{Math.round((goal.progress / goal.target) * 100)}%</span>
                            <div className="progress-bar">
                              <div
                                className="progress-fill"
                                style={{ width: `${(goal.progress / goal.target) * 100}%`, backgroundColor: goal.domainColor }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
