import { useEffect, useMemo, useState } from 'react';
import { FieldErrors } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';

import { Settings } from '@/lib/schema/settings.schema';
import { SETTINGS_TABS } from './constants';

export function useSettingsTab() {
  const { subMenu } = useParams();
  return useMemo(() => SETTINGS_TABS.find((t) => t.path === subMenu) ?? SETTINGS_TABS[0], [subMenu]);
}

export function usePortal(id: string) {
  const [el, setEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setEl(document.getElementById(id));
  }, [id]);

  return el;
}

export function useErrorRedirect() {
  const navigate = useNavigate();

  return (errors: FieldErrors<Settings>) => {
    const firstErrorTab = SETTINGS_TABS.find((tab) => !!errors?.[tab.errorKey as keyof FieldErrors<Settings>]);
    if (!firstErrorTab) return;
    navigate(`/settings/${firstErrorTab.path}`);
  };
}
