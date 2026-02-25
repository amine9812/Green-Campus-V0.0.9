import { Routes, Route } from 'react-router-dom'
import DashboardLayout from './layouts/DashboardLayout'
import AuthGuard from './components/AuthGuard'
import OverviewPage from './pages/OverviewPage'
import RoomsPage from './pages/RoomsPage'
import RoomDetailPage from './pages/RoomDetailPage'
import TicketsPage from './pages/TicketsPage'
import SchedulePage from './pages/SchedulePage'
import LoginPage from './pages/LoginPage'
import AdminPage from './pages/AdminPage'

function App() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<AuthGuard />}>
                <Route path="/" element={<DashboardLayout />}>
                    <Route index element={<OverviewPage />} />
                    <Route path="rooms" element={<RoomsPage />} />
                    <Route path="rooms/:id" element={<RoomDetailPage />} />
                    <Route path="tickets" element={<TicketsPage />} />
                    <Route path="schedule" element={<SchedulePage />} />
                    <Route path="admin" element={<AdminPage />} />
                </Route>
            </Route>
        </Routes>
    )
}

export default App
