import React from 'react';
import './App.css';

const ComingSoon = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-muted">
    <div className="text-center space-y-6">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-2xl mb-4">
        <img src="/zanwik-icon.svg" alt="Zanwik" className="w-10 h-10" />
      </div>
      <h1 className="text-4xl font-bold text-foreground mb-2">Coming Soon</h1>
      <p className="text-lg text-muted-foreground mb-4">We're working hard to launch something amazing.<br />Check back soon!</p>
      <div className="mt-6">
        <span className="text-sm text-muted-foreground">Contact: <a href="mailto:info@zanwik.com" className="underline">info@zanwik.com</a></span>
      </div>
    </div>
  </div>
);

const App = () => <ComingSoon />;

export default App;
