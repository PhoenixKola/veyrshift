import React from 'react';
import { createRoot } from 'react-dom/client';
import RendererProof from '../app/RendererProof.js';
import '../app/styles.css';
const root=document.getElementById('renderer-root');
if(!root)throw new Error('Renderer proof root missing');
createRoot(root).render(<React.StrictMode><RendererProof onBack={()=>window.location.assign('/')} /></React.StrictMode>);
