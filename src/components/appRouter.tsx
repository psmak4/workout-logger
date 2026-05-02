import { Suspense, lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import Layout from './layout/layout'

const HomePage = lazy(() => import('@/pages/home'))

const AppRouter = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<HomePage />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </Suspense>
    )
}

export default AppRouter
