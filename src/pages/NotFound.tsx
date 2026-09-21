import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CompassIcon } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { PageTransition } from '../components/shared/PageTransition';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <Card padded={false}>
        <EmptyState
          icon={CompassIcon}
          title="This page doesn't exist"
          description="The link may be out of date, or the section has moved. Head back to the dashboard to carry on."
          action={<Button onClick={() => navigate('/')}>Back to dashboard</Button>} />
        
      </Card>
    </PageTransition>);

}