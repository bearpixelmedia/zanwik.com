import React from 'react';
import { Card, CardContent } from '../components/ui/card';

const Monitoring = () => {
  // TEMPORARY SIMPLE COMPONENT TO DEBUG REACT ERROR
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Monitoring (Debug)</h1>
        <p className="text-muted-foreground">Testing if this page causes the React error.</p>
      </div>
      <Card>
        <CardContent>
          <p>If you can see this, the Monitoring component is not causing the React error.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Monitoring; 