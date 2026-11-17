"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { generateAndCreateLetter } from "@/app/actions/letters";
import Toast from "@/components/ui/toast";
import { generateLetterSchema } from "@/lib/validations/letters";
import type { GenerateLetterInput } from "@/lib/validations/letters";

type SkillOption = { id: string; name: string; category: string };
const inputClass = "mt-1.5 h-11 w-full rounded-lg border border-[#dce2da] bg-white px-3 text-sm outline-none focus:border-[#6b9272] focus:ring-3 focus:ring-[#6b9272]/15";

export default function NewLetterForm({ skills }: { skills: SkillOption[] }) {
  const router = useRouter();
  const [serverMessage, setServerMessage] = useState("");
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<GenerateLetterInput>({
    resolver: zodResolver(generateLetterSchema),
    defaultValues: { type: "APPLICATION", tone: "FORMAL", position: "", company: "", recruiterName: "", city: "", motivation: "", skillIds: [] },
  });
  const skillIds = watch("skillIds");

  async function onSubmit(input: GenerateLetterInput) {
    setServerMessage("");
    const result = await generateAndCreateLetter(input);
    if (!result.success) {
      setServerMessage(result.message);
      return;
    }
    if (!result.id) {
      setServerMessage("La lettre n’a pas pu être créée.");
      return;
    }
    router.push(`/letters/${result.id}`);
  }

  function toggleSkill(id: string, checked: boolean) {
    const next = checked ? [...skillIds, id] : skillIds.filter((item) => item !== id);
    if (next.length <= 3) setValue("skillIds", next, { shouldValidate: true, shouldDirty: true });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-2xl border border-[#e5e9e2] bg-white p-5 shadow-sm sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-semibold">Type de candidature<select {...register("type")} className={inputClass}><option value="APPLICATION">Emploi</option><option value="INTERNSHIP">Stage</option><option value="UNSOLICITED">Candidature spontanée</option></select></label>
        <label className="text-sm font-semibold">Ton<select {...register("tone")} className={inputClass}><option value="FORMAL">Formel</option><option value="DYNAMIC">Dynamique</option><option value="ACADEMIC">Académique</option></select></label>
        <label className="text-sm font-semibold">Poste visé<input {...register("position")} className={inputClass} placeholder="Ex. Assistant comptable" />{errors.position && <span className="mt-1 block text-xs text-[#a34d43]">{errors.position.message}</span>}</label>
        <label className="text-sm font-semibold">Entreprise<input {...register("company")} className={inputClass} placeholder="Nom de l’entreprise" />{errors.company && <span className="mt-1 block text-xs text-[#a34d43]">{errors.company.message}</span>}</label>
        <label className="text-sm font-semibold">Nom du recruteur (facultatif)<input {...register("recruiterName")} className={inputClass} placeholder="Ex. Jean Dupont" /></label>
        <label className="text-sm font-semibold">Ville<input {...register("city")} className={inputClass} placeholder="Ex. Kinshasa" /></label>
      </div>

      <label className="block text-sm font-semibold">Votre motivation (facultatif, 1 à 3 phrases)<textarea {...register("motivation")} rows={3} className="mt-1.5 w-full rounded-lg border border-[#dce2da] bg-white p-3 text-sm outline-none focus:border-[#6b9272] focus:ring-3 focus:ring-[#6b9272]/15" placeholder="Pourquoi cette entreprise ou ce poste vous intéresse ?" />{errors.motivation && <span className="mt-1 block text-xs text-[#a34d43]">{errors.motivation.message}</span>}</label>

      <fieldset>
        <legend className="text-sm font-semibold">Choisissez 3 compétences <span className="font-normal text-[#737b73]">({skillIds.length}/3)</span></legend>
        {skills.length === 0 ? <p className="mt-2 rounded-lg bg-[#f7f8f6] p-3 text-sm text-[#737b73]">Ajoutez des compétences dans votre profil pour générer une lettre.</p> : <div className="mt-3 grid gap-2 sm:grid-cols-2">{skills.map((skill) => <label key={skill.id} className="flex min-h-11 items-center gap-3 rounded-lg border border-[#e5e9e2] px-3 text-sm"><input type="checkbox" checked={skillIds.includes(skill.id)} disabled={!skillIds.includes(skill.id) && skillIds.length >= 3} onChange={(event) => toggleSkill(skill.id, event.target.checked)} className="size-4 accent-[#285c46]" /><span>{skill.name}{skill.category ? <span className="text-[#737b73"> · {skill.category}</span> : null}</span></label>)}</div>}
        {errors.skillIds && <span className="mt-2 block text-xs text-[#a34d43]">{errors.skillIds.message}</span>}
      </fieldset>

      {serverMessage ? <Toast message={serverMessage} onDismiss={() => setServerMessage("")} /> : null}
      <button type="submit" disabled={isSubmitting || skills.length < 3} className="inline-flex min-h-11 items-center rounded-lg bg-[#285c46] px-5 text-sm font-semibold text-white hover:bg-[#214c39] disabled:cursor-not-allowed disabled:opacity-55">{isSubmitting ? "Génération…" : "Générer la lettre"}</button>
    </form>
  );
}
