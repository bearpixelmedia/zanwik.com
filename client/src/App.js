import React, { useEffect } from 'react';
import './App.css';

const App = () => {
  useEffect(() => {
    // Redirect to the main API directory website
    window.location.href = 'https://money-19sseidup-byronmccluney.vercel.app';
  }, []);

  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-muted'>
      <div className='text-center space-y-6'>
        <div className='inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-2xl mb-4'>
          <img src='/zanwik-icon.svg' alt='Zanwik' className='w-10 h-10' />
        </div>
        <h1 className='text-4xl font-bold text-foreground mb-2'>
          Redirecting...
        </h1>
        <p className='text-lg text-muted-foreground mb-4'>
          Taking you to the main Zanwik API Directory.
          <br />
          If you're not redirected automatically,{' '}
          <a
            href='https://money-19sseidup-byronmccluney.vercel.app'
            className='underline text-primary'
          >
            click here
          </a>
          .
        </p>
        <div className='mt-6'>
          <span className='text-sm text-muted-foreground'>
            Contact:{' '}
            <a href='mailto:info@zanwik.com' className='underline'>
              info@zanwik.com
            </a>
          </span>
        </div>
      </div>
    </div>
  );
};

export default App;
