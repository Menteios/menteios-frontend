import Sidebar from '../components/Sidebar'

export default function DashboardLayout({ activeTab, onSelectTab, children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} onSelectTab={onSelectTab} />
      <main className="flex-1 px-10 py-10">{children}</main>
    </div>
  )
}
