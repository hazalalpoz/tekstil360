"use client";

import { useState } from "react";
import { loginAction, corporateApplicationAction } from "@/app/actions/auth";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";

type Tab = "login" | "corporate";

export function LoginTabs() {
  const [tab, setTab] = useState<Tab>("login");
  const [corpMessage, setCorpMessage] = useState<string | null>(null);
  const [corpError, setCorpError] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [companyType, setCompanyType] = useState<"SAHIS" | "KURUMSAL">("SAHIS");

  return (
    <div>
      <div className="mb-6 flex rounded-xl bg-slate-100 p-1 text-sm font-semibold">
        <button
          type="button"
          onClick={() => setTab("login")}
          className={`flex-1 rounded-lg py-2.5 transition-colors ${
            tab === "login" ? "bg-white text-teal-800 shadow-sm" : "text-slate-600"
          }`}
        >
          GİRİŞ YAP
        </button>
        <button
          type="button"
          onClick={() => setTab("corporate")}
          className={`flex-1 rounded-lg py-2.5 transition-colors ${
            tab === "corporate" ? "bg-white text-teal-800 shadow-sm" : "text-slate-600"
          }`}
        >
          KURUMSAL BAŞVURU
        </button>
      </div>

      {tab === "login" ? (
        <form
          action={async (fd) => {
            setLoginError(null);
            const res = await loginAction(fd);
            if (res?.error) setLoginError(res.error);
          }}
          className="space-y-4"
        >
          <Input name="email" type="email" label="E-posta" required autoComplete="email" />
          <Input
            name="password"
            type="password"
            label="Şifre"
            required
            autoComplete="current-password"
          />
          {loginError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{loginError}</p>
          )}
          <Button type="submit" className="w-full" size="lg">
            Giriş Yap
          </Button>
        </form>
      ) : (
        <form
          action={async (fd) => {
            setCorpError(null);
            setCorpMessage(null);
            fd.set("companyType", companyType);
            const res = await corporateApplicationAction(fd);
            if (res?.error) setCorpError(res.error);
            if (res?.success) setCorpMessage(res.success);
          }}
          className="max-h-[70vh] space-y-4 overflow-y-auto pr-1"
        >
          <Input name="displayName" label="Yetkili Ad Soyad" required />
          <Input name="email" type="email" label="E-posta (giriş için)" required />
          <Input name="password" type="password" label="Şifre (min. 6 karakter)" required minLength={6} />

          <fieldset className="space-y-2 rounded-xl border border-slate-200 p-4">
            <legend className="px-1 text-sm font-medium text-slate-700">Şirket Türü</legend>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="companyTypeRadio"
                checked={companyType === "SAHIS"}
                onChange={() => setCompanyType("SAHIS")}
              />
              Şahıs Şirketi
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="companyTypeRadio"
                checked={companyType === "KURUMSAL"}
                onChange={() => setCompanyType("KURUMSAL")}
              />
              Kurumsal (LTD/AŞ)
            </label>
          </fieldset>

          <Input name="officialName" label="Şirket Resmi Unvanı" required />
          <Input name="taxNumber" label="Vergi Numarası / T.C. Kimlik No" required />
          <Input name="taxOffice" label="Vergi Dairesi" required />

          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/80 p-4 text-sm">
            <p className="mb-3 font-semibold text-slate-800">🔒 Hukuki ve yasal evrak yükleme</p>
            <label className="mb-3 block">
              <span className="text-slate-700">1. Güncel Vergi Levhası (PDF/JPG)</span>
              <input name="taxPlate" type="file" accept=".pdf,.jpg,.jpeg,.png" required className="mt-1 block w-full text-xs" />
            </label>
            <label className="mb-3 block">
              <span className="text-slate-700">2. Noter Onaylı İmza Beyanı / Sirküsü</span>
              <input name="signature" type="file" accept=".pdf,.jpg,.jpeg,.png" required className="mt-1 block w-full text-xs" />
            </label>
            <label className="block">
              <span className="text-slate-700">3. Ticaret Gazetesi (LTD/AŞ ise)</span>
              <input name="tradeGazette" type="file" accept=".pdf,.jpg,.jpeg,.png" className="mt-1 block w-full text-xs" />
            </label>
          </div>

          <div className="space-y-2 rounded-xl border border-slate-200 p-4 text-sm">
            <p className="font-semibold text-slate-800">⚖️ Yasal onay metinleri</p>
            <label className="flex gap-2">
              <input name="kvkk" type="checkbox" required className="mt-1" />
              <span>KVKK Aydınlatma Metnini okudum, onaylıyorum.</span>
            </label>
            <label className="flex gap-2">
              <input name="terms" type="checkbox" required className="mt-1" />
              <span>Tekstil360 Kullanıcı ve Aracılık Sözleşmesini okudum, kabul ediyorum.</span>
            </label>
            <label className="flex gap-2">
              <input name="nda" type="checkbox" required className="mt-1" />
              <span>Tasarım ve Kalıp Güvenliği (NDA) Sözleşmesini onaylıyorum.</span>
            </label>
          </div>

          {corpError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{corpError}</p>
          )}
          {corpMessage && (
            <p className="rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-800">{corpMessage}</p>
          )}

          <Button type="submit" className="w-full" size="lg">
            BAŞVURUYU ADMİNE GÖNDER
          </Button>
        </form>
      )}
    </div>
  );
}
