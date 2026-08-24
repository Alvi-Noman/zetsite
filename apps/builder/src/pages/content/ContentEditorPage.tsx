import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Check,
  Loader2,
  Undo2,
  Redo2,
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  X,
  Palette,
  Layers,
  LayoutTemplate,
  Blocks,
  Link2,
  ArrowLeft,
  Sparkles,
  Settings2,
  BarChart3,
  Share2,
} from 'lucide-react';
import clsx from 'clsx';
import type {
  AudienceVariant,
  LandingPageGenerationMeta,
  LandingPagePixels,
  LandingPageSchedule,
  LandingPageSeo,
  LandingPageThemeId,
  PageMeta,
  PageSection,
  ThemeGlobalSettings,
  ThemeId,
} from '@zetsite/shared';
import { LANDING_PAGE_THEMES, LANDING_PAGE_THEME_RENDERERS, DEFAULT_LANDING_PAGE_THEME_ID } from '@zetsite/shared/landingThemes';
import type { Theme } from '@zetsite/theme-kit';
import { renderSections } from '@zetsite/theme-kit';
import { minimalTheme, starterTemplates as minimalTemplates, type StarterTemplate } from '@zetsite/theme-minimal';
import { boldTheme, starterTemplates as boldTemplates } from '@zetsite/theme-bold';
import { advertorialTheme, starterTemplates as advertorialTemplates } from '@zetsite/theme-advertorial';
import { funnelTheme, starterTemplates as funnelTemplates } from '@zetsite/theme-funnel';
import { editorialTheme, starterTemplates as editorialTemplates } from '@zetsite/theme-editorial';
import { adFunnelTheme, starterTemplates as adFunnelTemplates } from '@zetsite/theme-ad-funnel';
import { conversionProTheme, starterTemplates as conversionProTemplates } from '@zetsite/theme-conversion-pro';
import { productLaunchTheme, starterTemplates as productLaunchTemplates } from '@zetsite/theme-product-launch';
import { lookbookTheme, starterTemplates as lookbookTemplates } from '@zetsite/theme-lookbook';
import { api } from '@/lib/api';
import { buildStorefrontUrl } from '@/lib/storefrontLink';
import { useAuth } from '@/context/AuthContext';
import { Button, IconButton, Select, Badge, Input } from '@/components/ui';
import SectionList from './SectionList';
import SettingsPanel from './SettingsPanel';
import BlockSettingsPanel from './BlockSettingsPanel';
import DesignPanel from './DesignPanel';
import Canvas, { type DeviceKind } from './Canvas';
import RevisionHistory from './RevisionHistory';
import TemplatesModal from './TemplatesModal';
import GlobalSectionsModal from './GlobalSectionsModal';
import { useUndoRedo } from './useUndoRedo';
import LandingPageSettingsPanel from '@/pages/storefront/LandingPageSettingsPanel';
import LandingPageAnalyticsModal from '@/pages/storefront/LandingPageAnalyticsModal';
import LandingPageShareModal from '@/pages/storefront/LandingPageShareModal';
import LandingPageToolsMenu from '@/pages/storefront/LandingPageToolsMenu';

const SECTION_ORDER_WEIGHT: Record<string, number> = {
  hero: 0,
  heroSlideshow: 0,
  countdownBanner: 1,
  gallery: 2,
  richText: 3,
  comparisonTable: 4,
  featuredCollection: 5,
  multiColumn: 5,
  logoBar: 6,
  socialProofBar: 6,
  faq: 8,
  newsletter: 9,
  contactForm: 9,
};

const THEMES: Record<ThemeId, Theme> = {
  minimal: minimalTheme,
  bold: boldTheme,
  advertorial: advertorialTheme,
  funnel: funnelTheme,
  editorial: editorialTheme,
  'ad-funnel': adFunnelTheme,
  'conversion-pro': conversionProTheme,
  'product-launch': productLaunchTheme,
  lookbook: lookbookTheme,
};
const STARTER_TEMPLATES: Record<ThemeId, StarterTemplate[]> = {
  minimal: minimalTemplates,
  bold: boldTemplates,
  advertorial: advertorialTemplates,
  funnel: funnelTemplates,
  editorial: editorialTemplates,
  'ad-funnel': adFunnelTemplates,
  'conversion-pro': conversionProTemplates,
  'product-launch': productLaunchTemplates,
  lookbook: lookbookTemplates,
};
// Deliberately excludes 'product-launch'/'lookbook' — landing-page-only
// themes (see LANDING_PAGE_THEMES), not offered for the storefront home/popup.
const THEME_OPTIONS: { id: ThemeId; name: string }[] = [
  { id: 'minimal', name: 'Minimal' },
  { id: 'bold', name: 'Bold' },
  { id: 'advertorial', name: 'Advertorial' },
  { id: 'funnel', name: 'Funnel' },
  { id: 'editorial', name: 'Editorial' },
  { id: 'ad-funnel', name: 'Ad Funnel' },
  { id: 'conversion-pro', name: 'Conversion Pro' },
];
const PAGES: { id: 'home' | 'popup'; label: string }[] = [
  { id: 'home', label: 'Homepage' },
  { id: 'popup', label: 'Popup' },
];

