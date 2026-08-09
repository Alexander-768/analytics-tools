import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { HomePage } from './pages/HomePage';
import { JoinsPage } from './pages/JoinsPage';
import { WindowFunctionsPage } from './pages/WindowFunctionsPage';
import { SqlCategoryPage } from './pages/SqlCategoryPage';
import { AbTestingCategoryPage } from './pages/AbTestingCategoryPage';
import { SampleSizePage } from './pages/SampleSizePage';

export function App() { return <BrowserRouter><Routes><Route element={<AppLayout/>}><Route index element={<HomePage/>}/><Route path="sql" element={<SqlCategoryPage/>}/><Route path="sql/window-functions" element={<WindowFunctionsPage/>}/><Route path="sql/joins" element={<JoinsPage/>}/><Route path="ab-testing" element={<AbTestingCategoryPage/>}/><Route path="ab-testing/sample-size" element={<SampleSizePage/>}/><Route path="window-functions" element={<Navigate to="/sql/window-functions" replace/>}/><Route path="joins" element={<Navigate to="/sql/joins" replace/>}/></Route></Routes></BrowserRouter>; }
