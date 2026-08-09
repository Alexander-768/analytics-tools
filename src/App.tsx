import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { HomePage } from './pages/HomePage';
import { JoinsPage } from './pages/JoinsPage';
import { WindowFunctionsPage } from './pages/WindowFunctionsPage';

export function App() { return <BrowserRouter><Routes><Route element={<AppLayout/>}><Route index element={<HomePage/>}/><Route path="window-functions" element={<WindowFunctionsPage/>}/><Route path="joins" element={<JoinsPage/>}/></Route></Routes></BrowserRouter>; }