type RightPanelMode = 'section' | 'design' | 'landing-settings';
type PageContext = { kind: 'home' | 'popup' } | { kind: 'landing'; id: string };

const DEFAULT_SEO: LandingPageSeo = { metaTitle: '', metaDescription: '', ogImage: '', canonicalUrl: '', noindex: false };
const DEFAULT_PIXELS: LandingPagePixels = { googleAnalyticsId: '', facebookPixelId: '', tiktokPixelId: '' };
const DEFAULT_SCHEDULE: LandingPageSchedule = { publishAt: null, unpublishAt: null };

function isTypingTarget(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false;
  return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable;
}

export default function ContentEditorPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const storeSlug = user?.store?.slug ?? '';

  const urlType = searchParams.get('type');
  const landingId = searchParams.get('id');
  const isLanding = urlType === 'landing' && !!landingId;

  const [page, setPage] = useState<'home' | 'popup'>(urlType === 'popup' ? 'popup' : 'home');
  const pageContext: PageContext = isLanding ? { kind: 'landing', id: landingId! } : { kind: page };
  const basePath = pageContext.kind === 'landing' ? `/landing-pages/${pageContext.id}` : `/pages/${pageContext.kind}`;
  const history = useUndoRedo<PageSection[]>([]);
  const sections = history.value;

  const [loaded, setLoaded] = useState(false);
  const [activeThemeId, setActiveThemeId] = useState<ThemeId>('minimal');
  const [landingThemeId, setLandingThemeId] = useState<LandingPageThemeId>(DEFAULT_LANDING_PAGE_THEME_ID);
  const [globalSettings, setGlobalSettings] = useState<ThemeGlobalSettings>(THEMES.minimal.defaultGlobalSettings);
  const [meta, setMeta] = useState<PageMeta>({ triggerType: 'delay', triggerValue: 5 });
  const [landingTitle, setLandingTitle] = useState('');
  const [landingSlug, setLandingSlug] = useState('');
  const [landingGeneration, setLandingGeneration] = useState<LandingPageGenerationMeta | null>(null);
  const [enhancing, setEnhancing] = useState(false);
  const [seo, setSeo] = useState<LandingPageSeo>(DEFAULT_SEO);
  const [pixels, setPixels] = useState<LandingPagePixels>(DEFAULT_PIXELS);
  const [headCode, setHeadCode] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [pinned, setPinned] = useState(false);
  const [schedule, setSchedule] = useState<LandingPageSchedule>(DEFAULT_SCHEDULE);
  const [passwordProtected, setPasswordProtected] = useState(false);
  const [audienceVariants, setAudienceVariants] = useState<AudienceVariant[]>([]);
  const [returningVisitorHeading, setReturningVisitorHeading] = useState('');
  const [unavailableRedirect, setUnavailableRedirect] = useState(false);
  const [checklist, setChecklist] = useState<{ key: string; label: string; passed: boolean }[]>([]);
  const [orderWarnings, setOrderWarnings] = useState<string[]>([]);
  const [productOutOfStock, setProductOutOfStock] = useState(false);
  const [sourceProductHandle, setSourceProductHandle] = useState<string | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<{ sectionId: string; blockId: string } | null>(null);
  const [device, setDevice] = useState<DeviceKind>('desktop');
  const [rightPanel, setRightPanel] = useState<RightPanelMode>('section');
  const [previewMode, setPreviewMode] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showGlobalLibrary, setShowGlobalLibrary] = useState(false);
  const [previewLink, setPreviewLink] = useState<string | null>(null);

  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | 'error'>('saved');
  const [publishing, setPublishing] = useState(false);

  const [sectionClipboard, setSectionClipboard] = useState<PageSection | null>(null);
  const [styleClipboard, setStyleClipboard] = useState<{ sectionType: string; settings: Record<string, unknown> } | null>(
    null,
  );

  const theme = THEMES[activeThemeId];
  const primaryId = selectedIds[selectedIds.length - 1] ?? null;
  const selectedSection = useMemo(() => sections.find((s) => s.id === primaryId) ?? null, [sections, primaryId]);
  const selectedBlockData = useMemo(() => {
    if (!selectedBlock) return null;
    const section = sections.find((s) => s.id === selectedBlock.sectionId);
    return section?.blocks?.find((b) => b.id === selectedBlock.blockId) ?? null;
  }, [sections, selectedBlock]);

  useEffect(() => {
    setLoaded(false);
    if (pageContext.kind === 'landing') {
      Promise.all([api.get(`${basePath}/draft`), api.get('/themes/active')]).then(([draftRes, themeRes]) => {
        history.reset(draftRes.data.sections);
        setLandingTitle(draftRes.data.title ?? '');
        setLandingSlug(draftRes.data.slug ?? '');
        setLandingGeneration(draftRes.data.generation ?? null);
        setSeo(draftRes.data.seo ?? DEFAULT_SEO);
        setPixels(draftRes.data.pixels ?? DEFAULT_PIXELS);
        setHeadCode(draftRes.data.headCode ?? '');
        setTags(draftRes.data.tags ?? []);
        setPinned(!!draftRes.data.pinned);
        setSchedule(draftRes.data.schedule ?? DEFAULT_SCHEDULE);
        setPasswordProtected(!!draftRes.data.passwordProtected);
        setAudienceVariants(draftRes.data.audienceVariants ?? []);
        setReturningVisitorHeading(draftRes.data.returningVisitorHeading ?? '');
        setUnavailableRedirect(!!draftRes.data.unavailableRedirect);
        setChecklist(draftRes.data.checklist ?? []);
        setOrderWarnings(draftRes.data.orderWarnings ?? []);
        setProductOutOfStock(!!draftRes.data.productOutOfStock);
        setSourceProductHandle(draftRes.data.sourceProductHandle ?? null);
        const rawThemeId = draftRes.data.themeId as LandingPageThemeId | undefined;
        const themeId: LandingPageThemeId = rawThemeId && LANDING_PAGE_THEME_RENDERERS[rawThemeId] ? rawThemeId : DEFAULT_LANDING_PAGE_THEME_ID;
        const renderThemeId = LANDING_PAGE_THEME_RENDERERS[themeId];
        setLandingThemeId(themeId);
        setActiveThemeId(renderThemeId);
        setGlobalSettings(themeRes.data.landingGlobalSettings?.[themeId] ?? THEMES[renderThemeId].defaultGlobalSettings);
        setSelectedIds([]);
        setLoaded(true);
      });
      return;
    }
    Promise.all([api.get(`${basePath}/draft`), api.get('/themes/active')]).then(([pageRes, themeRes]) => {
      history.reset(pageRes.data.sections);
      setMeta(pageRes.data.meta ?? { triggerType: 'delay', triggerValue: 5 });
      setActiveThemeId(themeRes.data.activeThemeId);
      setGlobalSettings(themeRes.data.globalSettings ?? THEMES[themeRes.data.activeThemeId as ThemeId].defaultGlobalSettings);
      setSelectedIds([]);
      setLoaded(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basePath]);

  function landingSavePayload() {
    return {
      sections,
      title: landingTitle,
      seo,
      pixels,
      headCode,
      tags,
      pinned,
      schedule,
      audienceVariants,
      returningVisitorHeading,
      unavailableRedirect,
    };
  }

  // --- Autosave (debounced) -------------------------------------------------
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!loaded) return;
    setSaveStatus('unsaved');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        if (pageContext.kind === 'landing') {
          await api.put(`${basePath}/draft`, landingSavePayload());
        } else {
          await api.put(`${basePath}/draft`, { sections, meta });
        }
        setSaveStatus('saved');
      } catch {
        setSaveStatus('error');
      }
    }, 1500);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections, meta, landingTitle, seo, pixels, headCode, tags, pinned, schedule, audienceVariants, returningVisitorHeading, unavailableRedirect, loaded]);

  async function saveDraftNow() {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveStatus('saving');
    try {
      if (pageContext.kind === 'landing') {
        await api.put(`${basePath}/draft`, landingSavePayload());
      } else {
        await api.put(`${basePath}/draft`, { sections, meta });
      }
      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
    }
  }

  async function publish() {
    await saveDraftNow();
    setPublishing(true);
    try {
      await api.post(`${basePath}/publish`);
    } finally {
      setPublishing(false);
    }
  }

  async function changeTheme(id: ThemeId) {
    setActiveThemeId(id);
    await api.put('/themes/active', { themeId: id });
    const r = await api.get('/themes/active');
    setGlobalSettings(r.data.globalSettings ?? THEMES[id].defaultGlobalSettings);
  }

  async function changeLandingTheme(id: LandingPageThemeId) {
    const renderThemeId = LANDING_PAGE_THEME_RENDERERS[id];
    setLandingThemeId(id);
    setActiveThemeId(renderThemeId);
    await api.put(`${basePath}/draft`, { sections, themeId: id });
    const r = await api.get('/themes/active');
    setGlobalSettings(r.data.landingGlobalSettings?.[id] ?? THEMES[renderThemeId].defaultGlobalSettings);
  }

  async function saveGlobalSettings(next: ThemeGlobalSettings) {
    setGlobalSettings(next);
    if (pageContext.kind === 'landing') {
      await api.put(`/themes/landing/${landingThemeId}/settings`, { globalSettings: next });
      return;
    }
    await api.put(`/themes/${activeThemeId}/settings`, { globalSettings: next });
  }

  async function enhanceWithAi() {
    if (pageContext.kind !== 'landing') return;
    setEnhancing(true);
    try {
      const res = await api.post(`${basePath}/enhance`);
      history.reset(res.data.sections);
      setLandingGeneration(res.data.generation ?? null);
    } catch {
      // Best-effort — leave the current draft untouched on failure.
    } finally {
      setEnhancing(false);
    }
  }

  function insertSection(section: PageSection, afterIndex = 0) {
    updateSections((prev) => {
      const next = [...prev];
      next.splice(Math.min(afterIndex + 1, next.length), 0, section);
      return next;
    });
  }

  function insertUrgency() {
    insertSection(
      {
        id: crypto.randomUUID(),
        type: 'countdownBanner',
        settings: { backgroundColor: '#111111', textColor: '#ffffff', align: 'center' },
        blocks: [{ id: crypto.randomUUID(), type: 'heading', settings: { text: 'Limited-time offer', size: 'sm' } }],
      },
      0,
    );
  }

  function insertTrustBadges() {
    insertSection({
      id: crypto.randomUUID(),
      type: 'multiColumn',
      settings: { columns: 3, align: 'center', width: 'page', gap: 32, imageShape: 'circle' },
      blocks: [
        { id: crypto.randomUUID(), type: 'heading', settings: { text: 'Shop with confidence', size: 'md' } },
        { id: crypto.randomUUID(), type: 'column', settings: { mediaType: 'icon', iconName: 'shield', heading: 'Secure checkout', text: 'Your payment info is protected.' } },
        { id: crypto.randomUUID(), type: 'column', settings: { mediaType: 'icon', iconName: 'creditCard', heading: 'Flexible payment', text: 'All major cards accepted.' } },
        { id: crypto.randomUUID(), type: 'column', settings: { mediaType: 'icon', iconName: 'refresh', heading: 'Easy returns', text: 'Hassle-free returns policy.' } },
      ],
    });
  }

  function insertSocialProof() {
    insertSection({
      id: crypto.randomUUID(),
      type: 'socialProofBar',
      settings: { intervalSeconds: 4, align: 'center', dismissible: false, displayStyle: 'bar' },
      blocks: [{ id: crypto.randomUUID(), type: 'proofMessage', settings: {} }],
    });
  }

  function fixSectionOrder() {
    updateSections((prev) => [...prev].sort((a, b) => (SECTION_ORDER_WEIGHT[a.type] ?? 5) - (SECTION_ORDER_WEIGHT[b.type] ?? 5)));
  }

  async function createAbVariant() {
    if (pageContext.kind !== 'landing') return;
    await saveDraftNow();
    const res = await api.post(`${basePath}/ab-variant`);
    navigate(`/storefront/editor?type=landing&id=${res.data.id}`);
  }

  async function duplicateToOtherTheme() {
    if (pageContext.kind !== 'landing') return;
    await saveDraftNow();
    const res = await api.post(`${basePath}/duplicate-theme`);
    navigate(`/storefront/editor?type=landing&id=${res.data.id}`);
  }

  async function saveAsTemplate() {
    if (pageContext.kind !== 'landing') return;
    const name = window.prompt('Name this template', landingTitle);
    if (!name) return;
    await saveDraftNow();
    await api.post(`${basePath}/save-as-template`, { name });
  }

  async function copyPreviewLink() {
    if (pageContext.kind === 'landing') {
      const res = await api.get('/pages/preview-token');
      const token = res.data.token;
      const url = buildStorefrontUrl(storeSlug, `/pages/${landingSlug}`, { preview: token });
      await navigator.clipboard.writeText(url).catch(() => {});
      setPreviewLink(url);
      return;
    }
    const res = await api.get('/pages/preview-token');
    const token = res.data.token;
    const url = buildStorefrontUrl(storeSlug, '/', { preview: token, page });
    await navigator.clipboard.writeText(url).catch(() => {});
    setPreviewLink(url);
  }

  // --- Section mutation helpers ---------------------------------------------
  const updateSections = history.set;

  function handleFieldChange(sectionId: string, key: string, value: unknown) {
    updateSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, settings: { ...s.settings, [key]: value } } : s)),
    );
  }

  function handleBlockFieldChange(sectionId: string, blockId: string, key: string, value: unknown) {
    updateSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              blocks: (s.blocks ?? []).map((b) => (b.id === blockId ? { ...b, settings: { ...b.settings, [key]: value } } : b)),
            }
          : s,
      ),
    );
  }

  function handleBlockFieldChangeAll(sectionId: string, blockId: string, settings: Record<string, unknown>) {
    updateSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, blocks: (s.blocks ?? []).map((b) => (b.id === blockId ? { ...b, settings } : b)) }
          : s,
      ),
    );
  }

  function handleSettingsChange(sectionId: string, settings: Record<string, unknown>) {
    updateSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, settings } : s)));
  }

  function handleSectionPatch(sectionId: string, patch: Partial<PageSection>) {
    updateSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, ...patch } : s)));
  }

  function duplicateSections(ids: string[]) {
    updateSections((prev) => {
      const next = [...prev];
      for (const id of ids) {
        const index = next.findIndex((s) => s.id === id);
        if (index === -1) continue;
        const copy: PageSection = { ...next[index], id: crypto.randomUUID() };
        next.splice(index + 1, 0, copy);
      }
      return next;
    });
  }

  function deleteSections(ids: string[]) {
    updateSections((prev) => prev.filter((s) => !ids.includes(s.id)));
    setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));
  }

  function moveSection(id: string, direction: 'up' | 'down') {
    updateSections((prev) => {
      const index = prev.findIndex((s) => s.id === id);
      if (index === -1) return prev;
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  }

  function copyStyle(id: string) {
    const section = sections.find((s) => s.id === id);
    const schema = theme.sections[section?.type ?? '']?.schema;
    if (!section || !schema) return;
    const styleKeys = schema.fields.filter((f) => f.tab === 'style').map((f) => f.key);
    const settings: Record<string, unknown> = {};
    for (const key of styleKeys) settings[key] = section.settings[key];
    setStyleClipboard({ sectionType: section.type, settings });
  }

  function pasteStyle(ids: string[]) {
    if (!styleClipboard) return;
    updateSections((prev) =>
      prev.map((s) =>
        ids.includes(s.id) && s.type === styleClipboard.sectionType
          ? { ...s, settings: { ...s.settings, ...styleClipboard.settings } }
          : s,
      ),
    );
  }

  async function saveSelectedAsGlobal() {
    if (!selectedSection) return;
    const label = window.prompt('Name this reusable section', theme.sections[selectedSection.type]?.schema.label ?? 'Section');
    if (!label) return;
    const res = await api.post('/global-sections', {
      type: selectedSection.type,
      label,
      settings: selectedSection.settings,
    });
    handleSectionPatch(selectedSection.id, { globalId: res.data.globalSection.id });
  }

  function insertGlobalSection(globalSection: { id: string; type: string; settings: Record<string, unknown> }) {
    const newSection: PageSection = {
      id: crypto.randomUUID(),
      type: globalSection.type,
      settings: globalSection.settings,
      globalId: globalSection.id,
    };
    updateSections((prev) => [...prev, newSection]);
    setShowGlobalLibrary(false);
  }

  function applyTemplate(template: StarterTemplate) {
    if (sections.length > 0 && !window.confirm('Replace your current sections with this template?')) return;
    updateSections(
      template.sections.map((s) => ({
        id: crypto.randomUUID(),
        type: s.type,
        settings: { ...s.settings },
        blocks: s.blocks?.map((b) => ({ id: crypto.randomUUID(), type: b.type, settings: { ...b.settings } })),
      })),
    );
    setShowTemplates(false);
  }

  function handleSelect(id: string, e: React.MouseEvent) {
    setRightPanel('section');
    setSelectedBlock(null);
    if (e.shiftKey || e.ctrlKey || e.metaKey) {
      setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
    } else {
      setSelectedIds([id]);
    }
  }

  function handleSelectBlock(sectionId: string, blockId: string) {
    setRightPanel('section');
    setSelectedIds([sectionId]);
    setSelectedBlock({ sectionId, blockId });
  }

  // --- Keyboard shortcuts -----------------------------------------------------
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (isTypingTarget(e.target)) return;
      const mod = e.ctrlKey || e.metaKey;

      if (mod && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        history.undo();
      } else if ((mod && e.key.toLowerCase() === 'z' && e.shiftKey) || (mod && e.key.toLowerCase() === 'y')) {
        e.preventDefault();
        history.redo();
      } else if (mod && e.key.toLowerCase() === 'd' && selectedIds.length) {
        e.preventDefault();
        duplicateSections(selectedIds);
      } else if (mod && e.key.toLowerCase() === 'c' && selectedIds.length) {
        e.preventDefault();
        const section = sections.find((s) => s.id === primaryId);
        if (section) setSectionClipboard(section);
      } else if (mod && e.key.toLowerCase() === 'v' && sectionClipboard) {
        e.preventDefault();
        updateSections((prev) => {
          const index = prev.findIndex((s) => s.id === primaryId);
          const copy: PageSection = { ...sectionClipboard, id: crypto.randomUUID() };
          const next = [...prev];
          next.splice(index === -1 ? next.length : index + 1, 0, copy);
          return next;
        });
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.length) {
        e.preventDefault();
        deleteSections(selectedIds);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds, primaryId, sections, sectionClipboard]);

  if (!loaded) {
    return <div className="p-6 text-sm text-ink-secondary">Loading…</div>;
  }

  const statusLabel = {
    saved: 'All changes saved',
    saving: 'Saving…',
    unsaved: 'Unsaved changes',
    error: 'Failed to save — retrying on next edit',
  }[saveStatus];

  return (
    <div className="flex h-screen flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3">
        <div className="flex items-center gap-3">
          <IconButton
            aria-label="Back to Storefront"
            title="Back to Storefront"
            onClick={() => navigate(pageContext.kind === 'landing' ? '/storefront/landing-pages' : '/storefront')}
          >
            <ArrowLeft size={16} />
          </IconButton>
          {pageContext.kind === 'landing' ? (
            <>
              <Badge tone="accent">Landing page</Badge>
              <Input
                value={landingTitle}
                onChange={(e) => setLandingTitle(e.target.value)}
                className="w-48"
                aria-label="Landing page title"
              />
              <span className="text-xs text-ink-tertiary">/pages/{landingSlug}</span>
              {landingGeneration?.status === 'native' ? (
                <Button variant="secondary" size="sm" onClick={enhanceWithAi} disabled={enhancing}>
                  {enhancing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  Enhance with AI
                </Button>
              ) : landingGeneration?.status === 'ai-enhanced' || landingGeneration?.status === 'ai-partial' ? (
                <Badge tone="success">AI-enhanced</Badge>
              ) : null}
            </>
          ) : (
            <Select value={page} onChange={(e) => setPage(e.target.value as 'home' | 'popup')}>
              {PAGES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </Select>
          )}
          <p className="text-xs text-ink-tertiary">{statusLabel}</p>
        </div>

        {page === 'popup' && (
          <div className="flex items-center gap-2 text-xs text-ink-secondary">
            Show
            <Select
              value={meta.triggerType ?? 'delay'}
              onChange={(e) => setMeta((m) => ({ ...m, triggerType: e.target.value as PageMeta['triggerType'] }))}
            >
              <option value="delay">After delay</option>
              <option value="scroll">After scroll %</option>
              <option value="exit_intent">On exit intent</option>
            </Select>
            {meta.triggerType !== 'exit_intent' && (
              <input
                type="number"
                value={meta.triggerValue ?? 5}
                onChange={(e) => setMeta((m) => ({ ...m, triggerValue: Number(e.target.value) }))}
                className="w-16 rounded-md border border-border bg-surface px-2 py-1 text-xs"
              />
            )}
          </div>
        )}

        <div className="flex items-center gap-1 rounded-md border border-border p-0.5">
          <IconButton aria-label="Desktop preview" title="Desktop" onClick={() => setDevice('desktop')} className={device === 'desktop' ? 'bg-surface-selected text-ink' : ''}>
            <Monitor size={15} />
          </IconButton>
          <IconButton aria-label="Tablet preview" title="Tablet" onClick={() => setDevice('tablet')} className={device === 'tablet' ? 'bg-surface-selected text-ink' : ''}>
            <Tablet size={15} />
          </IconButton>
          <IconButton aria-label="Mobile preview" title="Mobile" onClick={() => setDevice('mobile')} className={device === 'mobile' ? 'bg-surface-selected text-ink' : ''}>
            <Smartphone size={15} />
          </IconButton>
        </div>

        <div className="flex items-center gap-2">
          <IconButton aria-label="Undo" title="Undo (Ctrl+Z)" onClick={history.undo} disabled={!history.canUndo}>
            <Undo2 size={15} />
          </IconButton>
          <IconButton aria-label="Redo" title="Redo (Ctrl+Shift+Z)" onClick={history.redo} disabled={!history.canRedo}>
            <Redo2 size={15} />
          </IconButton>

          {pageContext.kind === 'landing' ? (
            <Select value={landingThemeId} onChange={(e) => changeLandingTheme(e.target.value as LandingPageThemeId)}>
              {LANDING_PAGE_THEMES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} layout
                </option>
              ))}
            </Select>
          ) : (
            <Select value={activeThemeId} onChange={(e) => changeTheme(e.target.value as ThemeId)}>
              {THEME_OPTIONS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} theme
                </option>
              ))}
            </Select>
          )}

          <IconButton aria-label="Templates" title="Templates" onClick={() => setShowTemplates(true)}>
            <LayoutTemplate size={15} />
          </IconButton>

          <IconButton aria-label="Reusable sections" title="Reusable sections" onClick={() => setShowGlobalLibrary(true)}>
            <Blocks size={15} />
          </IconButton>

          <IconButton
            aria-label="Site styles"
            title="Site styles"
            onClick={() => setRightPanel('design')}
            className={rightPanel === 'design' ? 'bg-surface-selected text-ink' : ''}
          >
            <Palette size={15} />
          </IconButton>

          <IconButton aria-label="Copy preview link" title="Copy staging preview link" onClick={copyPreviewLink}>
            <Link2 size={15} />
          </IconButton>

          <IconButton aria-label="Preview" title="Preview" onClick={() => setPreviewMode(true)}>
            <Eye size={15} />
          </IconButton>

          {pageContext.kind === 'landing' && (
            <>
              <IconButton
                aria-label="Landing page settings"
                title="SEO, tracking, lifecycle, personalization"
                onClick={() => setRightPanel('landing-settings')}
                className={rightPanel === 'landing-settings' ? 'bg-surface-selected text-ink' : ''}
              >
                <Settings2 size={15} />
              </IconButton>
              <IconButton aria-label="Analytics" title="Analytics" onClick={() => setShowAnalytics(true)}>
                <BarChart3 size={15} />
              </IconButton>
              <IconButton aria-label="Share" title="QR code, UTM link, share preview" onClick={() => setShowShare(true)}>
                <Share2 size={15} />
              </IconButton>
              <LandingPageToolsMenu
                onInsertUrgency={insertUrgency}
                onInsertTrustBadges={insertTrustBadges}
                onInsertSocialProof={insertSocialProof}
                onFixOrder={fixSectionOrder}
                onCreateAbVariant={createAbVariant}
                onDuplicateTheme={duplicateToOtherTheme}
                onSaveAsTemplate={saveAsTemplate}
              />
            </>
          )}

          <RevisionHistory
            basePath={basePath}
            supportsDiff={pageContext.kind === 'landing'}
            onRestore={() => api.get(`${basePath}/draft`).then((r) => history.reset(r.data.sections))}
          />

          <Button variant="secondary" onClick={saveDraftNow} disabled={saveStatus === 'saving'}>
            {saveStatus === 'saving' ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            Save draft
          </Button>
          <Button variant="primary" onClick={publish} disabled={publishing}>
            {publishing ? <Loader2 size={14} className="animate-spin" /> : null}
            Publish
          </Button>
        </div>
      </div>

      {previewLink && (
        <div className="flex items-center justify-between border-b border-border bg-link-subtle px-4 py-2 text-xs text-ink">
          <span>Preview link copied to clipboard: {previewLink}</span>
          <IconButton aria-label="Dismiss" onClick={() => setPreviewLink(null)}>
            <X size={13} />
          </IconButton>
        </div>
      )}

      {previewMode ? (
        <div className="relative flex-1 overflow-y-auto bg-white">
          <button
            type="button"
            onClick={() => setPreviewMode(false)}
            className="fixed right-6 top-20 z-30 flex items-center gap-1.5 rounded-md bg-neutral-900 px-3 py-2 text-sm text-white shadow-lg hover:bg-neutral-800"
          >
            <X size={14} />
            Exit preview
          </button>
          {renderSections(sections, theme, storeSlug, { ignoreSchedule: true })}
        </div>
      ) : (
        <div className={clsx('grid flex-1 overflow-hidden', 'grid-cols-[240px_1fr_300px]')}>
          <div className="flex flex-col border-r border-border bg-surface">
            <div className="flex items-center gap-1.5 border-b border-border px-3 py-2 text-xs font-medium uppercase tracking-wide text-ink-tertiary">
              <Layers size={13} />
              Sections
            </div>
            <div className="flex-1 overflow-hidden">
              <SectionList
                sections={sections}
                theme={theme}
                selectedIds={selectedIds}
                onSelect={handleSelect}
                onChange={updateSections}
                onDuplicate={duplicateSections}
                onDelete={deleteSections}
                onCopyStyle={copyStyle}
                onPasteStyle={pasteStyle}
                clipboardStyleType={styleClipboard?.sectionType ?? null}
                selectedBlock={selectedBlock}
                onSelectBlock={handleSelectBlock}
                sourceProductHandle={sourceProductHandle}
              />
            </div>
          </div>

          <Canvas
            sections={sections}
            theme={theme}
            storeSlug={storeSlug}
            device={device}
            selectedId={primaryId}
            onSelect={(id) => {
              setSelectedIds([id]);
              setSelectedBlock(null);
            }}
            onFieldChange={handleFieldChange}
            selectedBlock={selectedBlock}
            onSelectBlock={handleSelectBlock}
            onBlockFieldChange={handleBlockFieldChange}
            onDuplicate={(id) => duplicateSections([id])}
            onDelete={(id) => deleteSections([id])}
            onMove={moveSection}
            onCopyStyle={copyStyle}
            onPasteStyle={(id) => pasteStyle([id])}
            clipboardStyleType={styleClipboard?.sectionType ?? null}
          />

          <div className="overflow-y-auto border-l border-border bg-surface">
            {rightPanel === 'landing-settings' && pageContext.kind === 'landing' ? (
              <LandingPageSettingsPanel
                landingPageId={pageContext.id}
                seo={seo}
                onSeoChange={setSeo}
                pixels={pixels}
                onPixelsChange={setPixels}
                headCode={headCode}
                onHeadCodeChange={setHeadCode}
                tags={tags}
                onTagsChange={setTags}
                pinned={pinned}
                onPinnedChange={setPinned}
                schedule={schedule}
                onScheduleChange={setSchedule}
                passwordProtected={passwordProtected}
                onPasswordProtectedChange={setPasswordProtected}
                audienceVariants={audienceVariants}
                onAudienceVariantsChange={setAudienceVariants}
                returningVisitorHeading={returningVisitorHeading}
                onReturningVisitorHeadingChange={setReturningVisitorHeading}
                unavailableRedirect={unavailableRedirect}
                onUnavailableRedirectChange={setUnavailableRedirect}
                checklist={checklist}
                orderWarnings={orderWarnings}
                productOutOfStock={productOutOfStock}
              />
            ) : rightPanel === 'design' ? (
              <DesignPanel settings={globalSettings} onChange={saveGlobalSettings} />
            ) : selectedBlock && selectedBlockData ? (
              <BlockSettingsPanel
                block={selectedBlockData}
                schema={theme.blocks[selectedBlockData.type]?.schema}
                onChange={(settings) => handleBlockFieldChangeAll(selectedBlock.sectionId, selectedBlock.blockId, settings)}
              />
            ) : selectedSection ? (
              <SettingsPanel
                theme={theme}
                section={selectedSection}
                schema={theme.sections[selectedSection.type]?.schema}
                onSettingsChange={(settings) => handleSettingsChange(selectedSection.id, settings)}
                onSectionChange={(patch) => handleSectionPatch(selectedSection.id, patch)}
                onBlockFieldChange={(blockId, key, value) => handleBlockFieldChange(selectedSection.id, blockId, key, value)}
                onSaveAsGlobal={saveSelectedAsGlobal}
                onOpenThemeSettings={() => setRightPanel('design')}
                onRemoveSection={() => deleteSections([selectedSection.id])}
                sourceProductHandle={sourceProductHandle}
              />
            ) : (
              <p className="p-4 text-sm text-ink-tertiary">
                Select a section on the canvas or in the list to edit its settings.
              </p>
            )}
          </div>
        </div>
      )}

      {showTemplates && (
        <TemplatesModal templates={STARTER_TEMPLATES[activeThemeId]} onApply={applyTemplate} onClose={() => setShowTemplates(false)} />
      )}
      {showGlobalLibrary && (
        <GlobalSectionsModal onInsert={insertGlobalSection} onClose={() => setShowGlobalLibrary(false)} />
      )}
      {showAnalytics && pageContext.kind === 'landing' && (
        <LandingPageAnalyticsModal landingPageId={pageContext.id} onClose={() => setShowAnalytics(false)} />
      )}
      {showShare && pageContext.kind === 'landing' && (
        <LandingPageShareModal
          url={buildStorefrontUrl(storeSlug, `/pages/${landingSlug}`)}
          title={seo.metaTitle || landingTitle}
          description={seo.metaDescription}
          ogImage={seo.ogImage}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}
