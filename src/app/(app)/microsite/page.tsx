"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { useCRM, type Testimonial } from "@/lib/store";
import { formatCurrency, formatNumber, initials } from "@/lib/utils";
import {
  Globe, ExternalLink, Eye, MousePointerClick, FileText, Plus, Pencil, Trash2,
  Star, Bed, Bath, Maximize2, Phone, Mail, MapPin, CheckCircle2, Sparkles,
  Layout as LayoutIcon, Palette, Settings as SettingsIcon, Image as ImageIcon,
} from "lucide-react";

const heroStyles = [
  { id: "gradient-primary", name: "Emerald", className: "from-sidebar via-sidebar/90 to-primary/40" },
  { id: "gradient-warm", name: "Sunset", className: "from-amber-700 via-orange-600 to-rose-700" },
  { id: "gradient-cool", name: "Ocean", className: "from-blue-900 via-sky-700 to-cyan-600" },
  { id: "minimal", name: "Minimal", className: "from-zinc-900 via-zinc-800 to-zinc-900" },
] as const;

export default function MicrositePage() {
  const microsite = useCRM((s) => s.microsite);
  const business = useCRM((s) => s.business);
  const listings = useCRM((s) => s.listings);
  const updateMicrosite = useCRM((s) => s.updateMicrosite);
  const toggleMicrositeSection = useCRM((s) => s.toggleMicrositeSection);
  const toggleFeaturedListing = useCRM((s) => s.toggleFeaturedListing);
  const addTestimonial = useCRM((s) => s.addTestimonial);
  const updateTestimonial = useCRM((s) => s.updateTestimonial);
  const deleteTestimonial = useCRM((s) => s.deleteTestimonial);
  const publishMicrosite = useCRM((s) => s.publishMicrosite);

  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");
  const [section, setSection] = useState<"hero" | "listings" | "about" | "testimonials" | "contact" | "domain" | "theme">("hero");
  const [tsForm, setTsForm] = useState<Testimonial | null>(null);
  const [tsOpen, setTsOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const featured = listings.filter((l) => microsite.featuredListingIds.includes(l.id));

  const heroBg = heroStyles.find((s) => s.id === microsite.heroBackgroundStyle) ?? heroStyles[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Microsite"
        description={
          microsite.published
            ? `Live · published ${microsite.lastPublishedAt ? new Date(microsite.lastPublishedAt).toLocaleDateString() : ""}`
            : "Unpublished changes"
        }
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <a href={`https://${microsite.domain}.estata.app`} target="_blank" rel="noopener noreferrer" onClick={(e) => { e.preventDefault(); setActiveTab("preview"); toast.info("Opening preview tab"); }}>
                <ExternalLink className="size-4" /> Open site
              </a>
            </Button>
            <Button
              size="sm"
              disabled={microsite.published}
              onClick={() => { publishMicrosite(); toast.success("Microsite published"); }}
            >
              {microsite.published ? <><CheckCircle2 className="size-4" /> Published</> : "Publish changes"}
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-5"><div className="flex items-center gap-2 text-sm text-muted-foreground"><Eye className="size-4" /> Page views (30d)</div><div className="mt-1 text-2xl font-semibold">{formatNumber(microsite.pageViews)}</div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="flex items-center gap-2 text-sm text-muted-foreground"><MousePointerClick className="size-4" /> Clicks</div><div className="mt-1 text-2xl font-semibold">{formatNumber(microsite.clicks)}</div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="flex items-center gap-2 text-sm text-muted-foreground"><FileText className="size-4" /> Form submissions</div><div className="mt-1 text-2xl font-semibold">{formatNumber(microsite.formSubmissions)}</div></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "editor" | "preview")}>
        <TabsList>
          <TabsTrigger value="editor"><LayoutIcon className="size-4" /> Editor</TabsTrigger>
          <TabsTrigger value="preview"><Eye className="size-4" /> Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="editor">
          <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
            {/* Section nav */}
            <Card>
              <CardContent className="p-2 space-y-0.5">
                {[
                  { id: "hero", label: "Hero", icon: LayoutIcon },
                  { id: "listings", label: "Featured listings", icon: ImageIcon },
                  { id: "about", label: "About", icon: FileText },
                  { id: "testimonials", label: "Testimonials", icon: Star },
                  { id: "contact", label: "Contact", icon: Phone },
                  { id: "theme", label: "Theme", icon: Palette },
                  { id: "domain", label: "Domain & SEO", icon: SettingsIcon },
                ].map((s) => {
                  const Icon = s.icon;
                  const active = section === s.id;
                  const sec = (s.id as keyof typeof microsite.sections);
                  const hasToggle = ["hero", "listings", "about", "testimonials", "contact"].includes(s.id);
                  const visible = hasToggle ? microsite.sections[sec] : true;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSection(s.id as typeof section)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${active ? "bg-secondary font-medium" : "hover:bg-secondary/50"}`}
                    >
                      <Icon className="size-4 shrink-0" />
                      <span className="flex-1 text-left">{s.label}</span>
                      {hasToggle && !visible && <Badge variant="muted" className="text-[9px]">hidden</Badge>}
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            {/* Section editor */}
            <div>
              {section === "hero" && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Hero</CardTitle>
                        <CardDescription>The first thing visitors see.</CardDescription>
                      </div>
                      <SectionToggle visible={microsite.sections.hero} onToggle={() => toggleMicrositeSection("hero")} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                      <Label>Tagline (small text above headline)</Label>
                      <Input value={microsite.tagline} onChange={(e) => updateMicrosite({ tagline: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Headline</Label>
                      <Input value={microsite.heroHeadline} onChange={(e) => updateMicrosite({ heroHeadline: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Subheadline</Label>
                      <Textarea rows={2} value={microsite.heroSubheadline} onChange={(e) => updateMicrosite({ heroSubheadline: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Primary CTA text</Label>
                        <Input value={microsite.heroCtaPrimary} onChange={(e) => updateMicrosite({ heroCtaPrimary: e.target.value })} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Secondary CTA text</Label>
                        <Input value={microsite.heroCtaSecondary} onChange={(e) => updateMicrosite({ heroCtaSecondary: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Background style</Label>
                      <div className="grid grid-cols-4 gap-2">
                        {heroStyles.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => updateMicrosite({ heroBackgroundStyle: s.id })}
                            className={`relative aspect-video rounded-lg overflow-hidden ring-2 transition-all ${microsite.heroBackgroundStyle === s.id ? "ring-primary" : "ring-transparent hover:ring-border"}`}
                          >
                            <div className={`absolute inset-0 bg-gradient-to-br ${s.className}`} />
                            <span className="absolute bottom-1 left-1 right-1 text-[9px] text-white font-medium drop-shadow">
                              {s.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {section === "listings" && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Featured listings</CardTitle>
                        <CardDescription>{featured.length} of {listings.length} selected</CardDescription>
                      </div>
                      <SectionToggle visible={microsite.sections.listings} onToggle={() => toggleMicrositeSection("listings")} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {listings.map((l) => {
                        const checked = microsite.featuredListingIds.includes(l.id);
                        return (
                          <button
                            key={l.id}
                            onClick={() => toggleFeaturedListing(l.id)}
                            className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${checked ? "border-primary bg-primary/5" : "border-border hover:bg-secondary/40"}`}
                          >
                            <div className="size-10 rounded-md bg-gradient-to-br from-secondary to-muted shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">{l.address}</div>
                              <div className="text-xs text-muted-foreground">{formatCurrency(l.price)} · {l.city}</div>
                            </div>
                            <div className={`size-5 rounded-full border-2 flex items-center justify-center shrink-0 ${checked ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
                              {checked && <CheckCircle2 className="size-3" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {section === "about" && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>About</CardTitle>
                        <CardDescription>Tell visitors who you are.</CardDescription>
                      </div>
                      <SectionToggle visible={microsite.sections.about} onToggle={() => toggleMicrositeSection("about")} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Textarea rows={6} value={microsite.about} onChange={(e) => updateMicrosite({ about: e.target.value })} />
                  </CardContent>
                </Card>
              )}

              {section === "testimonials" && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Testimonials</CardTitle>
                        <CardDescription>{microsite.testimonials.length} testimonials</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <SectionToggle visible={microsite.sections.testimonials} onToggle={() => toggleMicrositeSection("testimonials")} />
                        <Button size="sm" onClick={() => { setTsForm({ id: "", author: "", role: "", body: "", rating: 5 }); setTsOpen(true); }}>
                          <Plus className="size-4" /> Add
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {microsite.testimonials.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-6">No testimonials yet.</p>
                    )}
                    {microsite.testimonials.map((t) => (
                      <div key={t.id} className="flex items-start gap-3 rounded-lg border border-border p-3">
                        <Avatar className="size-9"><AvatarFallback className="text-xs">{initials(t.author)}</AvatarFallback></Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{t.author}</span>
                            <span className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`size-3 ${i < t.rating ? "fill-warning text-warning" : "text-muted-foreground/30"}`} />
                              ))}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">{t.role}</div>
                          <p className="text-sm mt-1 line-clamp-2">{t.body}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon-sm" onClick={() => { setTsForm(t); setTsOpen(true); }}>
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon-sm" className="text-destructive" onClick={() => setConfirmId(t.id)}>
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {section === "contact" && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Contact</CardTitle>
                        <CardDescription>How visitors reach you.</CardDescription>
                      </div>
                      <SectionToggle visible={microsite.sections.contact} onToggle={() => toggleMicrositeSection("contact")} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                      <Label>Email</Label>
                      <Input type="email" value={microsite.contactEmail} onChange={(e) => updateMicrosite({ contactEmail: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Phone</Label>
                      <Input value={microsite.contactPhone} onChange={(e) => updateMicrosite({ contactPhone: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Address</Label>
                      <Textarea rows={2} value={microsite.contactAddress} onChange={(e) => updateMicrosite({ contactAddress: e.target.value })} />
                    </div>
                  </CardContent>
                </Card>
              )}

              {section === "theme" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Theme colors</CardTitle>
                    <CardDescription>Used across the site, emails, and CTAs.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Primary</Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            className="size-9 rounded-md border border-border cursor-pointer"
                            value={microsite.theme.primary}
                            onChange={(e) => updateMicrosite({ theme: { ...microsite.theme, primary: e.target.value } })}
                          />
                          <Input value={microsite.theme.primary} onChange={(e) => updateMicrosite({ theme: { ...microsite.theme, primary: e.target.value } })} />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Accent</Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            className="size-9 rounded-md border border-border cursor-pointer"
                            value={microsite.theme.accent}
                            onChange={(e) => updateMicrosite({ theme: { ...microsite.theme, accent: e.target.value } })}
                          />
                          <Input value={microsite.theme.accent} onChange={(e) => updateMicrosite({ theme: { ...microsite.theme, accent: e.target.value } })} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {section === "domain" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Domain & SEO</CardTitle>
                    <CardDescription>Where your microsite lives.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                      <Label>Subdomain</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          value={microsite.domain}
                          onChange={(e) => updateMicrosite({ domain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                          className="flex-1"
                        />
                        <span className="text-sm text-muted-foreground">.estata.app</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Your site lives at <code className="rounded bg-secondary px-1.5 py-0.5">{microsite.domain}.estata.app</code></p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => toast.info("Custom domain wizard coming soon")}>
                      <Globe className="size-4" /> Connect custom domain
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview">
          <Card className="overflow-hidden">
            <div className="flex items-center gap-2 border-b border-border bg-secondary/40 px-4 py-2">
              <span className="size-3 rounded-full bg-destructive/40" />
              <span className="size-3 rounded-full bg-warning/40" />
              <span className="size-3 rounded-full bg-success/40" />
              <div className="flex-1 mx-4 rounded-md bg-card border border-border px-3 py-1 text-xs text-muted-foreground flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-success" />
                {microsite.domain}.estata.app
              </div>
            </div>

            <div className="bg-background" style={{ ["--site-primary" as string]: microsite.theme.primary, ["--site-accent" as string]: microsite.theme.accent }}>
              {microsite.sections.hero && (
                <div className={`relative aspect-[16/9] bg-gradient-to-br ${heroBg.className} overflow-hidden flex items-center justify-center text-white p-8`}>
                  <div className="absolute top-6 left-6 right-6 flex items-center justify-between text-white/90 text-sm">
                    <span className="font-semibold">{business.name}</span>
                    <div className="flex gap-4">
                      {microsite.sections.listings && <span>Listings</span>}
                      {microsite.sections.about && <span>About</span>}
                      {microsite.sections.contact && <span>Contact</span>}
                    </div>
                  </div>
                  <div className="relative max-w-2xl text-center space-y-4">
                    <Badge variant="outline" className="bg-white/10 border-white/30 text-white">{microsite.tagline}</Badge>
                    <h1 className="text-4xl lg:text-5xl font-bold tracking-tight leading-tight">{microsite.heroHeadline}</h1>
                    <p className="text-white/80 max-w-xl mx-auto">{microsite.heroSubheadline}</p>
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <button className="rounded-md px-5 py-2.5 text-sm font-medium shadow-lg" style={{ background: microsite.theme.primary }}>
                        {microsite.heroCtaPrimary}
                      </button>
                      <button className="rounded-md border border-white/30 bg-white/10 backdrop-blur px-5 py-2.5 text-sm font-medium">
                        {microsite.heroCtaSecondary}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {microsite.sections.listings && featured.length > 0 && (
                <section className="px-8 py-16 space-y-8">
                  <div className="text-center space-y-1">
                    <h2 className="text-2xl font-semibold">Featured listings</h2>
                    <p className="text-sm text-muted-foreground">Hand-picked properties from {business.name}</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
                    {featured.map((l) => (
                      <div key={l.id} className="rounded-xl border border-border overflow-hidden bg-card">
                        <div className="aspect-[4/3] bg-gradient-to-br from-secondary to-muted relative">
                          <div className="absolute inset-0 [background:radial-gradient(12rem_12rem_at_60%_50%,_var(--color-primary),_transparent)] opacity-25" />
                        </div>
                        <div className="p-4 space-y-2">
                          <div className="font-semibold">{formatCurrency(l.price)}</div>
                          <div className="text-sm">{l.address}</div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground border-t border-border pt-2">
                            <span className="flex items-center gap-1"><Bed className="size-3" /> {l.beds}</span>
                            <span className="flex items-center gap-1"><Bath className="size-3" /> {l.baths}</span>
                            <span className="flex items-center gap-1"><Maximize2 className="size-3" /> {formatNumber(l.sqft)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {microsite.sections.about && (
                <section className="px-8 py-16 bg-secondary/30">
                  <div className="max-w-3xl mx-auto text-center space-y-4">
                    <h2 className="text-2xl font-semibold">About {business.name}</h2>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{microsite.about}</p>
                  </div>
                </section>
              )}

              {microsite.sections.testimonials && microsite.testimonials.length > 0 && (
                <section className="px-8 py-16">
                  <div className="text-center space-y-1 mb-8">
                    <h2 className="text-2xl font-semibold">What clients say</h2>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
                    {microsite.testimonials.map((t) => (
                      <div key={t.id} className="rounded-xl border border-border bg-card p-5 space-y-3">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`size-4 ${i < t.rating ? "fill-warning text-warning" : "text-muted-foreground/30"}`} />
                          ))}
                        </div>
                        <p className="text-sm leading-relaxed">"{t.body}"</p>
                        <div className="flex items-center gap-2 pt-2 border-t border-border">
                          <Avatar className="size-7"><AvatarFallback className="text-[10px]">{initials(t.author)}</AvatarFallback></Avatar>
                          <div>
                            <div className="text-xs font-medium">{t.author}</div>
                            <div className="text-[10px] text-muted-foreground">{t.role}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {microsite.sections.contact && (
                <section className="px-8 py-16 bg-sidebar text-sidebar-foreground">
                  <div className="max-w-3xl mx-auto grid gap-6 sm:grid-cols-3">
                    <ContactItem icon={<Mail className="size-4" />} label="Email" value={microsite.contactEmail} />
                    <ContactItem icon={<Phone className="size-4" />} label="Phone" value={microsite.contactPhone} />
                    <ContactItem icon={<MapPin className="size-4" />} label="Visit" value={microsite.contactAddress} />
                  </div>
                </section>
              )}

              <footer className="px-8 py-6 border-t border-border text-center text-xs text-muted-foreground">
                © {new Date().getFullYear()} {business.name}. Powered by <span className="font-semibold">Estata</span>.
              </footer>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Testimonial form */}
      <Dialog open={tsOpen} onOpenChange={setTsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{tsForm?.id ? "Edit testimonial" : "Add testimonial"}</DialogTitle>
            <DialogDescription>Real quotes work best.</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!tsForm) return;
              if (!tsForm.author || !tsForm.body) { toast.error("Author and body required"); return; }
              if (tsForm.id) {
                updateTestimonial(tsForm.id, tsForm);
                toast.success("Testimonial updated");
              } else {
                addTestimonial({ author: tsForm.author, role: tsForm.role, body: tsForm.body, rating: tsForm.rating });
                toast.success("Testimonial added");
              }
              setTsOpen(false);
            }}
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Author</Label>
                <Input value={tsForm?.author ?? ""} onChange={(e) => tsForm && setTsForm({ ...tsForm, author: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Role / context</Label>
                <Input value={tsForm?.role ?? ""} onChange={(e) => tsForm && setTsForm({ ...tsForm, role: e.target.value })} placeholder="Bought a home in SF" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Quote</Label>
              <Textarea rows={4} value={tsForm?.body ?? ""} onChange={(e) => tsForm && setTsForm({ ...tsForm, body: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Rating</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" onClick={() => tsForm && setTsForm({ ...tsForm, rating: n })} className="p-1">
                    <Star className={`size-6 ${n <= (tsForm?.rating ?? 0) ? "fill-warning text-warning" : "text-muted-foreground/30"}`} />
                  </button>
                ))}
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="ghost" onClick={() => setTsOpen(false)}>Cancel</Button>
              <Button type="submit">{tsForm?.id ? "Save" : "Add"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmId !== null}
        onOpenChange={(o) => !o && setConfirmId(null)}
        onConfirm={() => { if (confirmId) { deleteTestimonial(confirmId); toast.success("Testimonial deleted"); } }}
        title="Delete this testimonial?"
      />
    </div>
  );
}

function SectionToggle({ visible, onToggle }: { visible: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-muted-foreground">{visible ? "Visible" : "Hidden"}</span>
      <Switch checked={visible} onCheckedChange={onToggle} />
    </div>
  );
}

function ContactItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="size-9 rounded-md bg-sidebar-accent text-sidebar-foreground flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <div className="text-xs text-sidebar-foreground/70">{label}</div>
        <div className="text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}
