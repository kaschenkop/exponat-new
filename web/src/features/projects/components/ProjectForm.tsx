'use client';

import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { useToast } from '@/shared/hooks/use-toast';
import { useTranslations } from 'next-intl';
import * as React from 'react';

export function ProjectForm(): React.ReactElement {
  const t = useTranslations('common');
  const tp = useTranslations('projectsFeature');
  const { toast } = useToast();
  const [name, setName] = React.useState('');

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        toast({ title: t('create'), description: name });
      }}
    >
      <div className="grid gap-2">
        <Label htmlFor="project-name">{tp('nameLabel')}</Label>
        <Input
          id="project-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <Button type="submit">{t('save')}</Button>
    </form>
  );
}
