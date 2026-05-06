'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Aggregation } from '@/domain/entities/aggregation';
import type { Project } from '@/domain/entities/project';
import { ProjectsTable } from '@/presentation/components/data/projects-table';
import { SessionsTable } from '@/presentation/components/data/sessions-table';
import { TopProjectsList } from '@/presentation/components/data/top-projects-list';
import { Card, CardContent } from '@/presentation/components/ui/card';

interface ProjectsViewProps {
  readonly aggregation: Aggregation;
  readonly hasData: boolean;
  readonly onVisibleRowsChange?: (rows: ReadonlyArray<Project>) => void;
}

export function ProjectsView({ aggregation, hasData, onVisibleRowsChange }: ProjectsViewProps) {
  const t = useTranslations('projects');
  const [selectedProjectKey, setSelectedProjectKey] = useState<string | null>(null);

  const hasProjects = aggregation.projects.length > 0;

  useEffect(() => {
    if (!hasProjects) {
      setSelectedProjectKey(null);
      return;
    }

    const currentExists = selectedProjectKey
      ? aggregation.projects.some((project) => project.key === selectedProjectKey)
      : false;
    if (!currentExists) {
      setSelectedProjectKey(aggregation.projects[0]?.key ?? null);
    }
  }, [aggregation.projects, hasProjects, selectedProjectKey]);

  const selectedProjectName = useMemo(() => {
    if (!selectedProjectKey) return null;
    return aggregation.projects.find((project) => project.key === selectedProjectKey)?.name ?? null;
  }, [aggregation.projects, selectedProjectKey]);

  if (!hasData) return <EmptyState />;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <TopProjectsList projects={aggregation.projects} />
        </div>
        <div className="lg:col-span-8">
          <ProjectsTable
            projects={aggregation.projects}
            selectedProjectKey={selectedProjectKey}
            onSelectProject={setSelectedProjectKey}
            onVisibleRowsChange={onVisibleRowsChange}
          />
        </div>
      </div>

      {selectedProjectKey ? (
        <SessionsTable compact sessions={aggregation.sessions} projectKeyFilter={selectedProjectKey} />
      ) : (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            {t('selectProject')}
          </CardContent>
        </Card>
      )}

      {selectedProjectName ? (
        <p className="text-xs text-muted-foreground">
          {t('selectedProject', { name: selectedProjectName })}
        </p>
      ) : null}
    </div>
  );
}

function EmptyState() {
  const t = useTranslations('overview.empty');
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-2 p-10 text-center">
        <p className="text-sm font-medium text-foreground">{t('title')}</p>
        <p className="max-w-md text-sm text-muted-foreground">{t('subtitle')}</p>
      </CardContent>
    </Card>
  );
}
